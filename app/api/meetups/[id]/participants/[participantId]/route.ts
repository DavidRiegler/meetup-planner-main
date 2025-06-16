import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { Participant } from "@/lib/types"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; participantId: string } }) {
  try {
    const { id, participantId } = params

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const participants = meetupData.participants || []

    // Remove the participant
    const updatedParticipants = participants.filter((p: Participant) => p.id !== participantId)

    await updateDoc(meetupRef, {
      participants: updatedParticipants,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing participant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
