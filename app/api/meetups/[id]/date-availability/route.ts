import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { DateAvailability } from "@/lib/types"

interface DateAvailabilityRequest {
  participantId: string
  username: string
  availabilities: Array<{
    dateId: string
    available: boolean
  }>
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { participantId, username, availabilities }: DateAvailabilityRequest = await request.json()

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const existingAvailabilities = meetupData.dateAvailabilities || []

    // Remove existing availabilities for this participant
    const filteredAvailabilities = existingAvailabilities.filter(
      (a: DateAvailability) => a.participantId !== participantId,
    )

    // Add new availabilities
    const newAvailabilities: DateAvailability[] = availabilities.map((a) => ({
      participantId,
      username,
      dateId: a.dateId,
      available: a.available,
    }))

    const updatedAvailabilities = [...filteredAvailabilities, ...newAvailabilities]

    await updateDoc(meetupRef, {
      dateAvailabilities: updatedAvailabilities,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating date availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
