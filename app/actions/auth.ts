'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { users, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const SignupSchema = z.object({
    name: z.string().max(20),
    email: z.string().email(),
    password: z.string().min(5)
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[0-9]/, "Must contain number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special char"),
});

export async function signup(prevState: string | undefined, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validateFields = SignupSchema.safeParse(rawData);

    if (!validateFields.success) {
        return 'Invalid input fields';
    }

    const { name, email, password } = validateFields.data;

    try {
        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return 'Email already in use.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            passwordHash: hashedPassword,
            role: 'hr', // Default role
        });
    } catch (error) {
        return 'Database Error: Failed to Create User.';
    }

    redirect('/login');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function deleteAccount() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = parseInt(session.user.id);

    try {
        // 1. Delete all jobs owned by user
        // Note: Drizzle schema has `onDelete: 'cascade'` for candidates/evaluations linked to jobs,
        // so deleting jobs *should* clean up everything else.
        await db.delete(jobs).where(eq(jobs.createdBy, userId));

        // 2. Delete the user
        await db.delete(users).where(eq(users.id, userId));

        // 3. Sign out (handled on client after success, or we can throw error to stop execution but here we return success)
        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { error: "Failed to delete account. Please try again." };
    }
}
