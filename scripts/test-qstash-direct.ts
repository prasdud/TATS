import 'dotenv/config';
import { Client } from "@upstash/qstash";

async function test() {
    console.log("Testing QStash connection (Direct)...");
    const client = new Client({
        token: process.env.QSTASH_TOKEN!,
    });

    try {
        const result = await client.publishJSON({
            url: "https://httpbin.org/post", // Valid public URL
            body: { test: "data" },
        });
        console.log("Success! Message ID:", result.messageId);

        const fs = require('fs');
        fs.writeFileSync('qstash_test_result.txt', `Success: ${result.messageId}`);

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);

        const fs = require('fs');
        fs.writeFileSync('qstash_test_result.txt', `Failed: ${error}`);

        process.exit(1);
    }
}

test();
