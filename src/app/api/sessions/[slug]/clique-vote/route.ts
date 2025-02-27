import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tokens, cliqueVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

type SubmittedVote = {
  id: number;
  label: string;
  order: number;
}

const MIN_ORDER = 0;
const MAX_ORDER = 3;

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const { token, votes }: {
      token: string;
      votes: SubmittedVote[];
    } = await request.json();

    if (!token || !votes || !Array.isArray(votes)) {
      return NextResponse.json(
        { error: 'Invalid request. Token and votes are required.' },
        { status: 400 }
      );
    }

    const hasInvalidOrder = votes.some((vote) => vote.order < MIN_ORDER || vote.order > MAX_ORDER);
    if (hasInvalidOrder) {
      return NextResponse.json(
        { error: 'Invalid order. Orders must be between 0 and 3.' },
        { status: 400 }
      );
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.state !== 'configured') {
      return NextResponse.json(
        { error: 'Session is not in voting state' },
        { status: 400 }
      );
    }

    const sessionOptions = await db.query.options.findMany({
      where: (options, { eq }) => eq(options.sessionId, session.id)
    })

    const minVotes = session.minVotes || 2;
    const maxVotes = session.maxVotes || sessionOptions.length;

    if (votes.length < minVotes) {
      return NextResponse.json(
        { error: `You must select at least ${minVotes} options` },
        { status: 400 }
      );
    }

    if (votes.length > maxVotes) {
      return NextResponse.json(
        { error: `You can select at most ${maxVotes} options` },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      const votingToken = await tx.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.token, token)
      });

      if (!votingToken || votingToken.sessionId !== session.id || votingToken.used) {
        throw new Error('Invalid or already used token');
      }

      const validOptionIds = sessionOptions.map(opt => opt.id);
      if (!votes.every(vote => validOptionIds.includes(vote.id))) {
        throw new Error('Invalid option selected');
      }

      await tx.insert(cliqueVotes)
        .values(
          votes.map(vote => ({
            token: votingToken.token,
            optionId: vote.id,
            order: vote.order,
          }))
        );

      await tx.update(tokens)
        .set({ used: 1 })
        .where(eq(tokens.token, token));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit vote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
