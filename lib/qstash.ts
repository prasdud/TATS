import { Client } from "@upstash/qstash";

const client = new Client({
    token: process.env.QSTASH_TOKEN!,
});

const QUEUE_NAME = "tats-processing-queue";

/**
 * Publishes a candidate processing task to QStash via a rate-limited queue.
 * The queue enforces parallelism=1, so candidates are processed one at a time.
 * @param candidateId - The ID of the candidate to process.
 */
export async function publishCandidateProcessing(candidateId: number) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        throw new Error("NEXT_PUBLIC_APP_URL is not defined");
    }

    const url = `${appUrl}/api/process-candidate`;

    console.log(`[QStash] Publishing candidate ${candidateId} to queue '${QUEUE_NAME}'`);

    try {
        // Use queue().enqueue() to enforce FIFO single-concurrency processing
        const queue = client.queue({ queueName: QUEUE_NAME });

        const result = await queue.enqueueJSON({
            url,
            body: { candidateId },
            retries: parseInt(process.env.QSTASH_RETRY_LIMIT || "3"),
        });

        console.log(`[QStash] Enqueued msgId: ${result.messageId}`);
        return result;
    } catch (error) {
        console.error("[QStash] Failed to enqueue task:", error);
        throw error;
    }
}

