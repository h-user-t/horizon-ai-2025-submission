"use client"

import { useEffect, useState } from "react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  Plus,
  ArrowRight,
  CalendarDays
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

// Sample quotes for motivation
const quotes = [
  {
    text: "Every day is a new beginning. Take a deep breath and start again.",
    author: "Unknown"
  },
  {
    text: "You are stronger than you know, braver than you believe, and more capable than you can imagine.",
    author: "Unknown"
  },
  {
    text: "Progress is progress, no matter how small.",
    author: "Unknown"
  }
]

// Interface for session data
interface Session {
  id: string;
  sessionDate: Date;
  therapistId: string;
  therapist: string;
  summary: string;
  status: string;
  patientId: string;
}

export default function PatientDashboard() {
  const [greeting, setGreeting] = useState("")
  const [quote, setQuote] = useState(quotes[0])
  const [userName, setUserName] = useState("User")
  const [nextSession, setNextSession] = useState<Session | null>(null)
  const [lastSession, setLastSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to fetch therapist name
  const getTherapistName = async (therapistId: string, db: any) => {
    const therapistRef = doc(db, "users", therapistId)
    const therapistSnap = await getDoc(therapistRef)
    return therapistSnap.exists() ? `Dr. ${therapistSnap.data().last_name}` : "Unknown Therapist"
  }

  useEffect(() => {
    setGreeting(getGreeting())
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)

    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)

    const auth = getAuth()
    const db = getFirestore()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const uid = user.uid
          const userDocRef = doc(db, "users", uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            setUserName(data.first_name ? 
              data.first_name.charAt(0).toUpperCase() + data.first_name.slice(1) : 
              user.email ? user.email.split("@")[0] : "User")
          }

          const sessionsRef = collection(db, "sessions")
          const q = query(sessionsRef, where("patientId", "==", uid))
          const querySnapshot = await getDocs(q)
          const fetchedSessions: Session[] = await Promise.all(
            querySnapshot.docs.map(async (sessionDoc) => {
              const data = sessionDoc.data()
              const therapistName = await getTherapistName(data.therapistId, db)
              return {
                id: sessionDoc.id,
                sessionDate: data.sessionDate.toDate(),
                therapistId: data.therapistId,
                therapist: therapistName,
                summary: data.summary || "No summary available",
                status: data.status || "unknown",
                patientId: data.patientId,
              }
            })
          )

          fetchedSessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())
          const now = new Date()
          const upcoming = fetchedSessions.find(session => session.sessionDate > now && session.status === "scheduled")
          setNextSession(upcoming || null)
          const pastSessions = fetchedSessions.filter(session => session.sessionDate <= now)
          const recentPast = pastSessions[pastSessions.length - 1]
          setLastSession(recentPast || null)
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setUserName("Guest")
        setLoading(false)
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading dashboard...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#146C94]">
          {greeting}, {userName}
        </h1>
        <p className="text-gray-600 mt-2">
          We're here to support your journey to better mental health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Button 
              className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
              onClick={() => router.push("/patient/schedule")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Link href="/patient/journal">
              <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
                <BookOpen className="mr-2 h-4 w-4" />
                New Journal Entry
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Button 
              className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
              onClick={() => router.push("/patient/messages")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Therapist
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#146C94]" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span>{nextSession.sessionDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{nextSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  With {nextSession.therapist} - Video Session
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No upcoming sessions scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#146C94]" />
              Last Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastSession ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{lastSession.summary}</p>
                <Button 
                  variant="outline" 
                  className="text-[#146C94] hover:bg-[#146C94]/10"
                  onClick={() => router.push(`/patient/sessions/${lastSession.id}`)}
                >
                  View Full Summary
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No past sessions available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#146C94]/5 border-none">
        <CardContent className="pt-6">
          <blockquote className="space-y-2">
            <p className="text-lg text-[#146C94]">"{quote.text}"</p>
            <footer className="text-sm text-[#146C94]/70">
              - {quote.author}
            </footer>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  )
}