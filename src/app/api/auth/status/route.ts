import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    
    return NextResponse.json({
      authenticated: session !== null,
      userId: session?.userId || null,
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
