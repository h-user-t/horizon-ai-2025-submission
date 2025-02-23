import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  setDoc,
} from "firebase/firestore";
import { MessageSquare, Send } from "lucide-react";
import { Contact, Conversation, Message, MessagePageProps } from "./message/types";

export default function MessagePage({ userId, userType, onError }: MessagePageProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    
    const fetchContacts = async () => {
      try {
        const sessionsRef = collection(db, "sessions");
        const sessionQuery = query(
          sessionsRef, 
          where(`${userType}Id`, "==", userId)
        );
        const sessionSnapshot = await getDocs(sessionQuery);
        const contactIds = new Set<string>();
        sessionSnapshot.forEach(doc => {
          const otherPartyId = userType === 'patient' ? 
            doc.data().therapistId : 
            doc.data().patientId;
          contactIds.add(otherPartyId);
        });

        const conversationsRef = collection(db, "conversations");
        const convoQuery = query(
          conversationsRef, 
          where(`${userType}Id`, "==", userId)
        );

        const unsubscribeConversations = onSnapshot(convoQuery, async (snapshot) => {
          const contactsList = await Promise.all(
            Array.from(contactIds).map(async (contactId) => {
              const userRef = doc(db, "users", contactId);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data();
              
              const name = userType === 'patient' 
                ? `Dr. ${userData?.last_name || 'Unknown'}`
                : `${userData?.first_name || 'Unknown'} ${userData?.last_name || ''}`;

              const conversationId = userType === 'patient'
                ? `${contactId}_${userId}`
                : `${userId}_${contactId}`;
              
              const conversation = snapshot.docs.find(d => d.id === conversationId)?.data() as Conversation | undefined;

              return {
                id: contactId,
                name: name.trim(),
                conversationId,
                lastMessage: conversation?.lastMessage || "",
                lastMessageTimestamp: conversation?.lastMessageTimestamp || null,
                unreadCount: userType === 'patient' 
                  ? conversation?.unreadCountPatient || 0
                  : conversation?.unreadCountTherapist || 0
              };
            })
          );

          contactIds.forEach(contactId => {
            const conversationId = userType === 'patient'
              ? `${contactId}_${userId}`
              : `${userId}_${contactId}`;

            const defaultConversation: Partial<Conversation> = {
              patientId: userType === 'patient' ? userId : contactId,
              therapistId: userType === 'patient' ? contactId : userId,
              lastMessage: "",
              lastMessageTimestamp: null,
              unreadCountTherapist: 0,
              unreadCountPatient: 0
            };

            setDoc(doc(db, "conversations", conversationId), defaultConversation, { merge: true });
          });

          setContacts(contactsList.sort((a, b) => {
            const timeA = a.lastMessageTimestamp?.toMillis() || 0;
            const timeB = b.lastMessageTimestamp?.toMillis() || 0;
            return timeB - timeA;
          }));
          setLoading(false);
        });

        return () => unsubscribeConversations();
      } catch (error) {
        setLoading(false);
        onError?.(error as Error);
      }
    };

    fetchContacts();
  }, [userId, userType, onError]);

  useEffect(() => {
    if (selectedContact && userId) {
      const db = getFirestore();
      const conversationId = userType === 'patient'
        ? `${selectedContact}_${userId}`
        : `${userId}_${selectedContact}`;
      
      const conversationRef = doc(db, "conversations", conversationId);
      const messagesRef = collection(conversationRef, "messages");

      const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
        const msgs = snapshot.docs.map(doc => doc.data() as Message);
        setMessages(msgs.sort((a, b) => {
          const timeA = a.timestamp?.toMillis() || 0;
          const timeB = b.timestamp?.toMillis() || 0;
          return timeA - timeB;
        }));

        snapshot.docs.forEach(doc => {
          if (!doc.data().read && doc.data().senderId !== userId) {
            updateDoc(doc.ref, { read: true });
          }
        });

        const updateData = {
          [userType === 'patient' ? 'unreadCountPatient' : 'unreadCountTherapist']: 0
        };
        updateDoc(conversationRef, updateData);
      });

      return () => unsubscribeMessages();
    } else {
      setMessages([]);
    }
  }, [selectedContact, userId, userType]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !userId) return;

    const db = getFirestore();
    const conversationId = userType === 'patient'
      ? `${selectedContact}_${userId}`
      : `${userId}_${selectedContact}`;
    
    const conversationRef = doc(db, "conversations", conversationId);
    const messagesRef = collection(conversationRef, "messages");

    try {
      const newMessageData: Omit<Message, 'timestamp'> & { timestamp: unknown } = {
        senderId: userId,
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(messagesRef, newMessageData);

      const conversationUpdate = {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        [userType === 'patient' ? 'unreadCountTherapist' : 'unreadCountPatient']: increment(1),
        [userType === 'patient' ? 'unreadCountPatient' : 'unreadCountTherapist']: 0
      };

      await updateDoc(conversationRef, conversationUpdate);
      setNewMessage("");
    } catch (error) {
      onError?.(error as Error);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-[#146C94]">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full bg-white rounded-lg shadow-sm flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-1/3 border-r border-[#F6F1F1] flex flex-col">
          <div className="p-6 border-b border-[#F6F1F1] flex-shrink-0">
            <h2 className="text-lg font-semibold text-[#146C94]">
              {userType === 'patient' ? 'My Therapists' : 'My Patients'}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#146C94] p-6">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p>No {userType === 'patient' ? 'therapists' : 'patients'} yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F6F1F1]">
                {contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`
                      p-6 cursor-pointer transition duration-150 ease-in-out
                      ${selectedContact === contact.id 
                        ? 'bg-[#F6F1F1] border-l-4 border-[#AFD3E2]' 
                        : 'hover:bg-[#F6F1F1]'
                      }
                    `}
                    onClick={() => setSelectedContact(contact.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-[#AFD3E2] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#146C94] text-sm font-medium">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#146C94] truncate">
                            {contact.name}
                          </p>
                          {contact.lastMessageTimestamp && (
                            <span className="text-xs text-[#146C94]">
                              {contact.lastMessageTimestamp.toDate().toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <p className="text-sm text-[#146C94] opacity-70 truncate mt-1">
                            {contact.lastMessage}
                          </p>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="bg-[#AFD3E2] text-[#146C94] text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="w-2/3 flex flex-col h-full">
          <div className="p-6 border-b border-[#F6F1F1] flex-shrink-0">
            <h2 className="text-lg font-semibold text-[#146C94]">
              {selectedContact 
                ? contacts.find(c => c.id === selectedContact)?.name 
                : `Select a ${userType === 'patient' ? 'therapist' : 'patient'}`}
            </h2>
          </div>

          {/* Messages Container with fixed height and internal scrolling */}
          <div className="flex-1 min-h-0 flex flex-col">
            {selectedContact ? (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {messages.map((msg, index) => {
                  const isNewMessage = !msg.read && msg.senderId !== userId;
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDateDivider = prevMsg && 
                    new Date(msg.timestamp?.toDate()).toDateString() !== 
                    new Date(prevMsg.timestamp?.toDate()).toDateString();

                  return (
                    <div key={index}>
                      {showDateDivider && (
                        <div className="flex items-center justify-center my-6">
                          <div className="text-xs text-[#146C94] bg-[#F6F1F1] px-3 py-1 rounded-full">
                            {msg.timestamp?.toDate().toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      <div 
                        className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'} items-end gap-2`}
                      >
                        {msg.senderId !== userId && (
                          <div className="w-8 h-8 rounded-full bg-[#F6F1F1] flex-shrink-0" />
                        )}
                        <div className={`max-w-[70%] ${msg.senderId === userId ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`
                              rounded-2xl px-4 py-2 break-words
                              ${msg.senderId === userId 
                                ? 'bg-[#AFD3E2] text-[#146C94] rounded-br-sm' 
                                : `${isNewMessage ? 'bg-[#F6F1F1] border border-[#AFD3E2]' : 'bg-[#F6F1F1]'} rounded-bl-sm`
                              }
                              ${isNewMessage ? 'animate-pulse-light' : ''}
                            `}
                          >
                            {msg.text}
                          </div>
                          <div className="text-xs text-[#146C94] mt-1 px-1">
                            {msg.timestamp 
                              ? msg.timestamp.toDate().toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : 'Sending...'}
                          </div>
                        </div>
                        {msg.senderId === userId && (
                          <div className="w-8 h-8 rounded-full bg-[#AFD3E2] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#146C94]">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>

          {selectedContact && (
            <div className="p-4 border-t border-[#F6F1F1] flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#F6F1F1] rounded-full px-4 py-2">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type a message..."
                  className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none px-0 placeholder-[#146C94]/50"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button 
                  onClick={sendMessage}
                  className="bg-[#AFD3E2] hover:bg-[#AFD3E2]/90 text-[#146C94] rounded-full h-8 w-8 p-0 flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}