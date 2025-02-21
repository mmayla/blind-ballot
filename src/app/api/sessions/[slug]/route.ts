import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        name: session.name,
        slug: session.slug,
        state: session.state,
      }
    });
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
