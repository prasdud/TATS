'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { processTriageQueue } from '@/app/actions/process-triage';

interface TriageProcessorProps {
    jobId: number;
    initialPendingCount: number;
}

export function TriageProcessor({ jobId, initialPendingCount }: TriageProcessorProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [showRefreshMessage, setShowRefreshMessage] = useState(false);
    const hasRefreshedRef = useRef(false);

    // 1. HARD REFRESH LOGIC (Keep existing logic)
    useEffect(() => {
        const storageKey = `triage_hard_refresh_${jobId}`;
        const lastRefresh = sessionStorage.getItem(storageKey);
        const now = Date.now();

        if (hasRefreshedRef.current) return;

        if (!lastRefresh || (now - parseInt(lastRefresh) > 5000)) {
            console.log("FORCE REFRESH: Triggering window.location.reload()");
            sessionStorage.setItem(storageKey, now.toString());
            hasRefreshedRef.current = true;
            window.location.reload();
        } else {
            console.log("FORCE REFRESH: Skipped (recently refreshed)");
        }
    }, [jobId]);

    // 2. TOGGLE MESSAGE LOGIC (New)
    useEffect(() => {
        if (!isProcessing && initialPendingCount === 0) return;

        const interval = setInterval(() => {
            setShowRefreshMessage(prev => !prev);
        }, 10000); // Toggle every 10 seconds

        return () => clearInterval(interval);
    }, [isProcessing, initialPendingCount]);

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
                // Process a batch
                const result = await processTriageQueue(jobId);

                if (result.error) {
                    console.error("Triage Error:", result.error);
                    keepProcessing = false;
                } else {
                    if (result.count) {
                        setProcessedCount(prev => prev + result.count);
                    }

                    // Refresh Server Component
                    router.refresh();

                    if (!result.remaining || result.remaining === 0) {
                        keepProcessing = false;
                    } else {
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
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="bg-md-primary-container text-md-on-primary-container shadow-xl rounded-full px-6 py-4 flex items-center gap-4 border border-md-primary/10 transition-all hover:scale-105 cursor-pointer">
                <div className="relative flex items-center justify-center">
                    {showRefreshMessage ? (
                        <RefreshCw className="w-8 h-8 animate-spin duration-[3000ms]" />
                    ) : (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    )}

                    {!showRefreshMessage && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                            {initialPendingCount}
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    <p className="font-bold text-lg leading-tight">
                        {showRefreshMessage ? "Changes Detected" : "AI is Triaging..."}
                    </p>
                    <p className="text-sm opacity-80 font-medium">
                        {showRefreshMessage ? "Please refresh manually if needed" : `${initialPendingCount} candidates remaining`}
                    </p>
                </div>
            </div>
        </div>
    );
}
