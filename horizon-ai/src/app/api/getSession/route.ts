import { NextRequest, NextResponse } from "next/server";
import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Import Firestore functions

// Initialize Firestore
const db = getFirestore();

export async function PUT(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    // Extract sessionId from the URL params
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Parse the request body for fields to update
    const {
      sessionDate,
      therapistId,
      patientId,
      summary,
      keyPoints,
      insights,
      mood,
      progress,
      goals,
      warnings,
      transcript,
      journalingPrompt,
      journalingResponse,
      status,
    } = await req.json();

    // Create an object with only the provided fields to update
    const updatedSession: { [key: string]: any } = {};

    if (sessionDate) {
      const date = new Date(sessionDate);
      updatedSession.sessionDate = date;
    }
    if (therapistId) updatedSession.therapistId = therapistId;
    if (patientId) updatedSession.patientId = patientId;
    if (summary) updatedSession.summary = summary;
    if (keyPoints) updatedSession.keyPoints = keyPoints;
    if (insights) updatedSession.insights = insights;
    if (mood) updatedSession.mood = mood;
    if (progress) updatedSession.progress = progress;
    if (goals) updatedSession.goals = goals;
    if (warnings) updatedSession.warnings = warnings;
    if (transcript) updatedSession.transcript = transcript;
    if (journalingPrompt !== undefined) updatedSession.journalingPrompt = journalingPrompt;
    if (journalingResponse !== undefined) updatedSession.journalingResponse = journalingResponse;
    if (status) updatedSession.status = status;

    // Check if there’s anything to update
    if (Object.keys(updatedSession).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    // Reference to the session document in Firestore
    const sessionRef = doc(db, "sessions", sessionId);

    // Update the session document
    await updateDoc(sessionRef, updatedSession);

    console.log(`Session ${sessionId} updated successfully:`, updatedSession);

    return NextResponse.json({ message: "Session updated successfully", updatedSession }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}