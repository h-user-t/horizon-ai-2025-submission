"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, User } from "lucide-react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface SessionCount {
  patientId: string;
  count: number;
}

export default function TherapistPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [sessionCounts, setSessionCounts] = useState<SessionCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }
        const db = getFirestore()
        const therapistId = currentUser.uid

        const sessionsRef = collection(db, "sessions")
        const q = query(sessionsRef, where("therapistId", "==", therapistId))
        const querySnapshot = await getDocs(q)

        const patientIds = new Set<string>()
        const sessionCountMap: { [key: string]: number } = {}
        querySnapshot.forEach(doc => {
          const data = doc.data()
          patientIds.add(data.patientId)
          sessionCountMap[data.patientId] = (sessionCountMap[data.patientId] || 0) + 1
        })

        const fetchedPatients: Patient[] = await Promise.all(
          Array.from(patientIds).map(async (patientId) => {
            const patientRef = doc(db, "users", patientId)
            const patientSnap = await getDoc(patientRef)
            return patientSnap.exists()
              ? { id: patientId, ...patientSnap.data() } as Patient
              : { id: patientId, first_name: "Unknown", last_name: "Patient" }
          })
        )

        const counts = Object.entries(sessionCountMap).map(([patientId, count]) => ({
          patientId,
          count,
        }))

        setPatients(fetchedPatients)
        setSessionCounts(counts)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading patients...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#146C94]">My Patients</h1>
        <p className="text-gray-600 mt-1">View and manage your patient list</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <p className="text-gray-600">No patients found.</p>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/therapist/patients/sessions/${patient.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-[#146C94]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {sessionCounts.find(sc => sc.patientId === patient.id)?.count || 0} sessions
                    </p>
                  </div>
                  <div className="flex items-center text-[#146C94] font-medium">
                    View Sessions
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}