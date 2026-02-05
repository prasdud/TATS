# QStash Working Documentation

This document explains how QStash is integrated into TATS for background candidate processing.

---

## Overview

**QStash** is a serverless message queue by Upstash. We use it to:
1. Decouple candidate uploads from processing.
2. Process candidates asynchronously in the background.
3. Handle retries automatically if processing fails.

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

    User uploads CSV
           │
           ▼
┌─────────────────────┐
│  AddCandidatesForm  │  (Client Component)
│  - Parses CSV       │
│  - Calls addCandidates()
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  addCandidates()    │  (Server Action: app/actions/jobs.ts)
│  - Inserts to DB    │
│    with status:     │
│    'pending'        │
│  - Returns inserted │
│    candidate IDs    │
└──────────┬──────────┘
           │
           │  For each candidate:
           ▼
┌─────────────────────┐
│ publishCandidate-   │  (lib/qstash.ts)
│ Processing()        │
│  - Publishes to     │
│    QStash queue     │
│  - Payload:         │
│    { candidateId }  │
└──────────┬──────────┘
           │
           │  QStash stores message
           ▼
┌─────────────────────┐
│    QStash Cloud     │
│  - Manages queue    │
│  - Handles retries  │
│  - Delivers to      │
│    your endpoint    │
└──────────┬──────────┘
           │
           │  HTTP POST with signature
           ▼
┌─────────────────────────────────────────┐
│  /api/process-candidate                 │  (Worker Endpoint)
│  (app/api/process-candidate/route.ts)   │
│                                         │
│  1. Verify QStash signature             │
│  2. Parse candidateId from body         │
│  3. Fetch candidate from DB             │
│  4. Update status → 'processing'        │
│  5. Fetch GitHub metadata               │
│  6. Call Cohere AI for analysis         │
│  7. Update status → final result        │
│     (looks_fine/needs_review/etc)       │
│  8. Save evaluation to DB               │
└─────────────────────────────────────────┘
           │
           │  Meanwhile, user sees:
           ▼
┌─────────────────────┐
│   Triage Page       │  (app/dashboard/triage/page.tsx)
│  - Polls every 3s   │
│  - Shows status     │
│    updates live     │
└─────────────────────┘
```

---

## Key Files

### 1. `lib/qstash.ts` - QStash Client Helper

```typescript
import { Client } from '@upstash/qstash';

// Initialize client with token from environment
const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!,
});

// Function to publish a candidate processing job
export async function publishCandidateProcessing(candidateId: number) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    await qstashClient.publishJSON({
        url: `${appUrl}/api/process-candidate`,  // Your worker endpoint
        body: { candidateId },                    // Payload
    });
}
```

**How it works:**
- Creates a QStash client using your `QSTASH_TOKEN`.
- `publishJSON` sends a message to QStash with:
  - `url`: The endpoint QStash will call (your worker).
  - `body`: The JSON payload (candidate ID).

---

### 2. `app/api/process-candidate/route.ts` - Worker Endpoint

```typescript
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { db } from '@/lib/db';
import { candidates, jobs, evaluations } from '@/lib/db/schema';
import { fetchRepoMetadata } from '@/lib/github';
import { analyzeCandidate } from '@/lib/ai';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function handler(request: Request) {
    // 1. Parse the request body
    const { candidateId } = await request.json();
    
    // 2. Fetch candidate from DB
    const candidate = await db.select()...
    
    // 3. Update status to 'processing'
    await db.update(candidates)
        .set({ status: 'processing' })
        .where(eq(candidates.id, candidateId));
    
    // 4. Do the heavy lifting
    const githubData = await fetchRepoMetadata(candidate.githubUrl);
    const aiResult = await analyzeCandidate(githubData, jobDescription);
    
    // 5. Update with final status
    await db.update(candidates)
        .set({ status: aiResult.decision })
        .where(eq(candidates.id, candidateId));
    
    // 6. Save evaluation details
    await db.insert(evaluations).values({...});
    
    return NextResponse.json({ success: true });
}

