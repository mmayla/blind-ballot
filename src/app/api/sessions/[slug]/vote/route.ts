import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tokens, voters, votes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const { token, optionIds } = await request.json();

    if (!token || !optionIds || !Array.isArray(optionIds) || optionIds.length < 2) {
      return NextResponse.json(
        { error: 'Invalid request. Must select at least 2 options.' },
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

    const result = await db.transaction(async (tx) => {
      const votingToken = await tx.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.token, token)
      });

      if (!votingToken || votingToken.sessionId !== session.id || votingToken.used) {
        throw new Error('Invalid or already used token');
      }

      const sessionOptions = await tx.query.options.findMany({
        where: (options, { eq }) => eq(options.sessionId, session.id)
      });

      const validOptionIds = sessionOptions.map(opt => opt.id);
      if (!optionIds.every(id => validOptionIds.includes(id))) {
        throw new Error('Invalid option selected');
      }

      const [voter] = await tx.insert(voters)
        .values({
          sessionId: session.id,
        })
        .returning();

      await tx.insert(votes)
        .values(
          optionIds.map(optionId => ({
            voterId: voter.id,
            optionId
          }))
        );

      await tx.update(tokens)
        .set({ used: 1 })
        .where(eq(tokens.token, token));

      return voter;
    });

    return NextResponse.json({ success: true, voterId: result.id });
  } catch (error) {
    console.error('Failed to submit vote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
