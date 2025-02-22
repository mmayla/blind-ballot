import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AdminJwtPayload {
  sessionId: number;
  sessionSlug: string;
  role: 'admin';
}

export function signAdminJwt(payload: Omit<AdminJwtPayload, 'role'>): string {
  return jwt.sign({ ...payload, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyAdminJwt(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch (error) {
    console.log(error)
    return null;
  }
}

export function getAuthToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}