// Wrap with QStash signature verification
export const POST = verifySignatureAppRouter(handler);
```

**Key Points:**
- `verifySignatureAppRouter` is middleware that validates the request came from QStash.
- It uses `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` from your `.env`.
- If verification fails, it returns 401 Unauthorized.
- If your handler throws an error, QStash will retry automatically.

---

### 3. `app/actions/jobs.ts` - Trigger Point

```typescript
export async function addCandidates(jobId: number, newCandidates: ...[]) {
    // 1. Insert candidates with 'pending' status
    const insertedCandidates = await db.insert(candidates)
        .values(candidatesToInsert)
        .returning({ id: candidates.id });
    
    // 2. Enqueue each for background processing
    const publishPromises = insertedCandidates.map(c => 
        publishCandidateProcessing(c.id)
    );
    await Promise.allSettled(publishPromises);
    
    return { success: true };
}
```

**Flow:**
1. User uploads CSV → Calls `addCandidates()`.
2. Candidates inserted into DB with `status: 'pending'`.
3. Each candidate ID is published to QStash.
4. User is redirected to Triage page immediately (no waiting).

---

### 4. `app/dashboard/triage/_components/TriageProcessor.tsx` - UI Polling

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TriageProcessor({ initialPendingCount }) {
    const router = useRouter();

    useEffect(() => {
        if (initialPendingCount > 0) {
            // Poll every 3 seconds
            const interval = setInterval(() => {
                router.refresh();  // Re-fetches server component data
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [initialPendingCount, router]);

    // Show spinner while processing
    if (initialPendingCount === 0) return null;
    return <div>Processing {initialPendingCount} candidates...</div>;
}
```

**How it works:**
- When there are pending candidates, it polls every 3 seconds.
- `router.refresh()` triggers a server-side re-render, fetching fresh DB data.
- As candidates complete, they move from "Pending" to their final status column.

---

## Environment Variables

Add these to your `.env`:

```env
# QStash Credentials (from Upstash Console)
QSTASH_TOKEN=your_qstash_token_here
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxxxx
QSTASH_NEXT_SIGNING_KEY=sig_yyyyyyyy

# Your app URL (used to construct worker endpoint URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Where to get these:**
1. Go to [console.upstash.com](https://console.upstash.com)
2. Navigate to QStash section
3. Copy your token and signing keys

---

## Status Flow (Database)

```
┌──────────┐     ┌────────────┐     ┌─────────────────┐
│ pending  │ ──▶ │ processing │ ──▶ │ Final Status    │
└──────────┘     └────────────┘     │ - looks_fine    │
                                    │ - needs_review  │
                                    │ - low_effort    │
                                    │ - github_failed │
                                    │ - ai_failed     │
                                    │ - unknown_failed│
                                    └─────────────────┘
```

**Status meanings:**
- `pending`: Just uploaded, waiting in QStash queue.
- `processing`: Worker picked it up, currently analyzing.
- `looks_fine`: Passed all checks.
- `needs_review`: Mixed signals, human review recommended.
- `low_effort`: Failed basic quality checks.
- `github_failed`: Could not fetch GitHub data (invalid URL, private repo, etc.).
- `ai_failed`: Cohere API call failed.
- `unknown_failed`: Unexpected error during processing.

---

## Error Handling & Retries

### Transient Errors (Retried by QStash)
If your worker throws an error (e.g., network timeout), QStash will retry automatically.

```typescript
// This will cause a retry
throw new Error("Temporary failure");
```

### Permanent Errors (No Retry)
For errors that shouldn't be retried (e.g., invalid GitHub URL), we update the DB and return success to QStash:

```typescript
if (error.message.includes('Could not find')) {
    await db.update(candidates)
        .set({ status: 'github_failed' })
        .where(eq(candidates.id, candidateId));
    
    return NextResponse.json({ success: true }); // Consume the message
}
```

---

## Local Development

**Problem:** QStash is a cloud service and cannot reach `localhost`.

**Solutions:**

1. **Use ngrok:**
   ```bash
   ngrok http 3000
   ```
   Then set `NEXT_PUBLIC_APP_URL=https://xxxx.ngrok.io` in `.env`.

2. **Deploy to Vercel:**
   Push to your repo and Vercel will deploy. QStash can reach your production URL.

3. **Mock locally:**
   Create a test script that calls `/api/process-candidate` directly with a fake signature (for development only, disable signature verification temporarily).

---

## Security

1. **Signature Verification:** All incoming requests to `/api/process-candidate` are verified using QStash's signing keys. This prevents unauthorized calls.

2. **No Auth Bypass:** The worker endpoint doesn't use session auth (since QStash calls it, not a user). Security is enforced via signature verification.

3. **Environment Variables:** Keep your `QSTASH_TOKEN` and signing keys secret. Never commit them to git.

---

## Summary

| Component | Purpose |
|-----------|---------|
| `lib/qstash.ts` | Publishes jobs to QStash queue |
| `/api/process-candidate` | Worker that processes candidates |
| `addCandidates()` | Inserts candidates and triggers queue |
| `TriageProcessor` | Polls for status updates |
| QStash Cloud | Manages queue, delivery, retries |
