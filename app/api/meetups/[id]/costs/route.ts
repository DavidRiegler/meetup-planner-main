import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"

interface CostItem {
  name: string
  amount: number
  sharedWith: string[]
}

interface CostRequestBody {
  participantId: string
  participantUsername: string
  items: CostItem[]
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data: CostRequestBody = await request.json()

    const cost = {
      id: uuidv4(),
      ...data,
      total: data.items.reduce((sum: number, item: CostItem) => sum + item.amount, 0),
      addedAt: new Date(),
    }

    const meetupRef = doc(db, "meetups", id)
    await updateDoc(meetupRef, {
      costs: arrayUnion(cost),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding cost:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
