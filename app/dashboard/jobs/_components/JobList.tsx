import { format } from 'date-fns';
import { Briefcase } from 'lucide-react';
import type { Job } from '@/lib/db/schema';

interface JobListProps {
    jobs: Job[];
    selectedJobId: number | null;
    onSelectJob: (job: Job) => void;
    onCreateNew: () => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob, onCreateNew }: JobListProps) {
    return (
        <div className="flex flex-col h-full bg-md-surface-container-low rounded-[24px] border border-md-outline/10 overflow-hidden">
            <div className="p-6 border-b border-md-outline/10 flex justify-between items-center bg-md-surface-container">
                <h2 className="text-title-medium font-bold text-md-on-surface">Your Jobs</h2>
                <button
                    onClick={onCreateNew}
                    className="text-label-large font-bold text-md-primary hover:bg-md-primary/10 px-3 py-1 rounded-full transition-colors"
                >
                    + New
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {jobs.length === 0 ? (
                    <div className="text-center py-10 text-md-on-surface-variant opacity-60">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No jobs found.</p>
                        <p className="text-sm">Create one to get started.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => onSelectJob(job)}
                            className={`
                                cursor-pointer p-4 rounded-xl border transition-all duration-200 text-left
                                ${selectedJobId === job.id
                                    ? 'bg-md-primary-container border-md-primary text-md-on-primary-container'
                                    : 'bg-md-surface border-md-outline/10 hover:border-md-outline/30 hover:shadow-sm'}
                            `}
                        >
                            <h3 className="font-bold text-title-medium mb-1 truncate">{job.title}</h3>
                            <p className={`text-body-small line-clamp-2 mb-3 ${selectedJobId === job.id ? 'opacity-80' : 'text-md-on-surface-variant'}`}>
                                {job.description}
                            </p>
                            <div className="flex items-center justify-between text-xs opacity-60">
                                <span>{job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'Just now'}</span>
                                {/* Placeholder for candidate count if available later */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
