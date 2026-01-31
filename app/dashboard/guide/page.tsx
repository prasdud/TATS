import { FileText, Upload, RefreshCw, PenTool } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function GuidePage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="space-y-2">
                <h1 className="text-display-small font-bold text-md-primary">How to Use TATS</h1>
                <p className="text-body-large text-md-on-surface-variant">
                    A comprehensive guide to adding candidates and managing the triage process.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Adding Candidates */}
                <div className="bg-md-surface-container rounded-[24px] p-8 border border-md-outline/10 space-y-6 md:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-md-primary/10 flex items-center justify-center text-md-primary">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h2 className="text-headline-small font-bold text-md-on-surface">Adding Candidates</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Manual Entry */}
                        <div className="space-y-4">
                            <h3 className="text-title-large font-bold flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-md-secondary" /> Manual Entry
                            </h3>
                            <p className="text-md-on-surface-variant">
                                Perfect for adding single candidates quickly. Go to the <strong>Jobs</strong> page, select your job, and use the form to enter details one by one.
                            </p>
                        </div>

                        {/* CSV Upload */}
                        <div className="space-y-4">
                            <h3 className="text-title-large font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-md-secondary" /> CSV Bulk Upload
                            </h3>
                            <p className="text-md-on-surface-variant">
                                Upload hundreds of candidates at once. Your CSV file must strictly follow this header format:
                            </p>

                            <div className="bg-md-surface-container-low rounded-xl p-4 border border-md-outline/20 font-mono text-sm overflow-x-auto">
                                <code className="text-md-primary">Name,Email,GitHub URL</code>
                            </div>

                            <ul className="text-sm text-md-on-surface-variant list-disc list-inside space-y-1">
                                <li><strong>Name</strong>: Full name of candidate</li>
                                <li><strong>Email</strong>: Contact email</li>
                                <li><strong>GitHub URL</strong>: Must be a valid public URL</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 2. The Triage Process */}
                <div className="bg-md-surface-container rounded-[24px] p-8 border border-md-outline/10 space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-md-tertiary/10 flex items-center justify-center text-md-tertiary">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <h2 className="text-headline-small font-bold text-md-on-surface">The Triage Process</h2>
                    </div>
                    <p className="text-md-on-surface-variant">
                        Once candidates are added, you will be redirected to the <strong>Triage Dashboard</strong>.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex gap-2">
                            <span className="text-xl">💡</span>
                            The AI processes one candidate at a time to ensure high accuracy.
                        </p>
                    </div>
                    <p className="text-md-on-surface-variant">
                        <strong>Important:</strong> If the screen doesn't update immediately, you may need to refresh the page manually to see the latest cards appearing.
                    </p>
                </div>

                {/* 3. Status Definitions */}
                <div className="bg-md-surface-container rounded-[24px] p-8 border border-md-outline/10 space-y-4">
                    <h2 className="text-headline-small font-bold text-md-on-surface mb-6">Status Key</h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-md-on-surface">Looks Fine</p>
                                <p className="text-sm text-md-on-surface-variant">Strong match. GitHub shows active, high-quality code.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-md-on-surface">Needs Review</p>
                                <p className="text-sm text-md-on-surface-variant">Ambiguous signals or missing/private GitHub profile.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-md-on-surface">Low Effort</p>
                                <p className="text-sm text-md-on-surface-variant">Low contribution count or empty repositories.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
