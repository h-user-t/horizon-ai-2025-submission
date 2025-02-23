"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFirestore, collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, onSnapshot, serverTimestamp, getDoc, increment } from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { MessageSquare, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Therapist {
  id: string;
  name: string;
}

export default function PatientMessagesPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore()
        const patientId = user.uid

        // Fetch unique therapists from sessions
        const sessionsRef = collection(db, "sessions")
        const sessionQuery = query(sessionsRef, where("patientId", "==", patientId))
        const sessionSnapshot = await getDocs(sessionQuery)
        const therapistIds = new Set<string>()
        sessionSnapshot.forEach(doc => therapistIds.add(doc.data().therapistId))

        // Fetch therapist details
        const therapistList: Therapist[] = await Promise.all(
          Array.from(therapistIds).map(async (therapistId) => {
            const therapistRef = doc(db, "users", therapistId)
            const therapistSnap = await getDoc(therapistRef)
            return therapistSnap.exists() 
              ? { id: therapistId, name: `Dr. ${therapistSnap.data().last_name}` }
              : { id: therapistId, name: "Unknown Therapist" }
          })
        )
        setTherapists(therapistList)
        if (therapistList.length > 0) setSelectedTherapist(therapistList[0].id)

        // Ensure conversations exist for all therapists
        therapistIds.forEach(therapistId => {
          const conversationId = `${therapistId}_${patientId}`
          setDoc(doc(db, "conversations", conversationId), {
            therapistId,
            patientId,
            lastMessage: "",
            lastMessageTimestamp: null,
            unreadCountTherapist: 0,
            unreadCountPatient: 0
          }, { merge: true })
        })

        setLoading(false)
      } else {
        router.push("/signin")
      }
    })

    return () => unsubscribeAuth()
  }, [router])

  useEffect(() => {
    if (selectedTherapist && auth.currentUser) {
      const db = getFirestore()
      const patientId = auth.currentUser.uid
      const conversationId = `${selectedTherapist}_${patientId}`
      const conversationRef = doc(db, "conversations", conversationId)
      const messagesRef = collection(conversationRef, "messages")

      const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            read: data.read
          }
        })
        setMessages(msgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))

        // Mark messages as read for patient
        const unreadMessages = msgs.filter(msg => !msg.read && msg.senderId !== auth.currentUser?.uid)
        unreadMessages.forEach(msg => {
          updateDoc(doc(messagesRef, msg.id), { read: true })
        })
        updateDoc(conversationRef, { unreadCountPatient: 0 })
      })

      return () => unsubscribeMessages()
    } else {
      setMessages([])
    }
  }, [selectedTherapist])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTherapist || !auth.currentUser) return

    const db = getFirestore()
    const patientId = auth.currentUser.uid
    const conversationId = `${selectedTherapist}_${patientId}`
    const conversationRef = doc(db, "conversations", conversationId)
    const messagesRef = collection(conversationRef, "messages")

    await addDoc(messagesRef, {
      senderId: patientId,
      text: newMessage,
      timestamp: serverTimestamp(),
      read: false
    })

    await updateDoc(conversationRef, {
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
      unreadCountTherapist: increment(1),
      unreadCountPatient: 0
    })

    setNewMessage("")
  }

  if (loading) return <div className="p-6">Loading messages...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Therapists</CardTitle>
        </CardHeader>
        <CardContent>
          {therapists.length === 0 ? (
            <p className="text-gray-600">No therapists yet.</p>
          ) : (
            <div className="space-y-4">
              {therapists.map(therapist => (
                <Card 
                  key={therapist.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedTherapist === therapist.id ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => setSelectedTherapist(therapist.id)}
                >
                  <CardContent>
                    <p className="font-medium">{therapist.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-2/3">
        <CardHeader>
          <CardTitle>
            {selectedTherapist ? therapists.find(t => t.id === selectedTherapist)?.name : "Select a therapist"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTherapist ? (
            <>
              <div className="h-96 overflow-y-auto mb-4">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`mb-2 ${msg.senderId === auth.currentUser?.uid ? 'text-right' : 'text-left'}`}
                  >
                    <p className="inline-block p-2 rounded-lg bg-gray-100">{msg.text}</p>
                    <p className="text-xs text-gray-500">{msg.timestamp.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-600">No therapist selected</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}