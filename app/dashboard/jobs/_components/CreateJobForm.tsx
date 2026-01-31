import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createJob } from '@/app/actions/jobs';
import type { Job } from '@/lib/db/schema';

interface CreateJobFormProps {
    onJobCreated: (job: Job) => void;
}

export function CreateJobForm({ onJobCreated }: CreateJobFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ title: "", description: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);

            // Directly calling the server action wrapper or fetch?
            // Since createJob is a server action, we can call it.
            // But return type changed to object.
            const result = await createJob(undefined, formDataObj);

            if (typeof result === 'object' && result?.success && result.job) {
                onJobCreated(result.job);
            } else if (typeof result === 'object' && result?.error) {
                setError(result.error);
            } else {
                setError("Unknown error occurred.");
            }
        } catch (err) {
            setError("Failed to create job.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-md-surface rounded-[24px] border border-md-outline/10 p-8 max-w-2xl mx-auto shadow-sm">
            <h2 className="text-headline-small font-bold text-md-on-surface mb-2">Create New Job</h2>
            <p className="text-body-medium text-md-on-surface-variant mb-8">
                Paste your job description to establish the context for candidate triage.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-label-large font-medium ml-1">Job Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 border-md-outline/40 focus:border-md-primary outline-none transition-colors"
                        placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-label-large font-medium ml-1">Job Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full min-h-[200px] p-4 bg-md-surface-container-low rounded-t-lg border-b-2 border-md-outline/40 focus:border-md-primary outline-none transition-colors resize-y"
                        placeholder="Paste the full job description here..."
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || !formData.title || !formData.description}
                        className="h-12 px-8 rounded-full bg-md-primary text-md-on-primary font-bold hover:bg-md-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Create Job & Continue
                    </button>
                </div>
            </form>
        </div>
    );
}
