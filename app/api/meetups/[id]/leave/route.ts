import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const participants = meetupData.participants || []

    // Remove the participant
    const updatedParticipants = participants.filter((p: any) => p.participantId !== participantId)

    await updateDoc(meetupRef, {
      participants: updatedParticipants,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
