import { cookies } from 'next/headers';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'homietv_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  
  sessions.set(sessionId, { userId, expiresAt });
  
  return sessionId;
}

export async function getSession(sessionId: string): Promise<{ userId: string } | null> {
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  
  return { userId: session.userId };
}

export async function deleteSession(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}

export async function validateCredentials(username: string, password: string): Promise<string | null> {
  const user = await db.user.findFirst({
    where: {
      username,
      password,
    },
  });
  
  return user?.id || null;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_MS / 1000,
    path: '/',
  });
}

export async function getSessionFromCookie(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) return null;
  
  return getSession(sessionId);
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionId) {
    await deleteSession(sessionId);
  }
  
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSessionFromCookie();
  return session !== null;
}
