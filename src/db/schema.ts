import { sql } from 'drizzle-orm';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  type: text().$type<'approval' | 'clique'>().default('approval'),
  state: text().$type<"initiated" | "configured" | "finished">().default("initiated"),
  minVotes: integer(),
  maxVotes: integer(),
  weightsLabels: text(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tokens = sqliteTable('tokens', {
  token: text('token').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id),
  used: integer('used').default(0),
  salt: text('salt'),
  iv: text('iv'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const options = sqliteTable('options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id),
  label: text('label').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const voters = sqliteTable('voters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  voterId: integer('voter_id').references(() => voters.id),
  optionId: integer('option_id').references(() => options.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const cliqueVotes = sqliteTable('clique_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').references(() => tokens.token),
  optionId: integer('option_id').references(() => options.id),
  order: integer('order').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
