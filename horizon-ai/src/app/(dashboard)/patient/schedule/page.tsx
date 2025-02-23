"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Video,
  Users,
  Plus,
  List,
  CalendarIcon
} from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"
import { Session, Therapist } from "./componenets/types"
import BookingDialog from "./componenets/DialogContentAppointment"
import AppointmentsList from "./componenets/AppointmentsList"

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [filter, setFilter] = useState("all")
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedHour, setSelectedHour] = useState<string>("")
  const [selectedMinute, setSelectedMinute] = useState<string>("")
  const [selectedTherapist, setSelectedTherapist] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }
        const db = getFirestore()
        const now = new Date()

        // Fetch sessions
        const sessionsRef = collection(db, "sessions")
        const q = query(
          sessionsRef,
          where("patientId", "==", currentUser.uid),
          where("sessionDate", ">=", now)
        )
        const querySnapshot = await getDocs(q)
        const fetchedSessions: Session[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          sessionDate: doc.data().sessionDate.toDate(),
          therapist: doc.data().therapist,
          therapistId: doc.data().therapistId,
          summary: doc.data().summary,
          detailedNotes: doc.data().detailedNotes || "",
          keyPoints: doc.data().keyPoints || [],
          insights: doc.data().insights || [],
          mood: doc.data().mood || "",
          progress: doc.data().progress || "",
          goals: doc.data().goals || [],
          warnings: doc.data().warnings || [],
          transcript: doc.data().transcript || "",
          journalingPrompt: doc.data().journalingPrompt || "",
          journalingResponse: doc.data().journalingResponse || "",
          patientId: doc.data().patientId,
          status: doc.data().status || "",
          icon: doc.data().type === "Group Session" ? Users : Video
        }))

        // Enhance sessions with therapist names
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
        setSessions(sessionsWithTherapistName)

        // Fetch therapists
        const therapistsRef = collection(db, "users")
        const therapistQuery = query(therapistsRef, where("role", "==", "therapist"))
        const therapistSnapshot = await getDocs(therapistQuery)
        const fetchedTherapists: Therapist[] = therapistSnapshot.docs.map(doc => ({
          id: doc.id,
          first_name: doc.data().first_name,
          last_name: doc.data().last_name,
        }))
        setTherapists(fetchedTherapists)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedHour || !selectedMinute || !selectedTherapist) {
      alert("Please fill all fields.")
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) return

    const db = getFirestore()
    const sessionDate = new Date(selectedDate)
    sessionDate.setHours(parseInt(selectedHour), parseInt(selectedMinute))

    const timeFormatted = `${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}`

    const newSession = {
      sessionDate: sessionDate,
      therapistId: selectedTherapist,
      patientId: currentUser.uid,
      summary: `Session with Dr. ${therapists.find(t => t.id === selectedTherapist)?.last_name}`,
      keyPoints: [],
      insights: [],
      mood: "Neutral",
      progress: "Upcoming",
      goals: [],
      warnings: [],
      transcript: "",
      journalingPrompt: "",
      journalingResponse: "",
      status: "scheduled",
    }

    try {
      const sessionRef = doc(collection(db, "sessions"))
      await setDoc(sessionRef, newSession)
      setSessions([...sessions, { 
        ...newSession, 
        id: sessionRef.id, 
        therapist: `Dr. ${therapists.find(t => t.id === selectedTherapist)?.last_name}`, 
        icon: Video 
      }])
      setOpen(false)
      setSelectedDate(new Date())
      setSelectedHour("")
      setSelectedMinute("")
      setSelectedTherapist("")
      setSuccessMessage(`Appointment booked for ${sessionDate.toLocaleDateString()} at ${timeFormatted}.`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Failed to book appointment.")
    }
  }

  const filteredSessions = sessions.filter(session => 
    filter === "all" || session.status === filter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#146C94] animate-pulse">Loading your schedule...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 mx-auto max-w-7xl min-h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Your Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your therapy sessions and appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-md"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-md"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#146C94] hover:bg-[#146C94]/90 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <BookingDialog
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedHour={selectedHour}
              onHourSelect={setSelectedHour}
              selectedMinute={selectedMinute}
              onMinuteSelect={setSelectedMinute}
              selectedTherapist={selectedTherapist}
              onTherapistSelect={setSelectedTherapist}
              therapists={therapists}
              onBookAppointment={handleBookAppointment}
            />
          </Dialog>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Calendar Sidebar */}
        <Card className="md:col-span-4 bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-[#146C94]">
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-gray-200"
            />
            {date && (
              <Button
                variant="ghost"
                className="mt-4 text-sm w-64"
                onClick={() => setDate(undefined)}
              >
                Clear date filter
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <div className="md:col-span-8 bg-white border-gray-200">
          <Card className="bg-white shadow-sm rounded-xl border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#146C94]">
                  {viewMode === "calendar" ? "Monthly Overview" : "Upcoming Sessions"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "scheduled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("scheduled")}
                  >
                    Scheduled
                  </Button>
                  <Button
                    variant={filter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AppointmentsList
                sessions={filteredSessions}
                filter={filter}
                onFilterChange={setFilter}
                onViewDetails={(id) => console.log(`View details for session ${id}`)}
                viewMode={viewMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}