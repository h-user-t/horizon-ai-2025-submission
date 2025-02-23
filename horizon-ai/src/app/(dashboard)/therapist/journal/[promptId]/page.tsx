"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Heart,
  Target,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  Bot,
  Send,
} from "lucide-react"

// Sample data - In a real app, this would come from an API
const journalEntry = {
  id: 1,
  date: "2025-02-20",
  time: "3:30 PM",
  therapist: "Dr. Sarah Smith",
  summary: "Today's session focused on developing coping strategies for work-related stress. We identified specific triggers and created an action plan for managing overwhelming situations.",
  detailedNotes: `During our session, we delved deep into the sources of work-related stress. Several key patterns emerged:

1. Difficulty setting boundaries with colleagues
2. Tendency to take on too many responsibilities
3. Perfectionistic tendencies leading to burnout

We explored these patterns using cognitive behavioral techniques and developed specific strategies for each challenge.`,
  keyPoints: [
    "Identified workplace stressors",
    "Developed breathing techniques for immediate stress relief",
    "Created a boundary-setting strategy for work-life balance"
  ],
  insights: [
    "Connection between perfectionism and anxiety",
    "Impact of childhood experiences on work habits",
    "Role of self-compassion in stress management"
  ],
  mood: "Hopeful",
  progress: "Good",
  goals: [
    "Practice deep breathing twice daily",
    "Set work boundaries by limiting after-hours emails",
    "Schedule regular breaks during workday"
  ],
  warnings: [
    "Pay attention to early signs of burnout",
    "Notice when perfectionism is becoming harmful"
  ]
}

export default function SessionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { promptId } = params

  // Chat state
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I understand you'd like to know more about this session. What specific aspect would you like me to explain further?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 1500)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Button>
        <h1 className="text-3xl font-bold text-[#146C94]">Session Details</h1>
        <p className="text-gray-600 mt-1">Complete summary and insights from your therapy session</p>
      </div>

      {/* Session Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(journalEntry.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{journalEntry.time}</span>
              </div>
              <span>with {journalEntry.therapist}</span>
            </div>
            <Badge variant="outline" className="text-[#146C94]">
              {journalEntry.progress}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Summary and Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Session Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#146C94]" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">{journalEntry.detailedNotes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#146C94]" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {journalEntry.insights.map((insight, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <ChevronRight className="h-4 w-4 text-[#146C94]" />
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress and Actions */}
        <div className="space-y-6">
          {/* Emotional State */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#146C94]" />
                Emotional State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{journalEntry.mood}</p>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-[#146C94]" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {journalEntry.goals.map((goal, index) => (
                  <li key={index} className="text-gray-600 flex items-start gap-2">
                    <span className="text-[#146C94]">•</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Points to Watch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#146C94]" />
                Points to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {journalEntry.warnings.map((warning, index) => (
                  <li key={index} className="text-gray-600 flex items-start gap-2">
                    <span className="text-[#146C94]">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#146C94]" />
              Ask Questions About This Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <div className="h-48 overflow-y-auto mb-4 space-y-2 border rounded-lg p-4">
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <Bot className="h-8 w-8 text-[#146C94]/40 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Ask me anything about this session's insights and recommendations.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-lg p-2 max-w-[80%] ${
                          message.type === 'user'
                            ? 'bg-[#146C94] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#146C94] hover:bg-[#146C94]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}