"use client"

import { useEffect } from "react"
import { auth } from "@/app/utils/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import MessagePage from "../../componenets/MessageComponenet"

export default function TherapistMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/signin")
    })
    return () => unsubscribe()
  }, [router])

  return auth.currentUser ? (
    <MessagePage 
      userId={auth.currentUser.uid}
      userType="patient"
      onError={(error) => console.error("Message error:", error)}
    />
  ) : null
}