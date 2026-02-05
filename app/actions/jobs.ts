'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { jobs, candidates, type NewCandidate } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateJobSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
});

export async function getJobs() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const userJobs = await db.select()
            .from(jobs)
            .where(eq(jobs.createdBy, parseInt(session.user.id)))
            .orderBy(desc(jobs.createdAt));
        return userJobs;
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return [];
    }
}

export async function createJob(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return "Unauthorized";

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = CreateJobSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return "Invalid Fields: " + JSON.stringify(validatedFields.error.flatten());
    }

    const { title, description } = validatedFields.data;

    try {
        const result = await db.insert(jobs).values({
            title,
            description,
            createdBy: parseInt(session.user.id),
        }).returning({ id: jobs.id, title: jobs.title, createdAt: jobs.createdAt, description: jobs.description, createdBy: jobs.createdBy });

        revalidatePath('/dashboard/jobs');
        revalidatePath('/dashboard');
        return { success: true, job: result[0] };
    } catch (error) {
        console.error("Failed to create job:", error);
        return { error: "Database Error: Failed to Create Job." };
    }
}

// Bulk add candidates
import { publishCandidateProcessing } from '@/lib/qstash';

export async function addCandidates(jobId: number, newCandidates: Omit<NewCandidate, 'jobId' | 'id' | 'createdAt' | 'status' | 'finalDisposition'>[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const candidatesToInsert = newCandidates.map(c => ({
            ...c,
            jobId: jobId,
            status: "pending" as const, // Default for QStash
            finalDisposition: null,
        }));

        const insertedCandidates = await db.insert(candidates).values(candidatesToInsert as NewCandidate[]).returning({ id: candidates.id });

        // Trigger QStash for each candidate
        // background "fire and forget" or await?
        // Ideally await to ensure we don't lose them if server kills non-awaited promises?
        // But QStash publish is fast.

        // We can do Promise.all
        const publishPromises = insertedCandidates.map(c => publishCandidateProcessing(c.id));
        await Promise.allSettled(publishPromises); // Don't fail the whole request if one publish fails?
        // Actually, if publish fails, they stay "pending".
        // User can retry later (we need a retry UI but that's out of scope for now, just best effort).

        revalidatePath('/dashboard/jobs');
        revalidatePath('/dashboard/triage'); // Update triage page too
        return { success: true };
    } catch (error) {
        console.error("Failed to add candidates:", error);
        return { error: "Failed to add candidates." };
    }
}
