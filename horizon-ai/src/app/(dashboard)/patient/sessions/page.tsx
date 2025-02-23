"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Target,
  ChevronRight,
  PenLine
} from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

// Define a proper interface for a session document
export interface Session {
  id: string;
  sessionDate: Date;       // Full date and time of the session
  therapist: string;       // Therapist's display name (to be fetched from users collection)
  therapistId: string;     // Therapist's UID (matches a document in users)
  summary: string;
  shortSummary?: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;        // E.g., "Upcoming", "Completed", etc.
  goals: string[];
  warnings: string[];
  transcript: string;
  journalingPrompt: string;
  journalingResponse: string;
  patientId: string;
  status: string;
}

export default function SessionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("recent")
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch sessions from Firestore for the logged-in patient and then update therapist name based on therapistId
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }
        const db = getFirestore()
        const sessionsRef = collection(db, "sessions")
        // Filter sessions where the patientId equals the logged-in user's uid
        const q = query(sessionsRef, where("patientId", "==", currentUser.uid))
        const querySnapshot = await getDocs(q)
        let fetchedSessions: Session[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            sessionDate: data.sessionDate.toDate(), // Convert Firestore Timestamp to JavaScript Date
            therapist: data.therapist, // initial value (may be overwritten)
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
        })

        // For each session, fetch the therapist's user document and update the displayed therapist name to "Dr. {last_name}"
        const sessionsWithTherapistName = await Promise.all(
          fetchedSessions.map(async (session) => {
            if (session.therapistId) {
              const therapistRef = doc(db, "users", session.therapistId)
              const therapistSnap = await getDoc(therapistRef)
              if (therapistSnap.exists()) {
                const therapistData = therapistSnap.data()
                // Update the therapist field to include the "Dr." prefix and the last name
                return {
                  ...session,
                  therapist: `Dr. ${therapistData.last_name}`
                }
              }
            }
            return session
          })
        )

        // Sort sessions so the latest session is first
        sessionsWithTherapistName.sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
        setSessions(sessionsWithTherapistName)
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto">No sessions found.</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Session Review</h1>
          <p className="text-gray-600 mt-1">Review your therapy journey and progress</p>
        </div>
      </div>

      {/* Latest Session Summary */}
      <Link href={`/patient/sessions/${sessions[0].id}`} className="block mb-8">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Latest Session Summary</CardTitle>
              <Badge variant="outline" className="text-[#146C94]">AI Generated</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{sessions[0].sessionDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{sessions[0].sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span>with {sessions[0].therapist}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Session Overview */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">Session Overview</h3>
                <p className="text-gray-600">{sessions[0].summary}</p>
              </div>

              {/* Key Insights Preview */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  Key Insights
                </h3>
                <ul className="space-y-2">
                  {sessions[0].keyPoints.slice(0, 2).map((point, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <ChevronRight className="h-4 w-4 text-[#146C94]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Previous Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Previous Sessions</CardTitle>
            <div className="flex items-center gap-4">
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(1).map((entry) => (
              <Link 
                key={entry.id} 
                href={`./sessions/${entry.id}`}
                className="block"
              >
                <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{entry.sessionDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{entry.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span>with {entry.therapist}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[#146C94]">
                        {entry.progress}
                      </Badge>
                      {entry.mood && (
                        <Badge variant="secondary" className="bg-[#146C94]/10">
                          {entry.mood}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 line-clamp-2">{entry.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.keyPoints.slice(0, 2).map((point, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="bg-[#146C94]/5 text-[#146C94] border-[#146C94]/20"
                      >
                        {point}
                      </Badge>
                    ))}
                    {entry.keyPoints.length > 2 && (
                      <Badge 
                        variant="outline" 
                        className="bg-[#146C94]/5 text-[#146C94] border-[#146C94]/20"
                      >
                        +{entry.keyPoints.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#146C94]" />
                      <span className="text-sm text-gray-600">
                        {entry.goals.length} Action Items
                      </span>
                    </div>
                    <div className="flex items-center text-[#146C94] font-medium">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination / Load More */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="text-[#146C94] hover:bg-[#146C94]/10"
              onClick={() => console.log("Load more sessions")}
            >
              Load More Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
