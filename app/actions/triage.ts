import { auth } from '@/auth';
import { db } from '@/lib/db';
import { jobs, candidates, evaluations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// Cached raw data fetcher
const getCachedJobAndCandidates = unstable_cache(
    async (userId: number, jobId?: number) => {
        let job;

        if (jobId) {
            const result = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
            if (result.length > 0) job = result[0];
        }

        if (!job) {
            // Default to latest
            const latestJob = await db.select()
                .from(jobs)
                .where(eq(jobs.createdBy, userId))
                .orderBy(desc(jobs.createdAt))
                .limit(1);
            if (latestJob.length > 0) job = latestJob[0];
        }

        if (!job) return null;
        if (job.createdBy !== userId) return null;

        // Get candidates with evaluation data
        const rows = await db.select()
            .from(candidates)
            .leftJoin(evaluations, eq(evaluations.candidateId, candidates.id))
            .where(eq(candidates.jobId, job.id));

        return { job, rows };
    },
    ['triage-data'], // Base tag
    { tags: ['triage-data'] }
);

export async function getTriageJobs() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        return await db.select({
            id: jobs.id,
            title: jobs.title,
            createdAt: jobs.createdAt
        })
            .from(jobs)
            .where(eq(jobs.createdBy, parseInt(session.user.id)))
            .orderBy(desc(jobs.createdAt));
    } catch (error) {
        console.error("Failed to fetch triage jobs:", error);
        return [];
    }
}

export async function getTriageData(jobId?: number) {
    const session = await auth();
    if (!session?.user?.id) return null;
    const userId = parseInt(session.user.id);

    try {
        // Use cached fetcher
        const data = await getCachedJobAndCandidates(userId, jobId);

        if (!data) return null;
        const { job, rows } = data;

        const jobCandidates = rows.map(row => ({
            ...row.candidates,
            aiExplanation: row.evaluations?.aiExplanation || null,
            signals: row.evaluations?.signals || null,
        }));

        return { job, candidates: jobCandidates };
    } catch (error) {
        console.error("Failed to fetch triage data:", error);
        return null;
    }
}
