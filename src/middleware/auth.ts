import { NextResponse } from 'next/server';
import { verifyAdminJwt, getAuthToken } from '@/lib/jwt';

export async function verifyAdmin(request: Request, slug: string) {
  const authHeader = request.headers.get('Authorization');
  const token = getAuthToken(authHeader!);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyAdminJwt(token);
  if (!payload || payload.sessionSlug !== slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
