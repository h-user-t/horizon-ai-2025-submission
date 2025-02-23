"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  ChevronRight,
} from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

interface Session {
  id: string;
  sessionDate: Date;
  therapistId: string;
  summary: string;
  patientId: string;
  status: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TherapistPatientSessionsPage() {
  const { patientId } = useParams() as { patientId: string }
  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser || !patientId) {
          setLoading(false)
          return
        }
        const db = getFirestore()
        const therapistId = currentUser.uid

        // Fetch patient details
        const patientRef = doc(db, "users", patientId)
        const patientSnap = await getDoc(patientRef)
        if (patientSnap.exists()) {
          setPatient(patientSnap.data() as Patient)
        } else {
          setPatient({ id: patientId, first_name: "Unknown", last_name: "Patient" })
        }

        // Fetch sessions for this patient
        const sessionsRef = collection(db, "sessions")
        const q = query(
          sessionsRef,
          where("therapistId", "==", therapistId),
          where("patientId", "==", patientId)
        )
        const querySnapshot = await getDocs(q)

        const allSessions: Session[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          sessionDate: doc.data().sessionDate.toDate(),
          therapistId: doc.data().therapistId,
          summary: doc.data().summary || "No summary available",
          patientId: doc.data().patientId,
          status: doc.data().status || "upcoming",
        }))

        setSessions(allSessions)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId])

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const db = getFirestore()
      const sessionRef = doc(db, "sessions", sessionId)
      await updateDoc(sessionRef, { status: newStatus })
      setSessions(sessions.map(session =>
        session.id === sessionId ? { ...session, status: newStatus } : session
      ))
    } catch (error) {
      console.error("Error updating session status:", error)
    }
  }

  const pastSessions = sessions.filter(session => session.sessionDate < new Date())
  const upcomingSessions = sessions.filter(session => session.sessionDate >= new Date())

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading sessions...</div>
  }

  if (!patient) {
    return <div className="p-6 max-w-6xl mx-auto">Patient not found.</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/therapist/patients" className="inline-block mb-4 text-[#146C94] hover:underline">
          ← Back to Patients
        </Link>
        <h1 className="text-3xl font-bold text-[#146C94]">
          Sessions with {patient.first_name} {patient.last_name}
        </h1>
        <p className="text-gray-600 mt-1">View and manage session history</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-600">No upcoming sessions.</p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <Select
                        value={session.status}
                        onValueChange={(value) => updateSessionStatus(session.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{session.summary}</p>
                    <Link href={`/therapist/patients/sessions/details/${session.id}`} className="flex items-center justify-end mt-4 text-[#146C94] font-medium">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {pastSessions.length === 0 ? (
              <p className="text-gray-600">No past sessions.</p>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <Select
                        value={session.status}
                        onValueChange={(value) => updateSessionStatus(session.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{session.summary}</p>
                    <Link href={`/therapist/patients/sessions/details/${session.id}`} className="flex items-center justify-end mt-4 text-[#146C94] font-medium">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}