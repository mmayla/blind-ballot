import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!password.trim()) {
      throw new Error('Password is required');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const [session] = await db
      .insert(sessions)
      .values({
        name,
        slug,
        hashedPassword,
        state: 'initiated',
      })
      .returning();

    return NextResponse.json({
      session: {
        id: session.id,
        slug: session.slug,
        name: session.name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
