import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Joining meetup with ID:", id)

    const data = await request.json()
    console.log("Join data:", data)

    // First check if the document exists
    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      console.log("Meetup not found with ID:", id)
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const participant = {
      id: uuidv4(),
      participantId: data.participantId,
      username: data.username,
      isVegetarian: data.isVegetarian || false,
      isVegan: data.isVegan || false,
      drinksAlcohol: data.drinksAlcohol || false,
      stayDuration: data.stayDuration || 0,
      joinTime: data.joinTime || "",
      suggestions: data.suggestions || "",
      bringingItems: data.bringingItems || [],
      joinedAt: new Date(),
    }

    // Update the document
    await updateDoc(meetupRef, {
      participants: arrayUnion(participant),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
