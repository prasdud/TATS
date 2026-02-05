## Deployed URL

https://tats-self.vercel.app

# Techincal Assignment Triage System

A full-stack Next.js 16 application that helps non-technical HR teams triage technical assignment submissions using GitHub repository hygiene signals and AI-assisted explanations.

## Usage

Visit the deployed application and create an account. Download the CSV files from the project root (test-candidates-small.csv for quick testing, test-candidates-large.csv for more comprehensive testing). Create a job posting with the sample job description in project root test-sample-jd.txt, then upload the CSV to import candidates. The system will analyze each GitHub repository and provide a triage recommendation.

## About

This project addresses a real-world challenge: non-technical HR staff screening technical assignment submissions before forwarding to interviewers. The application analyzes public GitHub metadata (commits, README quality, repository structure) and uses AI to translate technical signals into plain English recommendations.

Built with Next.js 16, TypeScript, PostgreSQL (Neon), and Tailwind CSS. Features include authentication with NextAuth.js, server-side rendering, protected routes, role-based access control, and graceful error handling. The AI integration via Cohere is intentionally designed as assistive rather than authoritative, ensuring core functionality remains available even when AI services are unavailable.

The focus is on pre-interview technical hygiene, not technical judgment. It standardizes screening decisions, reduces wasted interviewer time on low-effort submissions, and provides transparent, explainable outcomes.

## Features

### System Capabilities
- **Automated Triage Pipeline**: Fetches real-time GitHub metadata and commits to analyze repository hygiene.
- **AI Analysis**: Uses Cohere to generate plain-English explanations for technical signals (commit frequency, code churn, documentation).
- **Concurrency Control**: Implements atomic database locking to prevent duplicate processing when multiple users or agents are active.
- **Real-time Updates**: Zero-cache architecture with automated polling ensures the dashboard always reflects live data.

### User Interface
- **Triage Dashboard**: Kanban-style board categorizing submissions into "Looks Fine", "Needs Review", and "Low Effort".
- **Responsive Design**: Mobile-optimized layout with collapsible navigation and touch-friendly interactions.
- **Account Management**: Settings panel with "Danger Zone" for full account deletion and cascading data cleanup.
- **Built-in Documentation**: Integrated usage guide explaining CSV formats and triage workflows.

### Operation
- **Bulk Import**: Client-side CSV parsing for robustly handling large batches of candidates.
- **Manual Entry**: Form-based input for adding individual candidates.
- **Authentication**: Secure email/password login with database sessions.

## Tech Stack

Next.js 16 with App Router, TypeScript, PostgreSQL with Drizzle ORM, Tailwind CSS, shadcn/ui, NextAuth.js v5, Vercel deployment with CI/CD
