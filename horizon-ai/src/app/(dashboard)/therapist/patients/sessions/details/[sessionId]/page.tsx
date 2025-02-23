"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Lightbulb,
  Heart,
  Target,
  AlertCircle,
} from "lucide-react"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

interface Session {
  id: string;
  sessionDate: Date;
  therapistId: string;
  summary: string;
  shortSummary?: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
  transcript: string;
  journalingPrompt: string;
  journalingResponse: string;
  patientId: string;
  status: string;
}

export default function TherapistSessionDetailPage() {
  const router = useRouter()
  const { sessionId } = useParams() as { sessionId: string }
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [patientName, setPatientName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }
      try {
        const db = getFirestore()
        const sessionRef = doc(db, "sessions", sessionId)
        const sessionSnap = await getDoc(sessionRef)
        if (sessionSnap.exists()) {
          const data = sessionSnap.data()
          const currentUser = auth.currentUser
          if (!currentUser || data.therapistId !== currentUser.uid) {
            throw new Error("Unauthorized access")
          }

          const fetchedSession: Session = {
            id: sessionSnap.id,
            sessionDate: data.sessionDate.toDate(),
            therapistId: data.therapistId,
            summary: data.summary,
            shortSummary: data.shortSummary || "",
            keyPoints: data.keyPoints || [],
            insights: data.insights || [],
            mood: data.mood || "",
            progress: data.progress || "",
            goals: data.goals || [],
            warnings: data.warnings || [],
            transcript: data.transcript || "",
            journalingPrompt: data.journalingPrompt || "",
            journalingResponse: data.journalingResponse || "",
            patientId: data.patientId,
            status: data.status || "",
          }

          const patientRef = doc(db, "users", fetchedSession.patientId)
          const patientSnap = await getDoc(patientRef)
          if (patientSnap.exists()) {
            const patientData = patientSnap.data()
            setPatientName(`${patientData.first_name} ${patientData.last_name}`)
          }

          setSessionData(fetchedSession)
        } else {
          console.error("Session not found.")
        }
      } catch (error) {
        console.error("Error fetching session details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionDetails()
  }, [sessionId])

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto">Loading session details...</div>
  }

  if (!sessionData) {
    return <div className="p-6 max-w-4xl mx-auto">Session not found or you are not authorized to view it.</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/therapist/patients/sessions/${sessionData.patientId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient Sessions
        </Button>
        <h1 className="text-3xl font-bold text-[#146C94]">Session Details</h1>
        <p className="text-gray-600 mt-1">Complete summary and insights from the session with {patientName}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{sessionData.sessionDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{sessionData.sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <span>with {patientName}</span>
            </div>
            <Badge variant="outline" className="text-[#146C94]">
              {sessionData.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#146C94]" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-line">{sessionData.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#146C94]" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sessionData.insights.map((insight, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <ChevronRight className="h-4 w-4 text-[#146C94]" />
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#146C94]" />
                Emotional State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{sessionData.mood}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-[#146C94]" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sessionData.goals.map((goal, index) => (
                  <li key={index} className="text-gray-600 flex items-start gap-2">
                    <span className="text-[#146C94]">•</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#146C94]" />
                Points to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sessionData.warnings.map((warning, index) => (
                  <li key={index} className="text-gray-600 flex items-start gap-2">
                    <span className="text-[#146C94]">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}