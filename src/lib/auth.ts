import { cookies } from 'next/headers';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'homietv_session';
const SESSION_EXPIRY_HOURS = 24;

// Create a new session in database
export async function createSession(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return token;
}

// Get session from database
export async function getSession(token: string): Promise<{ userId: string } | null> {
  const session = await db.session.findUnique({
    where: { token },
  });
  
  if (!session) return null;
  
  // Check if expired
  if (new Date() > session.expiresAt) {
    await db.session.delete({ where: { token } });
    return null;
  }
  
  return { userId: session.userId };
}

// Delete session from database
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session might not exist
  }
}

// Validate user credentials
export async function validateCredentials(username: string, password: string): Promise<string | null> {
  const user = await db.user.findFirst({
    where: {
      username,
      password,
    },
  });
  
  return user?.id || null;
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: '/',
  });
}

// Get session from cookie
export async function getSessionFromCookie(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return getSession(token);
}

// Clear session cookie and delete from database
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (token) {
    await deleteSession(token);
  }
  
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSessionFromCookie();
  return session !== null;
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await db.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
