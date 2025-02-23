"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Video,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Plus,
} from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

// Define an interface for a session
interface Session {
  id: string;
  sessionDate: Date;
  therapist: string;
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
  icon: any;
}

// Define an interface for a therapist
interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
}

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

  // Fetch sessions and therapists from Firestore
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

        // Fetch sessions (only current or future)
        const sessionsRef = collection(db, "sessions")
        const q = query(
          sessionsRef,
          where("patientId", "==", currentUser.uid),
          where("sessionDate", ">=", now)
        )
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
            icon: data.type === "Group Session" ? Users : Video
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

  // Handle booking an appointment
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedHour || !selectedMinute || !selectedTherapist) {
      alert("Please select a date, hour, minute, and therapist.")
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
      setSessions([...sessions, { ...newSession, id: sessionRef.id, therapist: `Dr. ${therapists.find(t => t.id === selectedTherapist)?.last_name}`, icon: Video }])
      setOpen(false)
      setSelectedDate(new Date())
      setSelectedHour("")
      setSelectedMinute("")
      setSelectedTherapist("")

      setSuccessMessage(`Appointment booked with Dr. ${therapists.find(t => t.id === selectedTherapist)?.last_name} on ${sessionDate.toLocaleDateString()} at ${timeFormatted}.`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Failed to book appointment. Please try again.")
    }
  }

  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true
    return session.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const hours = Array.from({ length: 9 }, (_, i) => (9 + i).toString()) // 9 to 17 (5 PM)
  const minutes = ["00", "30"]

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading sessions...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-md transition-opacity duration-500 ease-in-out">
          {successMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your therapy sessions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-[#146C94] hover:bg-[#146C94]/90">
              <Plus className="mr-2 h-5 w-5" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hour</Label>
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>
                          {parseInt(hour) > 12 ? `${parseInt(hour) - 12} PM` : `${hour} AM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Minutes</Label>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Therapist</Label>
                <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a therapist" />
                  </SelectTrigger>
                  <SelectContent>
                    {therapists.map(therapist => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        Dr. {therapist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleBookAppointment} className="w-full">
                Book Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Appointments</CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <p className="text-gray-600">No current or future appointments scheduled.</p>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0">
                      <session.icon className="h-6 w-6 text-[#146C94]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{session.therapist}</h3>
                        <Badge variant="secondary" className={getStatusBadge(session.status)}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => console.log(`View details for session ${session.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}