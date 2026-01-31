'use client';

import { useState } from 'react';
import { Loader2, X, BrainCircuit, FileText } from 'lucide-react';
import { type Candidate } from '@/lib/db/schema';

type CandidateWithEval = Candidate & {
    aiExplanation: string | null;
    signals: string | null; // JSON string
};

export function CandidateCard({ candidate, isPending }: { candidate: CandidateWithEval | any, isPending?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse signals if safe
    let signalsList: string[] = [];
    try {
        if (candidate.signals) {
            signalsList = JSON.parse(candidate.signals);
        }
    } catch (e) { /* ignore */ }

    if (isPending) {
        return (
            <div className="p-4 rounded-xl border border-dashed border-md-outline/30 bg-md-surface/50 opacity-70">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-md-on-surface truncate pr-2">{candidate.name}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-md-on-surface-variant mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="group p-4 rounded-xl border border-md-outline/10 bg-md-surface shadow-sm transition-all hover:shadow-md hover:border-md-primary/30 cursor-pointer relative overflow-hidden"
            >
                {/* Visual indicator on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-md-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-md-on-surface truncate pr-2">{candidate.name}</h4>
                    <span className="text-xs text-md-primary bg-md-primary/5 px-2 py-0.5 rounded-full font-medium group-hover:bg-md-primary/10 transition-colors">View AI</span>
                </div>
                <p className="text-xs text-md-on-surface-variant truncate mb-2">{candidate.email}</p>
                <div className="flex gap-2 mt-3">
                    <a
                        href={candidate.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()} // Don't trigger modal
                        className="text-xs flex items-center gap-1 text-md-on-surface-variant hover:text-md-primary z-10 relative"
                    >
                        GitHub ↗
                    </a>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-md-surface rounded-[24px] max-w-lg w-full shadow-2xl border border-md-outline/10 overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-md-outline/10 flex justify-between items-start bg-md-surface-container-low">
                            <div>
                                <h2 className="text-headline-small font-bold text-md-on-surface mb-1 flex items-center gap-2">
                                    <BrainCircuit className="w-6 h-6 text-md-primary" />
                                    AI Report
                                </h2>
                                <p className="text-body-medium text-md-on-surface-variant">Analysis for {candidate.name}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-md-on-surface/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-md-on-surface-variant" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                            {/* Explanation */}
                            <div>
                                <h3 className="text-title-small font-bold text-md-on-surface mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Summary
                                </h3>
                                <div className="p-4 rounded-xl bg-md-surface-container border border-md-outline/10 text-md-on-surface text-sm leading-relaxed">
                                    {candidate.aiExplanation || "No explanation provided."}
                                </div>
                            </div>

                            {/* Signals */}
                            {signalsList.length > 0 && (
                                <div>
                                    <h3 className="text-title-small font-bold text-md-on-surface mb-2">Key Signals</h3>
                                    <ul className="space-y-2">
                                        {signalsList.map((signal, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-md-on-surface-variant">
                                                <span className="text-md-primary font-bold">•</span>
                                                {signal}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Raw Data Link */}
                            <div className="pt-4 border-t border-md-outline/10">
                                <a
                                    href={candidate.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center w-full h-10 rounded-full bg-md-primary text-md-on-primary font-medium hover:bg-md-primary/90 transition-all"
                                >
                                    Verify on GitHub
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Backdrop Click to Close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
}
