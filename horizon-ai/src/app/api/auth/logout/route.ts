// app/api/auth/logout/route.ts
import {  NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() { // Removed the unused parameter entirely
  try {
    // Clear the session cookie
    const cookieStore = await cookies() // Added await here
    cookieStore.delete('session')
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}