'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
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
