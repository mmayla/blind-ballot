import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { token } = await request.json();

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

    const votingToken = await db.query.tokens.findFirst({
      where: (tokens, { eq }) => eq(tokens.token, token)
    });

    if (!votingToken || votingToken.sessionId !== session.id || votingToken.used) {
      return NextResponse.json(
        { error: 'Invalid or already used token' },
        { status: 400 }
      );
    }

    const sessionOptions = await db.query.options.findMany({
      where: (options, { eq }) => eq(options.sessionId, session.id)
    });

    return NextResponse.json({ options: sessionOptions });
  } catch (error) {
    console.error('Failed to verify token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
