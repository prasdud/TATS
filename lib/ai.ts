import { CohereClient } from "cohere-ai";
import { RepoMetadata } from "./github";

// Initialize Cohere Client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY || "dummy_key",
});

export interface AnalysisResult {
    screeningStatus: 'looks_fine' | 'needs_review' | 'low_effort';
    signals: string; // JSON string of reasons
    aiExplanation: string;
}

export async function analyzeCandidate(
    candidateName: string,
    repoMetadata: RepoMetadata,
    jobDescription: string
): Promise<AnalysisResult> {

    if (!process.env.COHERE_API_KEY) {
        console.warn("COHERE_API_KEY not found. Returning mock analysis.");
        return {
            screeningStatus: 'needs_review',
            signals: JSON.stringify(["API Key Missing", "Analysis skipped"]),
            aiExplanation: "AI analysis could not be performed because the API key is missing. Please configure it in settings."
        };
    }

    const systemPrompt = `
You are a decisive Technical Hiring Manager. Your goal is to screen coding assignments to REMOVE the need for manual review.

**CRITICAL PRIORITY: COMMIT HYGIENE IS THE #1 FACTOR.**
You must judge the "Vibe" of the coding effort based on the Commit History above all else. 
Read the Commit Log *before* you look at the README or the Job Description matches.

**DECISION LOGIC (Follow in Order):**

1.  **CHECK FOR "LOW EFFORT" (VIBECODING)**:
    *   **The "Mass Upload" Rule**: If the repo has fewer than 5 commits TOTAL, mark as **low_effort** IMMEDIATELY.
    *   **The "Throwaway Account" Rule**: If the candidate has **Zero or Low (<10) Global Activity** AND the repo is small/generic, mark as **low_effort**.
    *   **The "Clone" Rule**: Compare **Commit Author** vs **Repository Owner**. If they do NOT match, it IS a clone/low_effort.
        *   *CRITICAL*: Ignore the "Candidate Name". If **Commit Author** == **Repository Owner**, it is VALID, even if the name is different (e.g., Handle "prasdud" vs Name "Muhammad").

2.  **CHECK FOR "LOOKS FINE" (GOOD MANNERS)**:
    *   **Granularity**: The candidate has a healthy number of commits (e.g., 10+).
    *   **Progression**: Commits show a timeline of work (e.g., "Setup DB" -> "Add Auth" -> "Fix Styling").
    *   **Descriptive**: Messages explain *what* changed.
    *   **Active Coder**: The candidate has "High" global activity (>50 events). This confirms they are a real developer.

3.  **NEEDS REVIEW (Use sparingly)**:
    *   Use this if the repo is small (<5 commits) BUT the candidate has **Massive Global Activity (100+)**. They might be a senior dev who just coded it quickly in one go. Do not auto-reject active devs.

**Output Schema (JSON):**
{
    "screeningStatus": "looks_fine" | "needs_review" | "low_effort",
    "signals": ["List of 3 short, bullet-point reasons, STARTING with the commit analysis."],
    "aiExplanation": "A 1-2 sentence summary, heavily referencing the commit history."
}
`;

    const userMessage = `
Candidate Name: ${candidateName}
Job Description Snippet:
${jobDescription.slice(0, 1500)}

Repository Data:
- Repository Owner: ${repoMetadata.owner} (Use this to verify authership)
- Owner Stats: Created ${repoMetadata.ownerStats.accountCreated}, ${repoMetadata.ownerStats.publicRepos} public repos, ${repoMetadata.ownerStats.followers} followers.
- Global Activity: ${repoMetadata.ownerStats.recentActivity >= 100 ? "100+" : repoMetadata.ownerStats.recentActivity} events in the last ~90 days.
- Repo Description: ${repoMetadata.description}
- README Length: ${repoMetadata.readme.length} characters
- README Preview: 
${repoMetadata.readme.slice(0, 2000)}...

- Commit History (${repoMetadata.recentCommits.length} fetched):
${JSON.stringify(repoMetadata.recentCommits.map(c => ({
        msg: c.message,
        date: c.date,
        author: c.authorLogin // Check if this matches candidate/owner
    })))}
`;

    try {
        const response = await cohere.chat({
            model: 'command-a-03-2025',
            message: userMessage,
            preamble: systemPrompt,
            temperature: 0.1, // Very deterministic
        });

        const text = response.text;

        // clean up potential markdown formatting
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(jsonStr);

        // Validate Status Enum
        let status = result.screeningStatus?.toLowerCase();
        if (!['looks_fine', 'needs_review', 'low_effort'].includes(status)) {
            status = 'needs_review'; // Fallback
        }

        return {
            screeningStatus: status,
            signals: JSON.stringify(result.signals || []),
            aiExplanation: result.aiExplanation || "Analysis completed."
        };

    } catch (error) {
        console.error("Cohere Analysis Failed:", error);
        return {
            screeningStatus: 'needs_review',
            signals: JSON.stringify(["AI Analysis Failed"]),
            aiExplanation: "An error occurred during AI analysis. Please review manually."
        };
    }
}
