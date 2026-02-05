import 'dotenv/config';
import { publishCandidateProcessing } from '../lib/qstash';

async function test() {
    const token = process.env.QSTASH_TOKEN || "MISSING";
    // Safe logging of token
    console.log("Token starts with:", token.substring(0, 4));

    const fs = require('fs');
    fs.writeFileSync('qstash_debug.txt', `Token: ${token.substring(0, 4)}... length: ${token.length}\n`);

    console.log("Testing QStash connection...");
    try {
        const result = await publishCandidateProcessing(99999); // Dummy ID
        console.log("Success! Message ID:", result.messageId);

        fs.appendFileSync('qstash_debug.txt', `Success: ${result.messageId}\n`);
        fs.writeFileSync('qstash_test_result.txt', `Success: ${result.messageId}`);

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);

        fs.appendFileSync('qstash_debug.txt', `Failed: ${error}\n`);
        fs.writeFileSync('qstash_test_result.txt', `Failed: ${error}`);

        process.exit(1);
    }
}

test();
