'use client';

import { useState, useCallback } from 'react';
import { Loader2, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';
import { addCandidates } from '@/app/actions/jobs';
import { processTriageQueue } from '@/app/actions/process-triage';
import Papa from 'papaparse';
import type { Job } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';

interface AddCandidatesFormProps {
    job: Job;
    onComplete: () => void;
}

interface CandidateInput {
    name: string;
    email: string;
    githubUrl: string;
    resumeText: string;
}

export function AddCandidatesForm({ job, onComplete }: AddCandidatesFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    // Manual Input State
    const [manualEntry, setManualEntry] = useState<CandidateInput>({ name: "", email: "", githubUrl: "", resumeText: "" });

    // CSV State
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [parsedCount, setParsedCount] = useState(0);

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setManualEntry({ ...manualEntry, [e.target.name]: e.target.value });
    };

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === "text/csv") {
            setCsvFile(file);
            parseCSV(file);
        } else {
            setError("Please upload a valid CSV file.");
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            parseCSV(file);
        }
    };

    const parseCSV = (file: File) => {
        setStatus("parsing");
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                setParsedCount(results.data.length);
                setStatus("idle");
                setError("");
            },
            error: (err) => {
                setError("Failed to parse CSV: " + err.message);
                setStatus("error");
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus("uploading");
        setError("");

        let candidatesToUpload: CandidateInput[] = [];

        // 1. Add manual entry if filled
        if (manualEntry.name && manualEntry.email) {
            candidatesToUpload.push(manualEntry);
        }

        // 2. Add CSV entries if file exists
        if (csvFile) {
            await new Promise<void>((resolve, reject) => {
                Papa.parse(csvFile, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        results.data.forEach((row: any) => {
                            // Map CSV columns to CandidateInput (flexible matching)
                            const candidate: CandidateInput = {
                                name: row.name || row.Name || row['Candidate Name'] || "",
                                email: row.email || row.Email || "",
                                githubUrl: row.github || row.Github || row.GitHub || row.githubUrl || "",
                                resumeText: row.resume || row.Resume || ""
                            };
                            if (candidate.name && candidate.email) {
                                candidatesToUpload.push(candidate);
                            }
                        });
                        resolve();
                    },
                    error: (err) => reject(err)
                });
            });
        }

        if (candidatesToUpload.length === 0) {
            setError("No valid candidates found. Please enter details or upload a CSV.");
            setIsLoading(false);
            setStatus("idle");
            return;
        }

        try {
            // 1. Save Candidates to DB
            const result = await addCandidates(job.id, candidatesToUpload);

            if (result.success) {
                // 2. Start AI Triage Process (Recursive)
                setStatus("parsing");

                const processLoop = async () => {
                    let keepProcessing = true;
                    while (keepProcessing) {
                        const response = await processTriageQueue(job.id);

                        if (response.error) {
                            setError(response.error);
                            keepProcessing = false;
                            setStatus("error");
                            return;
                        }

                        // If we have remaining candidates, loop again
                        if (response.remaining && response.remaining > 0) {
                            // Update UI if possible, or just log
                            console.log(`Still processing... ${response.remaining} remaining.`);
                            // Optional: Add a specialized status for "Processing X..." if we had a state for it
                            setStatus("parsing");
                        } else {
                            keepProcessing = false;
                        }
                    }
                };

                await processLoop();

                setStatus("success");
                setTimeout(onComplete, 1000);
            } else {
                setError(result.error || "Failed to upload candidates.");
                setStatus("error");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-md-surface rounded-[24px] border border-md-outline/10 p-8 max-w-2xl mx-auto shadow-sm">
            <div className="mb-8">
                <h2 className="text-headline-small font-bold text-md-on-surface mb-1">Add Candidates</h2>
                <p className="text-body-medium text-md-on-surface-variant flex items-center gap-2">
                    For Job: <span className="font-bold text-md-primary bg-md-primary/10 px-2 py-0.5 rounded-md">{job.title}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Manual Entry Section */}
                <div className="space-y-4">
                    <h3 className="text-title-medium font-bold text-md-on-surface">Option 1: Quick Add</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Candidate Name" value={manualEntry.name} onChange={handleManualChange} className="bg-md-surface-container-low h-12 px-4 rounded-lg border-b-2 border-md-outline/40 focus:border-md-primary outline-none" />
                        <input name="email" placeholder="Email Address" value={manualEntry.email} onChange={handleManualChange} className="bg-md-surface-container-low h-12 px-4 rounded-lg border-b-2 border-md-outline/40 focus:border-md-primary outline-none" />
                        <input name="githubUrl" placeholder="GitHub URL" value={manualEntry.githubUrl} onChange={handleManualChange} className="col-span-2 bg-md-surface-container-low h-12 px-4 rounded-lg border-b-2 border-md-outline/40 focus:border-md-primary outline-none" />
                    </div>
                </div>

                <div className="border-t border-md-outline/10 my-4"></div>

                {/* CSV Upload Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-title-medium font-bold text-md-on-surface">Option 2: Bulk Upload (CSV)</h3>
                        {csvFile && (
                            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> {parsedCount} candidates found
                            </span>
                        )}
                    </div>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${csvFile ? 'border-green-500 bg-green-50/50' : 'border-md-outline/40 hover:border-md-primary hover:bg-md-primary/5'}
                        `}
                    >
                        <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            {csvFile ? (
                                <>
                                    <FileText className="w-10 h-10 text-green-600" />
                                    <p className="font-medium text-green-700">{csvFile.name}</p>
                                    <p className="text-xs text-green-600/80">Click to replace</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 text-md-primary opacity-50" />
                                    <p className="font-medium text-md-on-surface">Drag & drop your CSV here</p>
                                    <p className="text-xs text-md-on-surface-variant">or click to browse</p>
                                    <p className="text-xs text-md-on-surface-variant mt-2 opacity-60">Format: Name, Email, GitHub Url</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg text-sm animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-lg text-sm animate-in slide-in-from-top-2">
                        <Check className="w-4 h-4" />
                        Candidates uploaded successfully! Redirecting...
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || (!manualEntry.name && !csvFile) || status === 'success'}
                        className="h-12 px-8 rounded-full bg-md-primary text-md-on-primary font-bold hover:bg-md-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {status === 'success' ? 'Saved & Triaging' : 'Save & Start Triage'}
                    </button>
                </div>
            </form>
        </div>
    );
}
