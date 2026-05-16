import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const meetingStatusEnum = pgEnum('meeting_status', [
  'recording',
  'processing',
  'ready',
  'failed'
]);

export const meetings = pgTable('meeting', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull().default('Untitled Meeting'),
  transcriptOutput: jsonb('transcript_output'),
  summary: text('summary'),
  actionItems: jsonb('action_items'),
  status: meetingStatusEnum('status').notNull().default('recording'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});
