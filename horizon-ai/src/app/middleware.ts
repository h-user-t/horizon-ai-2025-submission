// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { initializeFirebaseAdmin } from './utils/firebase/admin'

export async function middleware(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value

    if (!session) {
      const url = new URL('/signin', request.url)
      return NextResponse.redirect(url)
    }

    const { auth, db } = initializeFirebaseAdmin()
    
    try {
      const decodedClaim = await auth.verifySessionCookie(session, true)
      const userDoc = await db.collection('users').doc(decodedClaim.uid).get()
      const userData = userDoc.data()
      const userRole = userData?.role

      const isPatientPath = request.nextUrl.pathname.startsWith('/patient')
      const isTherapistPath = request.nextUrl.pathname.startsWith('/therapist')

      if (isPatientPath && userRole !== 'patient') {
        const url = new URL('/signin', request.url)
        return NextResponse.redirect(url)
      }

      if (isTherapistPath && userRole !== 'therapist') {
        const url = new URL('/signin', request.url)
        return NextResponse.redirect(url)
      }

      return NextResponse.next()
    } catch {
      const url = new URL('/signin', request.url)
      const response = NextResponse.redirect(url)
      response.cookies.delete('session')
      return response
    }
  } catch (error) {
    console.error('Middleware error:', error)
    const url = new URL('/signin', request.url)
    const response = NextResponse.redirect(url)
    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: ['/patient/:path*', '/therapist/:path*']
}