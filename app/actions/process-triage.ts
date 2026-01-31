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

        // 2. ATOMIC CLAIM: Try to lock one candidate
        // First, find a candidate ID to target
        const candidateToLockResult = await db.select({ id: candidates.id })
            .from(candidates)
            .where(
                and(
                    eq(candidates.jobId, jobId),
                    isNull(candidates.screeningStatus)
                )
            )
            .limit(1);

        if (candidateToLockResult.length === 0) {
            return { message: "No pending candidates to triage.", count: 0, remaining: 0 };
        }

        const targetId = candidateToLockResult[0].id;

        // Try to "claim" this candidate by setting status to 'needs_review' (temporary lock)
        // This ensures only ONE thread gets this specific candidate.
        const claimedCandidates = await db.update(candidates)
            .set({ screeningStatus: 'needs_review' })
            .where(
                and(
                    eq(candidates.id, targetId),
                    isNull(candidates.screeningStatus) // Crucial concurrent check
                )
            )
            .returning();

        // If we failed to claim (another thread won this specific ID), return
        if (claimedCandidates.length === 0) {
            // Check remaining count for UI correctness
            const remainingCheck = await db.select({ value: count() })
                .from(candidates)
                .where(and(eq(candidates.jobId, jobId), isNull(candidates.screeningStatus)));
            return { success: true, count: 0, remaining: remainingCheck[0].value };
        }

        const candidate = claimedCandidates[0];
        console.log(`Processing candidate (Claimed): ${candidate.name} (${candidate.githubUrl})`);

        // 0. Rate Limit Safety (Cohere Trial = 20/min)
        await new Promise(r => setTimeout(r, 4000));

        // A. Fetch GitHub Metadata
        const repoData = await fetchRepoMetadata(candidate.githubUrl);

        if (!repoData) {
            // Already set to 'needs_review', just add the evaluation note
            await db.insert(evaluations).values({
                candidateId: candidate.id,
                signals: JSON.stringify(["Invalid or private GitHub URL"]),
                aiExplanation: "Could not access repository metadata."
            });
            // We are done with this one
        } else {
            // B. AI Analysis
            const analysis = await analyzeCandidate(candidate.name, repoData, job.description);

            // C. Update Candidate Status (Final)
            await db.update(candidates)
                .set({ screeningStatus: analysis.screeningStatus as any })
                .where(eq(candidates.id, candidate.id));

            // D. Save Evaluation
            await db.insert(evaluations).values({
                candidateId: candidate.id,
                signals: analysis.signals,
                aiExplanation: analysis.aiExplanation
            });
        }

        // Check remaining (for UI loop)
        const remainingResult = await db.select({ value: count() })
            .from(candidates)
            .where(
                and(
                    eq(candidates.jobId, jobId),
                    isNull(candidates.screeningStatus)
                )
            );
        const remaining = remainingResult[0].value;

        // revalidateTag('triage-data'); // Not needed, cache removed
        revalidatePath('/dashboard/triage');
        return { success: true, count: 1, remaining };

    } catch (error) {
        console.error("Triage Processing Failed:", error);
        return { error: "Processing failed." };
    }
}
