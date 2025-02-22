import { NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const authError = await verifyAdmin(request, params.slug);
    if (authError) return authError;

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionTokens = await db.query.tokens.findMany({
      where: (tokens, { eq }) => eq(tokens.sessionId, session.id)
    });

    return NextResponse.json({
      tokens: sessionTokens.map(token => ({
        ...token,
        used: Boolean(token.used)
      }))
    });
  } catch (error) {
    console.error('Failed to fetch tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
