// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { initializeFirebaseAdmin } from '@/app/utils/firebase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    const { auth } = initializeFirebaseAdmin()
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 // 5 days in seconds (not milliseconds)
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}