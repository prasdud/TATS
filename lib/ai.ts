import { CohereClient } from "cohere-ai";
import { RepoMetadata } from "./github";

// Initialize Cohere Client
// Users should provide COHERE_API_KEY in .env
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
You are an expert Technical Hiring Manager and Triage Officer. 
Your goal is to evaluate a candidate's coding assignment submission against a Job Description to determine if they should pass the initial screening.
You MUST NOT output any markdown code blocks. You MUST output ONLY valid JSON.

Input Data:
1. Candidate Name
2. Job Description
3. Repository Metadata (Readme, Commit History, Stats)

Evaluation Criteria:
- **Low Effort**: Repo has very few commits (e.g., "Initial commit"), generic/empty README, or obviously cloned content without modification.
- **Needs Review**: Repo is decent but has mixed signals (e.g., good code but poor documentation, or sparse commit history).
- **Looks Fine**: Repo shows healthy activity, good README, structured commits, and relevance to the JD.

Output Schema (JSON):
{
    "screeningStatus": "looks_fine" | "needs_review" | "low_effort",
    "signals": ["List of 3-5 short, bullet-point reasons for the decision"],
    "aiExplanation": "A 1-2 sentence human-readable summary of the evaluation."
}
`;

    const userMessage = `
Candidate: ${candidateName}
Job Description:
${jobDescription.slice(0, 2000)}

Repository Data:
- Description: ${repoMetadata.description}
- Readme Snippet: ${repoMetadata.readme.slice(0, 3000)}
- Recent Commits: ${JSON.stringify(repoMetadata.recentCommits)}
- Stats: ${repoMetadata.stars} stars, ${repoMetadata.forks} forks.
`;

    try {
        const response = await cohere.generate({
            model: 'command-r-plus', // High quality model
            prompt: systemPrompt + "\n\n" + userMessage,
            maxTokens: 500,
            temperature: 0.3, // Low temperature for deterministic/consistent outputs
            format: "JSON" // Enforce JSON if supported/prompted
        });

        const text = response.generations[0].text;

        // clean up potential markdown formatting if model ignores instruction
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
