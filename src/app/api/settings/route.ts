import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get settings
export async function GET() {
  try {
    let settings = await db.settings.findFirst()

    if (!settings) {
      settings = await db.settings.create({
        data: {
          primaryColor: '#FFC107',
          headerText: 'BurmaYoteShin',
          allDownloadEnabled: false,
        }
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    let settings = await db.settings.findFirst()

    if (!settings) {
      settings = await db.settings.create({
        data: {
          primaryColor: body.primaryColor || '#FFC107',
          headerText: body.headerText || 'BurmaYoteShin',
          allDownloadEnabled: body.allDownloadEnabled || false,
        }
      })
    } else {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          primaryColor: body.primaryColor,
          headerText: body.headerText,
          allDownloadEnabled: body.allDownloadEnabled,
        }
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
