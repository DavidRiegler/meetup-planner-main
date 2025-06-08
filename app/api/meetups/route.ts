import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate a unique code for the meetup
    const code = generateMeetupCode()

    // Create the meetup object
    const meetup = {
      ...data,
      code,
      participants: [],
      costs: [],
      createdAt: new Date(),
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
    }

    // Add the document to Firestore
    const docRef = await addDoc(collection(db, "meetups"), meetup)

    // Return the created meetup with the Firestore document ID
    return NextResponse.json({
      ...meetup,
      id: docRef.id,
      date: meetup.date.toISOString(),
      endDate: meetup.endDate ? meetup.endDate.toISOString() : null,
      createdAt: meetup.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error creating meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateMeetupCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
