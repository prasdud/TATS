'use client';

import { useState } from 'react';
import { JobList } from './_components/JobList';
import { CreateJobForm } from './_components/CreateJobForm';
import { AddCandidatesForm } from './_components/AddCandidatesForm';
import type { Job } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';

interface JobsPageClientProps {
    initialJobs: Job[];
}

export default function JobsPageClient({ initialJobs }: JobsPageClientProps) {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>(initialJobs);

    // UI State
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'create' | 'details' | 'upload'>('create'); // Start with create if no job selected, or list default?

    // Derived state
    const selectedJob = jobs.find(j => j.id === selectedJobId);

    const handleCreateNew = () => {
        setSelectedJobId(null);
        setViewMode('create');
    };

    const handleSelectJob = (job: Job) => {
        setSelectedJobId(job.id);
        setViewMode('details'); // Could show details or upload? Let's say details for now, but user requirement implies adding context.
        // User said: "after uploading the jd, next to it, there will be another entry box, where user can then either enter these details"
        // So viewing an existing job -> probably implies seeing its triage status or adding more candidates.
        // For simplicity: Viewing existing job -> Show "Add Candidates" form or Triage Status.
        // "there will also be a start triage button"
        // I'll default to showing "Add Candidates" form for any selected job for now, as that covers "add details" requirement.
        setViewMode('upload');
    };

    const handleJobCreated = (newJob: Job) => {
        // Add to list and select it
        setJobs([newJob, ...jobs]);
        setSelectedJobId(newJob.id);
        setViewMode('upload'); // Move to step 2: Upload Candidates
    };

    const handleCandidatesAdded = () => {
        // Navigate to triage page for this job
        router.push('/dashboard/triage');
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Left Column: Job List */}
            <div className="w-1/3 min-w-[320px]">
                <JobList
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    onSelectJob={handleSelectJob}
                    onCreateNew={handleCreateNew}
                />
            </div>

            {/* Right Column: Dynamic Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
                    {viewMode === 'create' && (
                        <CreateJobForm onJobCreated={handleJobCreated} />
                    )}

                    {viewMode === 'upload' && selectedJob && (
                        <AddCandidatesForm job={selectedJob} onComplete={handleCandidatesAdded} />
                    )}

                    {viewMode === 'details' && selectedJob && (
                        <div className="text-center p-10 opacity-50">
                            Job Details Implementation Pending
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
