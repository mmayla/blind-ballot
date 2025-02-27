import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, options, cliqueVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

import { MAX_ORDER, MIN_ORDER } from '@/constants';

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

    // if (session.state !== 'finished') {
    //   return NextResponse.json(
    //     { error: 'Voting is still in progress' },
    //     { status: 403 }
    //   );
    // }

    const votes = await db
      .select({
        token: cliqueVotes.token,
        optionLabel: options.label,
        order: cliqueVotes.order,
      })
      .from(cliqueVotes)
      .leftJoin(options, eq(cliqueVotes.optionId, options.id))
      .where(eq(options.sessionId, session.id));

    const invalidVotes = votes.some((vote) => !vote.optionLabel || !vote.token || vote.order < MIN_ORDER || vote.order > MAX_ORDER);
    if (invalidVotes) {
      return NextResponse.json(
        { error: 'Invalid votes found' },
        { status: 400 }
      );
    }

    const votesByToken = (votes as {
      token: string;
      optionLabel: string;
      order: number;
    }[]).reduce((acc, vote) => {
      if (!acc[vote.token]) {
        acc[vote.token] = [];
      }
      acc[vote.token].push({
        label: vote.optionLabel,
        weight: vote.order === 0 ? 0 : MAX_ORDER - vote.order + 1,
      });
      return acc;
    }, {} as Record<string, {
      label: string;
      weight: number;
    }[]>);

    return NextResponse.json(votesByToken);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
