"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  getDoc,
  increment,
  setDoc
} from "firebase/firestore"
import { auth } from "@/app/utils/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { MessageSquare, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface Conversation {
  id: string; // ${therapistId}_${patientId}
  patientName: string;
  lastMessage: string;
  lastMessageTimestamp: Date | null;
  unreadCount: number;
  patientId: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export default function TherapistMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore()
        const therapistId = user.uid

        // Fetch unique patients from sessions
        const sessionsRef = collection(db, "sessions")
        const sessionQuery = query(sessionsRef, where("therapistId", "==", therapistId))
        const sessionSnapshot = await getDocs(sessionQuery)
        const patientIds = new Set<string>()
        sessionSnapshot.forEach(doc => patientIds.add(doc.data().patientId))

        // Listen to conversations in real-time
        const conversationsRef = collection(db, "conversations")
        const convoQuery = query(conversationsRef, where("therapistId", "==", therapistId))
        const unsubscribeConversations = onSnapshot(convoQuery, async (snapshot) => {
          const convos: Conversation[] = await Promise.all(
            snapshot.docs.map(async (conversationDoc) => {
              const data = conversationDoc.data()
              const patientRef = doc(db, "users", data.patientId)
              const patientSnap = await getDoc(patientRef)
              const patientName = patientSnap.exists() 
                ? `${patientSnap.data().first_name} ${patientSnap.data().last_name}` 
                : "Unknown Patient"
              return {
                id: conversationDoc.id,
                patientName,
                lastMessage: data.lastMessage || "",
                lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || null,
                unreadCount: data.unreadCountTherapist || 0,
                patientId: data.patientId
              }
            })
          )

          // Ensure all patients from sessions have a conversation entry
          patientIds.forEach(patientId => {
            if (!convos.some(convo => convo.patientId === patientId)) {
              const conversationId = `${therapistId}_${patientId}`
              setDoc(doc(db, "conversations", conversationId), {
                therapistId,
                patientId,
                lastMessage: "",
                lastMessageTimestamp: null,
                unreadCountTherapist: 0,
                unreadCountPatient: 0
              }, { merge: true })
            }
          })

          setConversations(convos.sort((a, b) => 
            (b.lastMessageTimestamp?.getTime() || 0) - (a.lastMessageTimestamp?.getTime() || 0)
          ))
          setLoading(false)
        })

        return () => unsubscribeConversations()
      } else {
        router.push("/signin")
      }
    })

    return () => unsubscribeAuth()
  }, [router])

  useEffect(() => {
    if (selectedConversation) {
      const db = getFirestore()
      const messagesRef = collection(doc(db, "conversations", selectedConversation), "messages")
      const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            // Handle null timestamp gracefully
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            read: data.read
          }
        })
        setMessages(msgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))

        // Mark messages as read for therapist
        const unreadMessages = msgs.filter(msg => !msg.read && msg.senderId !== auth.currentUser?.uid)
        unreadMessages.forEach(msg => {
          updateDoc(doc(messagesRef, msg.id), { read: true })
        })
        updateDoc(doc(getFirestore(), "conversations", selectedConversation), { unreadCountTherapist: 0 })
      })

      return () => unsubscribeMessages()
    } else {
      setMessages([])
    }
  }, [selectedConversation])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !auth.currentUser) return

    const db = getFirestore()
    const therapistId = auth.currentUser.uid
    const conversationRef = doc(db, "conversations", selectedConversation)
    const messagesRef = collection(conversationRef, "messages")
    const patientId = selectedConversation.split('_')[1]

    await addDoc(messagesRef, {
      senderId: therapistId,
      text: newMessage,
      timestamp: serverTimestamp(),
      read: false
    })

    await updateDoc(conversationRef, {
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
      unreadCountPatient: increment(1),
      unreadCountTherapist: 0
    })

    setNewMessage("")
  }

  if (loading) return <div className="p-6">Loading messages...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-gray-600">No conversations yet.</p>
          ) : (
            <div className="space-y-4">
              {conversations.map(conv => (
                <Card 
                  key={conv.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedConversation === conv.id ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <CardContent>
                    <p className="font-medium">{conv.patientName}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && <Badge>{conv.unreadCount}</Badge>}
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
            {selectedConversation ? conversations.find(c => c.id === selectedConversation)?.patientName : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedConversation ? (
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
            <p className="text-gray-600">No conversation selected</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}