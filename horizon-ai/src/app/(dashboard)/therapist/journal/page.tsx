"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Brain,
  Target,
  ChevronRight,
  PenLine
} from "lucide-react"

// Sample journal entries data
const journalEntries = [
  {
    id: 1,
    date: "2025-02-20",
    time: "3:30 PM",
    therapist: "Dr. Sarah Smith",
    summary: "Today's session focused on developing coping strategies for work-related stress. We identified specific triggers and created an action plan for managing overwhelming situations.",
    keyPoints: [
      "Identified workplace stressors",
      "Developed breathing techniques for immediate stress relief",
      "Created a boundary-setting strategy for work-life balance"
    ],
    mood: "Hopeful",
    progress: "Good",
    goals: [
      "Practice deep breathing twice daily",
      "Set work boundaries by limiting after-hours emails"
    ]
  },
  {
    id: 2,
    date: "2025-02-13",
    time: "3:30 PM",
    therapist: "Dr. Sarah Smith",
    summary: "We explored childhood memories and their impact on current relationship patterns. Several breakthrough moments in understanding recurring behavioral patterns.",
    keyPoints: [
      "Connected past experiences to present behaviors",
      "Identified communication patterns in relationships",
      "Discussed healthy attachment styles"
    ],
    mood: "Reflective",
    progress: "Breakthrough",
    goals: [
      "Journal about childhood memories",
      "Practice new communication techniques"
    ]
  }
]

export default function JournalPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("recent")

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Session Journal</h1>
          <p className="text-gray-600 mt-1">Review your therapy journey and progress</p>
        </div>
        <Button 
          className="bg-[#146C94] hover:bg-[#146C94]/90"
          onClick={() => console.log("Add new entry")}
        >
          <PenLine className="mr-2 h-5 w-5" />
          Add Personal Note
        </Button>
      </div>

      {/* Latest Session Summary */}
      <Link href={`/patient/journal/${journalEntries[0].id}`} className="block mb-8">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Latest Session Summary</CardTitle>
              <Badge variant="outline" className="text-[#146C94]">AI Generated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Session Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(journalEntries[0].date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{journalEntries[0].time}</span>
                </div>
                <span>with {journalEntries[0].therapist}</span>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Session Overview</h3>
                <p className="text-gray-600">{journalEntries[0].summary}</p>
              </div>

              {/* Key Points Preview */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#146C94]" />
                  Key Insights
                </h3>
                <ul className="space-y-2">
                  {journalEntries[0].keyPoints.slice(0, 2).map((point, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <ChevronRight className="h-4 w-4 text-[#146C94]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
        {/* Previous Sessions */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Previous Sessions</CardTitle>
            <div className="flex items-center gap-4">
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.slice(1).map((entry) => (
              <Link 
                key={entry.id} 
                href={`/journal/${entry.id}`}
                className="block"
              >
                <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{entry.time}</span>
                      </div>
                      <span>with {entry.therapist}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[#146C94]">
                        {entry.progress}
                      </Badge>
                      {entry.mood && (
                        <Badge variant="secondary" className="bg-[#146C94]/10">
                          {entry.mood}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 line-clamp-2">{entry.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.keyPoints.slice(0, 2).map((point, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="bg-[#146C94]/5 text-[#146C94] border-[#146C94]/20"
                      >
                        {point}
                      </Badge>
                    ))}
                    {entry.keyPoints.length > 2 && (
                      <Badge 
                        variant="outline" 
                        className="bg-[#146C94]/5 text-[#146C94] border-[#146C94]/20"
                      >
                        +{entry.keyPoints.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#146C94]" />
                      <span className="text-sm text-gray-600">
                        {entry.goals.length} Action Items
                      </span>
                    </div>
                    <div className="flex items-center text-[#146C94] font-medium">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination or Load More */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="text-[#146C94] hover:bg-[#146C94]/10"
              onClick={() => console.log("Load more sessions")}
            >
              Load More Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}