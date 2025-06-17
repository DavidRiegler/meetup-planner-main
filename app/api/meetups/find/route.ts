import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { parseDate, formatDateForAPI } from "@/lib/date-utils"

// Update the GET handler to handle end date and time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const meetupsRef = collection(db, "meetups")
    const q = query(meetupsRef, where("code", "==", code))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 })
    }

    const meetupDoc = querySnapshot.docs[0]
    const data = meetupDoc.data()

    const meetupData = {
      id: meetupDoc.id,
      ...data,
      date: formatDateForAPI(parseDate(data.date)),
      endDate: data.endDate ? formatDateForAPI(parseDate(data.endDate)) : null,
      createdAt: formatDateForAPI(parseDate(data.createdAt))
    }

    return NextResponse.json(meetupData)
  } catch (error) {
    console.error("Error finding meetup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
