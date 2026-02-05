'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { jobs, candidates } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllCandidates() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        // Join candidates with jobs to filter by user and show job title
        const results = await db.select({
            id: candidates.id,
            name: candidates.name,
            email: candidates.email,
            githubUrl: candidates.githubUrl,
            status: candidates.status,
            finalDisposition: candidates.finalDisposition,
            createdAt: candidates.createdAt,
            jobTitle: jobs.title,
        })
            .from(candidates)
            .innerJoin(jobs, eq(candidates.jobId, jobs.id))
            .where(eq(jobs.createdBy, parseInt(session.user.id)))
            .orderBy(desc(candidates.createdAt));

        return results;
    } catch (error) {
        console.error("Failed to fetch all candidates:", error);
        return [];
    }
}
