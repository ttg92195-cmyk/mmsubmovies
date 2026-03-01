import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password required'
      }, { status: 400 })
    }

    // Check for admin credentials
    if (username === 'Admin8676' && password === 'Admin8676') {
      try {
        // Check if admin exists, if not create
        let admin = await db.user.findUnique({
          where: { username: 'Admin8676' }
        })

        if (!admin) {
          admin = await db.user.create({
            data: {
              username: 'Admin8676',
              password: 'Admin8676',
              isAdmin: true,
            }
          })
        }

        return NextResponse.json({
          success: true,
          user: {
            id: admin.id,
            username: admin.username,
            isAdmin: admin.isAdmin,
            isPremium: admin.isPremium || false,
          }
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // If database fails, still allow admin login with hardcoded credentials
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin-local',
            username: 'Admin8676',
            isAdmin: true,
            isPremium: false,
          }
        })
      }
    }

    // Check for regular user
    try {
      const user = await db.user.findUnique({
        where: { username }
      })

      if (user && user.password === password) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            isPremium: user.isPremium || false,
          }
        })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 })
  }
}
