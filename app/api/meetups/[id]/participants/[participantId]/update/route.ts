import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export async function PUT(request: NextRequest, { params }: { params: { id: string; participantId: string } }) {
  try {
    const { id, participantId } = params
    const updateData = await request.json()

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const participants = meetupData.participants || []

    // Find and update the participant
    const updatedParticipants = participants.map((p: any) => {
      if (p.participantId === participantId) {
        return {
          ...p,
          ...updateData,
          updatedAt: new Date(),
        }
      }
      return p
    })

    await updateDoc(meetupRef, {
      participants: updatedParticipants,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating participant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
