import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore"; // Import Firestore functions

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY_ID!,
  secretAccessKey: process.env.S3_KEY_SECRET!,
  region: process.env.S3_REGION!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { s3Key, selectedDate, selectedHour, selectedMinute, selectedTherapist, userId } = await req.json(); // Get additional session info from request body

    if (!s3Key || !selectedDate || !selectedHour || !selectedMinute || !selectedTherapist || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const db = getFirestore();

    // Download MP4 file from S3
    const bucketName = process.env.S3_BUCKET!;
    const objectKey = s3Key.replace(/^s3:\/\/[^/]+\//, ""); // Ensure correct format
    const filePath = `/tmp/${path.basename(objectKey)}`;
    const fileStream = fs.createWriteStream(filePath);

    const s3Stream = s3.getObject({ Bucket: bucketName, Key: objectKey }).createReadStream();

    await new Promise((resolve, reject) => {
      s3Stream.pipe(fileStream);
      s3Stream.on("end", resolve);
      s3Stream.on("error", reject);
    });

    // Send to OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(filePath) as any,
      response_format: "json",
    });

    // Cleanup: Remove temp file
    fs.unlinkSync(filePath);

    console.log('Transcription:', transcription.text);

    // Call getSummary API with the transcription text
    const summaryResponse = await fetch("http://localhost:3000/api/getSummary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: transcription.text }),
    });

    if (!summaryResponse.ok) {
      throw new Error("Failed to get summary");
    }

    const summary = await summaryResponse.json();
    const timeFormatted = `${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}`;

    // Prepare the session data
    const sessionDate = new Date(selectedDate);
    sessionDate.setHours(parseInt(selectedHour), parseInt(selectedMinute));

    const newSession = {
      sessionDate: sessionDate,
      therapistId: selectedTherapist,
      patientId: userId,
      summary: summary.text, // Add the summary text here
      keyPoints: summary.keyPoints || [],  // Add any key points if provided in the summary
      insights: summary.insights || [],    // Add any insights if provided in the summary
      mood: "Neutral",
      progress: "Upcoming",
      goals: [],
      warnings: [],
      transcript: transcription.text, // Store the full transcription text
      journalingPrompt: "",
      journalingResponse: "",
      status: "scheduled",
    };

    // Add the new session to Firestore
    const sessionRef = doc(collection(db, "sessions"));
    await setDoc(sessionRef, newSession);

    console.log('Session added successfully:', newSession);

    return NextResponse.json({ transcription, summary }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
