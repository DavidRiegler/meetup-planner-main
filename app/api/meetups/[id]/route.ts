import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import type { FirebaseMeetup, Meetup } from "@/lib/types"

// Update the GET handler to handle end date and time
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Fetching meetup with ID:", id)

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      console.log("Meetup not found with ID:", id)
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const data = meetupSnap.data() as FirebaseMeetup

    const meetupData: Meetup = {
      id: meetupSnap.id,
      title: data.title || "",
      description: data.description || "",
      location: data.location || "",
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      time: data.time || "",
      endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined,
      endTime: data.endTime || undefined,
      possibleDates: data.possibleDates
        ? data.possibleDates.map((d: any) => ({
            ...d,
            date: d.date?.toDate ? d.date.toDate() : new Date(d.date),
          }))
        : undefined,
      dateAvailabilities: data.dateAvailabilities || [],
      dateFinalized: data.dateFinalized || false,
      finalizedAt: data.finalizedAt?.toDate
        ? data.finalizedAt.toDate()
        : data.finalizedAt
          ? new Date(data.finalizedAt)
          : undefined,
      winningDateVotes: data.winningDateVotes || undefined,
      winningDateVoters: data.winningDateVoters || undefined,
      usesDatePolling: data.usesDatePolling || false, // Add the new field
      hostId: data.hostId || "",
      hostUsername: data.hostUsername || "",
      code: data.code || "",
      hasAlcohol: data.hasAlcohol || false,
      shoppingList: data.shoppingList || [],
      itemSuggestions: data.itemSuggestions || [],
      participants: data.participants || [],
      costs: data.costs || [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    }

    return NextResponse.json(meetupData)
  } catch (error) {
    console.error("Error fetching meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update the PUT handler to handle end date and time
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updateData = await request.json()

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    // Prepare update data
    const updatePayload = {
      ...updateData,
      date: new Date(updateData.date),
      updatedAt: new Date(),
    }

    // Handle optional end date
    if (updateData.endDate) {
      updatePayload.endDate = new Date(updateData.endDate)
    } else {
      // If endDate is empty string or null, remove it from the document
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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
