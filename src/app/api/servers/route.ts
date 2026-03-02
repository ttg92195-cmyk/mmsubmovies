import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all server names
export async function GET() {
  try {
    const servers = await db.serverName.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Default servers if none exist
    if (servers.length === 0) {
      const defaultServers = [
        { name: 'Megaup', color: '#ef4444', order: 1 },
        { name: 'Mega', color: '#f97316', order: 2 },
        { name: 'Yoteshin', color: '#22c55e', order: 3 },
        { name: 'Drive', color: '#3b82f6', order: 4 },
        { name: 'Dropbox', color: '#06b6d4', order: 5 },
      ];
      
      for (const server of defaultServers) {
        await db.serverName.create({ data: server });
      }
      
      return NextResponse.json({ servers: defaultServers });
    }

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ 
      servers: [
        { id: '1', name: 'Megaup', color: '#ef4444' },
        { id: '2', name: 'Mega', color: '#f97316' },
        { id: '3', name: 'Yoteshin', color: '#22c55e' },
      ]
    });
  }
}

// POST - Create a new server name
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Server name is required' }, { status: 400 });
    }

    // Get highest order
    const highest = await db.serverName.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const server = await db.serverName.create({
      data: {
        name,
        color: color || '#ef4444',
        order: (highest?.order || 0) + 1,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 });
  }
}

// DELETE - Delete a server name
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }

    await db.serverName.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 });
  }
}
