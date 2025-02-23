// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/utils/firebase/config'

export function useAuth(requiredRole?: 'patient' | 'therapist') {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        try {
          // Use single document fetch instead of real-time subscription
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          const userData = userDoc.data()
          setRole(userData?.role || null)

          // Redirect if role doesn't match required role
          if (requiredRole && userData?.role !== requiredRole) {
            router.replace('/signin')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setRole(null)
          if (requiredRole) {
            router.replace('/signin')
          }
        }
      } else {
        setRole(null)
        if (requiredRole) {
          router.replace('/signin')
        }
      }
      
      setIsLoading(false)
    })

    return () => unsubscribeAuth()
  }, [router, requiredRole])

  return { user, role, isLoading }
}