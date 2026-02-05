import 'dotenv/config';
import { Client } from '@upstash/qstash';

async function listQueues() {
    const client = new Client({ token: process.env.QSTASH_TOKEN! });
    console.log("Fetching queues...");
    try {
        const queues = await client.queue().list();
        console.log("Queues found:", queues);
    } catch (e) {
        console.error("Failed to list queues:", e);
    }
}

listQueues();
