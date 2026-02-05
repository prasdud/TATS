'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface TriageProcessorProps {
    jobId: number;
    initialPendingCount: number;
}

export function TriageProcessor({ jobId, initialPendingCount }: TriageProcessorProps) {
    const router = useRouter();

    useEffect(() => {
        // Poll every 3 seconds if there are pending items
        if (initialPendingCount > 0) {
            const interval = setInterval(() => {
                router.refresh(); // Fetch fresh data from server
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [initialPendingCount, router]);

    if (initialPendingCount === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="bg-md-primary-container text-md-on-primary-container shadow-xl rounded-full px-6 py-4 flex items-center gap-4 border border-md-primary/10 transition-all hover:scale-105 cursor-default">
                <div className="relative flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {initialPendingCount}
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="font-bold text-lg leading-tight">
                        Processing...
                    </p>
                    <p className="text-sm opacity-80 font-medium">
                        {initialPendingCount} candidates remaining
                    </p>
                </div>
            </div>
        </div>
    );
}
