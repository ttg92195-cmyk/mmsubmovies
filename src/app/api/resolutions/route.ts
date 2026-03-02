import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all resolutions
export async function GET() {
  try {
    const resolutions = await db.resolution.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Default resolutions if none exist
    if (resolutions.length === 0) {
      const defaults = [
        { name: '4K', width: 3840, height: 2160, order: 1 },
        { name: '1080p', width: 1920, height: 1080, order: 2 },
        { name: '720p', width: 1280, height: 720, order: 3 },
        { name: '480p', width: 854, height: 480, order: 4 },
        { name: '360p', width: 640, height: 360, order: 5 },
      ];
      
      for (const res of defaults) {
        await db.resolution.create({ data: res });
      }
      
      return NextResponse.json({ resolutions: defaults.map((r, i) => ({ id: String(i + 1), ...r })) });
    }

    return NextResponse.json({ resolutions });
  } catch (error) {
    console.error('Error fetching resolutions:', error);
    return NextResponse.json({
      resolutions: [
        { id: '1', name: '4K' },
        { id: '2', name: '1080p' },
        { id: '3', name: '720p' },
        { id: '4', name: '480p' },
        { id: '5', name: '360p' },
      ]
    });
  }
}
