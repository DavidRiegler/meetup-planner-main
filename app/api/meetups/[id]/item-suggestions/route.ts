import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"
import type { ItemSuggestion } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const suggestion: ItemSuggestion = {
      id: uuidv4(),
      participantId: data.participantId,
      participantUsername: data.participantUsername,
      name: data.name,
      baseAmount: data.baseAmount,
      unit: data.unit,
      category: data.category,
      perPerson: data.perPerson,
      reason: data.reason || "",
      suggestedAt: new Date(),
    }

    await updateDoc(meetupRef, {
      itemSuggestions: arrayUnion(suggestion),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding item suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
