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
          const patientData = patientSnap.exists() ? (patientSnap.data() as Patient) : {};
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
          (a, b) 
