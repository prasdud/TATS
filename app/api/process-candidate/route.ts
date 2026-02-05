import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates, jobs, evaluations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchRepoMetadata } from "@/lib/github";
import { analyzeCandidate } from "@/lib/ai";

/**
 * Worker endpoint called by QStash to process a single candidate.
 */
async function handler(req: Request) {
    const body = await req.json();
    const { candidateId } = body;

    console.log(`[Worker] Starting processing for candidate ${candidateId}`);

    if (!candidateId) {
        return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    try {
        // 1. Fetch Candidate
        const candidateResult = await db
            .select()
            .from(candidates)
            .where(eq(candidates.id, candidateId))
            .limit(1);

        if (candidateResult.length === 0) {
            console.error(`[Worker] Candidate ${candidateId} not found`);
            return NextResponse.json({ error: "Candidate not found" }, { status: 200 }); // Do not retry
        }

        const candidate = candidateResult[0];

        // 2. Fetch Job (needed for AI)
        const jobResult = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, candidate.jobId))
            .limit(1);

        if (jobResult.length === 0) {
            console.error(`[Worker] Job ${candidate.jobId} not found for candidate ${candidateId}`);
            return NextResponse.json({ error: "Job not found" }, { status: 200 }); // Do not retry
        }
        const job = jobResult[0];

        // 3. Update Status to Processing
        await db
            .update(candidates)
            .set({ status: "processing" })
            .where(eq(candidates.id, candidateId));

        // 4. Rate Limit Safety (Cohere Trial = 20/min)
        await new Promise((r) => setTimeout(r, 4000));

        // 5. Fetch GitHub Data
        let repoData;
        try {
            repoData = await fetchRepoMetadata(candidate.githubUrl);
        } catch (e) {
            // GitHub API failure (network/rate limit)
            console.error(`[Worker] GitHub Fetch Error:`, e);
            throw e; // Let QStash retry
        }

        if (!repoData) {
            // Invalid URL or 404 - Permanent failure
            console.log(`[Worker] Candidate ${candidateId}: Invalid GitHub URL`);
            await db.update(candidates).set({ status: "github_failed" }).where(eq(candidates.id, candidateId));

            await db.insert(evaluations).values({
                candidateId: candidate.id,
                signals: JSON.stringify(["Invalid or private GitHub URL"]),
                aiExplanation: "Could not access repository metadata.",
            });

            return NextResponse.json({ success: true, result: "github_failed" });
        }

        // 6. AI Analysis
        let analysis;
        try {
            analysis = await analyzeCandidate(candidate.name, repoData, job.description);
        } catch (e) {
            console.error(`[Worker] AI Analysis Error:`, e);
            // Cohere API down?
            throw e; // Let QStash retry
        }

        // 7. Update Final Status
        console.log(`[Worker] Candidate ${candidateId} analysis result: ${analysis.screeningStatus}`);

        // Cast analysis.screeningStatus to 'status' enum type (they match)
        await db
            .update(candidates)
            .set({ status: analysis.screeningStatus as any })
            .where(eq(candidates.id, candidateId));

        // 8. Save Evaluation
        await db.insert(evaluations).values({
            candidateId: candidate.id,
            signals: analysis.signals,
            aiExplanation: analysis.aiExplanation,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(`[Worker] Unexpected error for candidate ${candidateId}:`, error);

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const POST = verifySignatureAppRouter(handler);
