import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, options, tokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/middleware/auth';
import { generateUniqueVotingTokens } from '@/lib/token';

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const authError = await verifyAdmin(request, slug);
    if (authError) return authError;

    const { options: newOptions, adminPassword } = await request.json();

    if (!newOptions || newOptions.length < 2) {
      return NextResponse.json(
        { error: 'Number of options must be at least 2' },
        { status: 400 }
      );
    }

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is required' },
        { status: 400 }
      );
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.type !== 'clique') {
      return NextResponse.json(
        { error: 'Session type must be clique' },
        { status: 400 }
      );
    }

    if (session.state !== 'initiated') {
      return NextResponse.json(
        { error: 'Session is already configured' },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      await tx.insert(options).values(
        newOptions.map((opt: { label: string }) => ({
          sessionId: session.id,
          label: opt.label,
        }))
      );

      const votingTokens = generateUniqueVotingTokens(newOptions.length);
      await tx.insert(tokens).values(
        votingTokens.map(token => ({
          token,
          sessionId: session.id,
          used: 0
        }))
      );

      await tx
        .update(sessions)
        .set({ state: 'configured' })
        .where(eq(sessions.id, session.id));

      const savedOptions = await tx.query.options.findMany({
        where: (options, { eq }) => eq(options.sessionId, session.id)
      });

      const savedTokens = await tx.query.tokens.findMany({
        where: (tokens, { eq }) => eq(tokens.sessionId, session.id)
      });

      return {
        options: savedOptions,
        tokens: savedTokens
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to save options:', error);
    return NextResponse.json(
      { error: 'Failed to save options' },
      { status: 500 }
    );
  }
}
