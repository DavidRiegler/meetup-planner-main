import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import type { FirebaseMeetup, Meetup } from "@/lib/types"

interface UpdateMeetupRequest {
  title?: string
  description?: string
  location?: string
  date?: string
  time?: string
  endDate?: string
  endTime?: string
  hasAlcohol?: boolean
}

// Update the GET handler to handle end date and time
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("Fetching meetup with ID:", id)

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      console.log("Meetup not found with ID:", id)
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const data = meetupSnap.data() as FirebaseMeetup

    // Helper function to safely convert Firebase timestamps to dates
    const convertToDate = (timestamp: unknown): Date => {
      if (!timestamp) return new Date()
      if (timestamp instanceof Date) return timestamp
      if (typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp) {
        return (timestamp as { toDate: () => Date }).toDate()
      }
      if (typeof timestamp === "string" || typeof timestamp === "number") {
        return new Date(timestamp)
      }
      return new Date()
    }

    const meetupData: Meetup = {
      id: meetupSnap.id,
      title: data.title || "",
      description: data.description || "",
      location: data.location || "",
      date: convertToDate(data.date), // Convert string to Date
      time: data.time || "",
      endDate: data.endDate ? convertToDate(data.endDate) : undefined,
      endTime: data.endTime || undefined,
      possibleDates: data.possibleDates || [],
      dateAvailabilities: data.dateAvailabilities || [],
      dateFinalized: data.dateFinalized || false,
      finalizedAt: data.finalizedAt ? convertToDate(data.finalizedAt) : undefined,
      winningDateVotes: data.winningDateVotes || undefined,
      winningDateVoters: data.winningDateVoters || undefined,
      usesDatePolling: data.usesDatePolling || false,
      hostId: data.hostId || "",
      hostUsername: data.hostUsername || "",
      code: data.code || "",
      hasAlcohol: data.hasAlcohol || false,
      shoppingList: data.shoppingList || [],
      itemSuggestions: data.itemSuggestions || [],
      participants: data.participants || [],
      costs: data.costs || [],
      createdAt: convertToDate(data.createdAt),
      updatedAt: data.updatedAt ? convertToDate(data.updatedAt) : undefined,
    }

    return NextResponse.json(meetupData)
  } catch (error) {
    console.error("Error fetching meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update the PUT handler to handle end date and time
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updateData: UpdateMeetupRequest = await request.json()

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    // Prepare update data with proper Firebase types
    const updatePayload: Partial<FirebaseMeetup> & { updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    }

    // Only add fields that are being updated
    if (updateData.title !== undefined) {
      updatePayload.title = updateData.title
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description
    }
    if (updateData.location !== undefined) {
      updatePayload.location = updateData.location
    }
    if (updateData.time !== undefined) {
      updatePayload.time = updateData.time
    }
    if (updateData.endTime !== undefined) {
      updatePayload.endTime = updateData.endTime
    }
    if (updateData.hasAlcohol !== undefined) {
      updatePayload.hasAlcohol = updateData.hasAlcohol
    }

    if (updateData.date) {
      updatePayload.date = updateData.date // Direkt als String speichern
    }

    // Handle optional end date
    if (updateData.endDate) {
      updatePayload.endDate = updateData.endDate // Direkt als String speichern
    } else if (updateData.endDate === "") {
      updatePayload.endDate = null
    }

    // Update the meetup
    await updateDoc(meetupRef, updatePayload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    await deleteDoc(meetupRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}