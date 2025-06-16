import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { ItemSuggestion } from "@/lib/types"

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    // Await the params since they're now a Promise in newer Next.js versions
    const { id, suggestionId } = await params

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const suggestions = meetupData.itemSuggestions || []

    // Remove the suggestion
    const updatedSuggestions = suggestions.filter((s: ItemSuggestion) => s.id !== suggestionId)

    await updateDoc(meetupRef, {
      itemSuggestions: updatedSuggestions,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rejecting suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}