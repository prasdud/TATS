'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { jobs, candidates, evaluations } from '@/lib/db/schema';
import { eq, and, isNull, count } from 'drizzle-orm';
import { fetchRepoMetadata } from '@/lib/github';
import { analyzeCandidate } from '@/lib/ai';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function processTriageQueue(jobId: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // 1. Fetch Job Description
        const jobResult = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
        if (jobResult.length === 0) return { error: "Job not found" };
        const job = jobResult[0];

        // 2. Fetch Pending Candidates (Where screeningStatus is NULL)
        // Limit to 5 at a time for this simplified version to avoid timeout
        const pendingCandidates = await db.select()
            .from(candidates)
            .where(
                and(
                    eq(candidates.jobId, jobId),
                    isNull(candidates.screeningStatus)
                )
            )
            .limit(5);

        if (pendingCandidates.length === 0) {
            return { message: "No pending candidates to triage." };
        }

        // 3. Process each candidate
        let processedCount = 0;

        for (const candidate of pendingCandidates) {
            console.log(`Processing candidate: ${candidate.name} (${candidate.githubUrl})`);

            // A. Fetch GitHub Metadata
            const repoData = await fetchRepoMetadata(candidate.githubUrl);

            if (!repoData) {
                // If invalid repo, mark as Needs Review
                await db.update(candidates)
                    .set({ screeningStatus: 'needs_review' })
                    .where(eq(candidates.id, candidate.id));

                // Create dummy evaluation
                await db.insert(evaluations).values({
                    candidateId: candidate.id,
                    signals: JSON.stringify(["Invalid or private GitHub URL"]),
                    aiExplanation: "Could not access repository metadata."
                });
                continue;
            }

            // B. AI Analysis
            const analysis = await analyzeCandidate(candidate.name, repoData, job.description);

            // C. Update Candidate Status
            await db.update(candidates)
                .set({ screeningStatus: analysis.screeningStatus as any }) // Type cast for enum
                .where(eq(candidates.id, candidate.id));

            // D. Save Evaluation
            await db.insert(evaluations).values({
                candidateId: candidate.id,
                signals: analysis.signals,
                aiExplanation: analysis.aiExplanation
            });

            processedCount++;
        }

        // Check remaining
        const remainingResult = await db.select({ value: count() })
            .from(candidates)
            .where(
                and(
                    eq(candidates.jobId, jobId),
                    isNull(candidates.screeningStatus)
                )
            );
        const remaining = remainingResult[0].value;

        // revalidateTag('triage-data');
        revalidatePath('/dashboard/triage');
        return { success: true, count: processedCount, remaining };

    } catch (error) {
        console.error("Triage Processing Failed:", error);
        return { error: "Processing failed." };
    }
}
