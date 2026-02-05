import { Client } from "@upstash/qstash";

const client = new Client({
    token: process.env.QSTASH_TOKEN!,
});

/**
 * Publishes a candidate processing task to QStash.
 * @param candidateId - The ID of the candidate to process.
 */
export async function publishCandidateProcessing(candidateId: number) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        throw new Error("NEXT_PUBLIC_APP_URL is not defined");
    }

    // Construct the absolute URL for the worker endpoint
    const url = `${appUrl}/api/process-candidate`;

    console.log(`[QStash] Publishing processing task for candidate ${candidateId} to ${url}`);

    try {
        const result = await client.publishJSON({
            url,
            body: { candidateId },
            retries: 3, // Retry up to 3 times on failure
        });
        console.log(`[QStash] Published msgId: ${result.messageId}`);
        return result;
    } catch (error) {
        console.error("[QStash] Failed to publish task:", error);
        throw error;
    }
}
