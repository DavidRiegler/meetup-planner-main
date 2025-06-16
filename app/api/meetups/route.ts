import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import type { MeetupDate } from "@/lib/types"

interface CreateMeetupRequest {
  title: string
  description: string
  location: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  hasAlcohol: boolean
  hostId: string
  hostUsername: string
  shoppingList: Array<{
    id: string
    name: string
    baseAmount: number
    unit: string
    category: string
    perPerson?: boolean
  }>
  possibleDates?: Array<{
    id: string
    date: Date
    time: string
    endTime?: string
    description?: string
  }>
  usesDatePolling?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateMeetupRequest = await request.json()

    // Generate a unique code for the meetup
    const code = generateMeetupCode()

    // Create the meetup object
    const meetup = {
      ...data,
      code,
      participants: [],
      costs: [],
      itemSuggestions: [],
      dateAvailabilities: [],
      createdAt: new Date(),
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      possibleDates: data.possibleDates
        ? data.possibleDates.map((d: MeetupDate) => ({
            ...d,
            date: new Date(d.date),
          }))
        : [],
      // Set initial polling state
      usesDatePolling: data.usesDatePolling || false,
      dateFinalized: data.usesDatePolling ? false : true, // If using polling, not finalized yet
    }

    console.log("Creating meetup with data:", {
      title: meetup.title,
      date: meetup.date,
      usesDatePolling: meetup.usesDatePolling,
      possibleDatesCount: meetup.possibleDates.length,
      dateFinalized: meetup.dateFinalized,
    })

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
