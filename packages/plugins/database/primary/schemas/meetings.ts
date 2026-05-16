import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const meetings = pgTable('meeting', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});
