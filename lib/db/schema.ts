import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['hr', 'interviewer', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: userRoleEnum('role').default('hr'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdBy: serial('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const screeningStatusEnum = pgEnum('screening_status', [
  'looks_fine',
  'needs_review',
  'low_effort',
]);

export const dispositionEnum = pgEnum('disposition', [
  'forward',
  'reject',
  'hold',
]);

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  jobId: serial('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  resumeFile: text('resume_file'), // Base64 encoded PDF
  resumeText: text('resume_text'),
  githubUrl: text('github_url').notNull(),
  screeningStatus: screeningStatusEnum('screening_status'),
  finalDisposition: dispositionEnum('disposition'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const evaluations = pgTable('evaluations', {
  id: serial('id').primaryKey(),
  candidateId: serial('candidate_id')
    .notNull()
    .references(() => candidates.id, { onDelete: 'cascade' }),
  signals: text('signals').notNull(), // JSON string of analysis results
  aiExplanation: text('ai_explanation'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
