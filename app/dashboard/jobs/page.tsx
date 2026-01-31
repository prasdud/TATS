import JobsPageClient from './client';
import { getJobs } from '@/app/actions/jobs';

export default async function JobsPage() {
    const jobs = await getJobs();

    return (
        <JobsPageClient initialJobs={jobs} />
    );
}
