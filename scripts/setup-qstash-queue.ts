/**
 * Setup QStash Queue
 * 
 * Creates or updates a queue to enforce concurrency limits.
 * This prevents rate-limiting issues with third-party APIs (Cohere, GitHub).
 * 
 * Usage: npx tsx scripts/setup-qstash-queue.ts
 * 
 * Environment Variables:
 *   QSTASH_TOKEN       - Required. Your QStash API token.
 *   QSTASH_PARALLELISM - Optional. Number of concurrent workers (default: 1).
 */

import 'dotenv/config';
import { Client } from '@upstash/qstash';

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const PARALLELISM = parseInt(process.env.QSTASH_PARALLELISM || "1");

if (!QSTASH_TOKEN) {
    console.error("❌ QSTASH_TOKEN is missing in .env");
    process.exit(1);
}

if (PARALLELISM < 1 || PARALLELISM > 100) {
    console.error("❌ QSTASH_PARALLELISM must be between 1 and 100");
    process.exit(1);
}

const client = new Client({ token: QSTASH_TOKEN });
const QUEUE_NAME = "tats-processing-queue";

async function setupQueue() {
    console.log(`\n🔧 Setting up QStash Queue: ${QUEUE_NAME}...`);
    console.log(`   Parallelism: ${PARALLELISM}`);

    try {
        const queue = client.queue({ queueName: QUEUE_NAME });

        await queue.upsert({
            parallelism: PARALLELISM,
        });

        console.log(`\n✅ Queue '${QUEUE_NAME}' configured with parallelism: ${PARALLELISM}`);

        if (PARALLELISM === 1) {
            console.log(`   Candidates will be processed ONE AT A TIME.`);
        } else {
            console.log(`   Up to ${PARALLELISM} candidates will be processed in parallel.`);
        }
        console.log();
    } catch (error: any) {
        console.error("❌ Failed to set up queue:", error.message || error);

        if (error.status === 401) {
            console.error("   (Check your QSTASH_TOKEN access)");
        }
        process.exit(1);
    }
}

setupQueue();

