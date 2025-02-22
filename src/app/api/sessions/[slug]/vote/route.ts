import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tokens, voters, votes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { token, optionIds } = await request.json();

    if (!Array.isArray(optionIds) || optionIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options must be selected' },
        { status: 400 }
      );
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
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

      const validOptionIds = new Set(sessionOptions.map(opt => opt.id));
      const invalidOptions = optionIds.some(id => !validOptionIds.has(id));

      if (invalidOptions) {
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
            optionId,
          }))
        );

      await tx.update(tokens)
        .set({ used: 1 })
        .where(eq(tokens.token, token));

      return true;
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
