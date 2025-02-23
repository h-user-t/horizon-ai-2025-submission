"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Calendar as CalendarLucide,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { auth } from "@/app/utils/firebase/config";
import {
  Firestore,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Session {
  id: string;
  sessionDate: Date;
  patientId: string;
  patientName: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
  time: string;
}

interface Patient {
  first_name?: string;
  last_name?: string;
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<string>("all");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        await fetchSessions(user.uid, db);
      } else {
        setSessions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchSessions = async (therapistId: string, db: Firestore) => {
    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(sessionsRef, where("therapistId", "==", therapistId));
      const querySnapshot = await getDocs(q);

      const sessionList: Session[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const sessionDate = data.sessionDate.toDate();

          const patientRef = doc(db, "users", data.patientId);
          const patientSnap = await getDoc(patientRef);
          const patientData = patientSnap.exists() ? patientSnap.data() as Patient : {};
          const patientName =
            patientData.first_name && patientData.last_name
              ? `${patientData.first_name} ${patientData.last_name}`
              : "Unknown Patient";

          return {
            id: docSnap.id,
            sessionDate,
            patientId: data.patientId,
            patientName,
            type: data.type || "Video Session",
            status: (data.status || "upcoming") as Session["status"],
            time: sessionDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })
      );

      setSessions(
        sessionList.sort(
          (a, b) => a.sessionDate.getTime() - b.sessionDate.getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  };

  const getStatusBadge = (status: Session["status"]) => {
    const statusStyles = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };
    return statusStyles[status] || statusStyles.default;
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesFilter = filter === "all" || session.status === filter;
    const matchesSearch =
      session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate =
      !date || session.sessionDate.toDateString() === date.toDateString();

    return matchesFilter && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#146C94] animate-pulse">
          Loading schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#146C94]">
            Therapist Schedule
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your therapy sessions and appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146C94] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
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

        <Card className="md:col-span-8 bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#146C94]">
                Appointments{" "}
                {filteredSessions.length > 0 && `(${filteredSessions.length})`}
              </CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sessions found for the selected filters
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0">
                      <Video className="h-6 w-6 text-[#146C94]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {session.patientName}
                        </h3>
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarLucide className="h-4 w-4" />
                          <span>
                            {session.sessionDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.time}</span>
                        </div>
                        <span className="text-[#146C94]">{session.type}</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusBadge(session.status)} px-3 py-1`}
                    >
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </Badge>

                    <Button
                      variant="outline"
                      className="flex-shrink-0 hover:bg-[#146C94] hover:text-white transition-colors"
                      onClick={() =>
                        console.log(`View details for session ${session.id}`)
                      }
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
  );
}