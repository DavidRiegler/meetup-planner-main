import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { DateAvailability, MeetupDate } from "@/lib/types"

// Define the type for date votes
interface DateVote {
  date: MeetupDate;
  votes: number;
  voters: string[];
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const meetupRef = doc(db, "meetups", id)
    const meetupSnap = await getDoc(meetupRef)

    if (!meetupSnap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupData = meetupSnap.data()
    const possibleDates = meetupData.possibleDates || []
    const dateAvailabilities = meetupData.dateAvailabilities || []

    if (possibleDates.length === 0) {
      return NextResponse.json({ error: "No date options available" }, { status: 400 })
    }

    // Calculate votes for each date
    const dateVotes: DateVote[] = possibleDates.map((date: MeetupDate) => {
      const availabilities = dateAvailabilities.filter((a: DateAvailability) => a.dateId === date.id && a.available)
      return {
        date,
        votes: availabilities.length,
        voters: availabilities.map((a: DateAvailability) => a.username),
      }
    })

    // Find the date with the most votes
    const winningDate = dateVotes.reduce((prev: DateVote, current: DateVote) => (current.votes > prev.votes ? current : prev))

    if (winningDate.votes === 0) {
      return NextResponse.json({ error: "No votes received for any date option" }, { status: 400 })
    }

    // Update the meetup with the winning date
    const updateData = {
      date: winningDate.date.date,
      time: winningDate.date.time,
      endTime: winningDate.date.endTime || null,
      dateFinalized: true,
      finalizedAt: new Date(),
      winningDateVotes: winningDate.votes,
      winningDateVoters: winningDate.voters,
    }

    await updateDoc(meetupRef, updateData)

    return NextResponse.json({
      success: true,
      winningDate: winningDate.date,
      votes: winningDate.votes,
      voters: winningDate.voters,
    })
  } catch (error) {
    console.error("Error finalizing date:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}