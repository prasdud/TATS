export default function CandidatesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-md-surface-container rounded-[24px] border border-md-outline/10">
            <h1 className="text-display-medium font-bold text-md-on-surface mb-4">Candidates</h1>
            <p className="text-body-large text-md-on-surface-variant max-w-md">
                This is the {`{Candidates}`} page. Candidate lists and status updates will be managed here.
            </p>
        </div>
    );
}
