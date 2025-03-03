import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import bcrypt from 'bcryptjs';
import { signAdminJwt } from '@/lib/jwt';

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { password } = await request.json();

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, session.hashedPassword);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const jwtToken = signAdminJwt({
      sessionId: session.id,
      sessionSlug: session.slug,
    });

    return NextResponse.json({
      session: {
        id: session.id,
        slug: session.slug,
        name: session.name,
        state: session.state,
      },
      jwtToken,
    });
  } catch (error) {
    console.error('Failed to verify session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
