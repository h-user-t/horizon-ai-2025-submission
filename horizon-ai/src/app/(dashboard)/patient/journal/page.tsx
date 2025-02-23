"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Calendar as CalendarIcon,
  Clock,
  PenLine,
  Edit,
  Save,
} from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

// Define an interface for a session
interface Session {
  id: string;
  sessionDate: Date;
  therapist: string;
  therapistId: string;
  summary: string;
  shortSummary?: string;
  journalingPrompt: string;
  journalingResponse: string;
  patientId: string;
  status: string;
}

export default function JournalPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<{ [key: string]: string }>({})
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editedResponse, setEditedResponse] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Fetch sessions from Firestore
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
        const q = query(sessionsRef, where("patientId", "==", currentUser.uid))
        const querySnapshot = await getDocs(q)
        const fetchedSessions: Session[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            sessionDate: data.sessionDate.toDate(),
            therapist: data.therapist,
            therapistId: data.therapistId,
            summary: data.summary,
            shortSummary: data.shortSummary || "",
            journalingPrompt: data.journalingPrompt || "",
            journalingResponse: data.journalingResponse || "",
            patientId: data.patientId,
            status: data.status || "",
          }
        })

        const sessionsWithTherapistName = await Promise.all(
          fetchedSessions.map(async (session) => {
            if (session.therapistId) {
              const therapistRef = doc(db, "users", session.therapistId)
              const therapistSnap = await getDoc(therapistRef)
              if (therapistSnap.exists()) {
                const therapistData = therapistSnap.data()
                return {
                  ...session,
                  therapist: `Dr. ${therapistData.last_name}`
                }
              }
            }
            return session
          })
        )

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

  // Handle response change for unanswered prompts
  const handleResponseChange = (sessionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [sessionId]: value
    }))
  }

  // Handle submitting a new journaling response
  const handleSubmitResponse = async (sessionId: string) => {
    const response = responses[sessionId] || ""
    if (!response.trim()) {
      alert("Please enter a response before submitting.")
      return
    }

    const db = getFirestore()
    const sessionRef = doc(db, "sessions", sessionId)

    try {
      await updateDoc(sessionRef, { journalingResponse: response })
      setSessions(sessions.map(session =>
        session.id === sessionId ? { ...session, journalingResponse: response } : session
      ))
      setResponses(prev => ({
        ...prev,
        [sessionId]: ""
      }))
      setSuccessMessage("Your journal response has been successfully submitted.")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error submitting response:", error)
      alert("Failed to submit response. Please try again.")
    }
  }

  // Start editing an answered prompt
  const handleEditResponse = (sessionId: string, currentResponse: string) => {
    setEditingSessionId(sessionId)
    setEditedResponse(currentResponse)
  }

  // Save edited response
  const handleSaveEdit = async (sessionId: string) => {
    if (!editedResponse.trim()) {
      alert("Please enter a response before saving.")
      return
    }

    const db = getFirestore()
    const sessionRef = doc(db, "sessions", sessionId)

    try {
      await updateDoc(sessionRef, { journalingResponse: editedResponse })
      setSessions(sessions.map(session =>
        session.id === sessionId ? { ...session, journalingResponse: editedResponse } : session
      ))
      setEditingSessionId(null)
      setEditedResponse("")
      setSuccessMessage("Your journal response has been successfully updated.")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error updating response:", error)
      alert("Failed to update response. Please try again.")
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null)
    setEditedResponse("")
  }

  // Split sessions into answered and unanswered prompts
  const unansweredSessions = sessions.filter(session => session.journalingPrompt && !session.journalingResponse)
  const answeredSessions = sessions.filter(session => session.journalingPrompt && session.journalingResponse)

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading journal entries...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-md transition-opacity duration-500 ease-in-out">
          {successMessage}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Journal</h1>
          <p className="text-gray-600 mt-1">Reflect on your therapy sessions</p>
        </div>
      </div>

      {/* Unanswered Prompts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Unanswered Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          {unansweredSessions.length === 0 ? (
            <p className="text-gray-600">No unanswered prompts at this time.</p>
          ) : (
            <div className="space-y-6">
              {unansweredSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{session.sessionDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span>with {session.therapist}</span>
                    </div>
                    <Badge variant="outline" className="text-[#146C94]">{session.status}</Badge>
                  </div>
                  <div className="mb-4">
                    <Label className="font-medium text-gray-900">Prompt</Label>
                    <p className="text-gray-600 mt-1">{session.journalingPrompt}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-900">Your Response</Label>
                    <Textarea
                      value={responses[session.id] || ""}
                      onChange={(e) => handleResponseChange(session.id, e.target.value)}
                      placeholder="Type your response here..."
                      className="mt-2"
                      rows={4}
                    />
                    <Button
                      onClick={() => handleSubmitResponse(session.id)}
                      className="mt-2 bg-[#146C94] hover:bg-[#146C94]/90"
                      disabled={!responses[session.id]?.trim()} // Disable if no response
                    >
                      Submit Response
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answered Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Answered Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          {answeredSessions.length === 0 ? (
            <p className="text-gray-600">No answered prompts yet.</p>
          ) : (
            <div className="space-y-4">
              {answeredSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{session.sessionDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span>with {session.therapist}</span>
                    </div>
                    <Badge variant="outline" className="text-[#146C94]">{session.status}</Badge>
                  </div>
                  <div className="mb-2">
                    <Label className="font-medium text-gray-900">Prompt</Label>
                    <p className="text-gray-600 mt-1">{session.journalingPrompt}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-900">Your Response</Label>
                    {editingSessionId === session.id ? (
                      <div>
                        <Textarea
                          value={editedResponse}
                          onChange={(e) => setEditedResponse(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                        <div className="mt-2 flex gap-2">
                          <Button
                            onClick={() => handleSaveEdit(session.id)}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                            disabled={!editedResponse.trim()} // Disable if no response
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="text-[#146C94] hover:bg-[#146C94]/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{session.journalingResponse}</p>
                        <Button
                          onClick={() => handleEditResponse(session.id, session.journalingResponse)}
                          variant="outline"
                          className="mt-2 text-[#146C94] hover:bg-[#146C94]/10"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}