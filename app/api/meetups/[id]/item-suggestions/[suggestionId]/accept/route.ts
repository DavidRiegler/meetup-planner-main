import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"
import type { ItemSuggestion, ShoppingItem } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string; suggestionId: string } }) {
  try {
    const { id, suggestionId } = params

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const suggestions = meetupData.itemSuggestions || []
    const suggestion = suggestions.find((s: ItemSuggestion) => s.id === suggestionId)

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    // Create shopping item from suggestion
    const shoppingItem: ShoppingItem = {
      id: uuidv4(),
      name: suggestion.name,
      baseAmount: suggestion.baseAmount,
      unit: suggestion.unit,
      category: suggestion.category,
      perPerson: suggestion.perPerson,
    }

    // Remove suggestion and add to shopping list
    const updatedSuggestions = suggestions.filter((s: ItemSuggestion) => s.id !== suggestionId)

    await updateDoc(meetupRef, {
      itemSuggestions: updatedSuggestions,
      shoppingList: arrayUnion(shoppingItem),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error accepting suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
