'use server';

import { Resend } from 'resend';
import { getCompletionEmailHtml } from './email-templates';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Sends a completion email when all candidates have been processed.
 * @param userEmail - The email address of the user to notify.
 */
export async function sendCompletionEmail(userEmail: string) {
    if (!resend) {
        console.warn("[Email] RESEND_API_KEY not configured. Skipping email.");
        return { success: false, reason: "No API key" };
    }

    if (!userEmail) {
        console.warn("[Email] No user email provided. Skipping email.");
        return { success: false, reason: "No email" };
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/triage`;

    try {
        const result = await resend.emails.send({
            from: 'TATS <notifications@resend.dev>',
            to: userEmail,
            subject: '✅ All candidates have been processed!',
            html: getCompletionEmailHtml(dashboardUrl)
        });

        console.log(`[Email] Sent completion email to ${userEmail}`, result);
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error("[Email] Failed to send email:", error);
        return { success: false, reason: "Send failed" };
    }
}