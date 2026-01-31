'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { processTriageQueue } from '@/app/actions/process-triage';

interface TriageProcessorProps {
    jobId: number;
    initialPendingCount: number;
}

export function TriageProcessor({ jobId, initialPendingCount }: TriageProcessorProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);

    useEffect(() => {
        // Only start if we have pending items and aren't already running
        if (initialPendingCount > 0 && !isProcessing) {
            startProcessingLoop();
        }
    }, [initialPendingCount]);

    const startProcessingLoop = async () => {
        setIsProcessing(true);

        let keepProcessing = true;
        while (keepProcessing) {
            try {
                // 1. Process a batch
                const result = await processTriageQueue(jobId);

                if (result.error) {
                    console.error("Triage Error:", result.error);
                    keepProcessing = false; // Stop on error
                } else {
                    // 2. Update processed count for UI feedback
                    if (result.count) {
                        setProcessedCount(prev => prev + result.count);
                    }

                    // 3. Refresh the Server Component to show new cards
                    router.refresh();

                    // 4. Decided whether to continue
                    if (!result.remaining || result.remaining === 0) {
                        keepProcessing = false;
                    } else {
                        // Small delay to prevent UI jitter
                        await new Promise(r => setTimeout(r, 500));
                    }
                }
            } catch (e) {
                console.error("Loop Error:", e);
                keepProcessing = false;
            }
        }

        setIsProcessing(false);
    };

    if (!isProcessing && initialPendingCount === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-md-surface-container-high border border-md-outline/10 shadow-lg rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 z-50">
            <div className="relative">
                <Loader2 className="w-8 h-8 text-md-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-md-primary">
                    {initialPendingCount}
                </div>
            </div>
            <div>
                <p className="font-bold text-md-on-surface text-sm">AI is Triaging...</p>
                <p className="text-xs text-md-on-surface-variant">
                    {initialPendingCount} remaining
                </p>
            </div>
        </div>
    );
}
