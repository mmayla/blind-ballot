import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, votes, options } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.slug, slug)
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.state !== 'finished') {
      return NextResponse.json(
        { error: 'Voting is still in progress' },
        { status: 403 }
      );
    }

    // Get vote counts for each option
    const results = await db
      .select({
        optionId: options.id,
        label: options.label,
        voteCount: sql<number>`count(${votes.id})`.as('vote_count')
      })
      .from(options)
      .leftJoin(votes, eq(votes.optionId, options.id))
      .where(eq(options.sessionId, session.id))
      .groupBy(options.id, options.label);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
