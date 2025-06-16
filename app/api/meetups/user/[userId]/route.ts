import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { FirebaseMeetup, Meetup } from "@/lib/types"
import type { Timestamp } from "firebase/firestore"

const convertToDate = (
  value: Timestamp | Date | string | number | { toDate: () => Date } | null | undefined
): Date => {
  if (value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate()
  }
  if (value instanceof Date) {
    return value
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value)
  }
  // fallback for null, undefined, or unexpected types
  return new Date(0)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await the params since it's now a Promise in newer Next.js versions
    const { userId } = await params
    console.log("Fetching meetups for user:", userId)

    // Get hosted meetups
    const hostedQuery = query(collection(db, "meetups"), where("hostId", "==", userId))
    const hostedSnapshot = await getDocs(hostedQuery)

    const hosted: Meetup[] = hostedSnapshot.docs.map((doc) => {
      const data = doc.data() as FirebaseMeetup
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        date: convertToDate(data.date),
        time: data.time || "",
        endDate: data.endDate ? convertToDate(data.endDate) : undefined,
        endTime: data.endTime || undefined,
        hostId: data.hostId || "",
        hostUsername: data.hostUsername || "",
        code: data.code || "",
        hasAlcohol: data.hasAlcohol || false,
        shoppingList: data.shoppingList || [],
        participants: data.participants || [],
        costs: data.costs || [],
        createdAt: convertToDate(data.createdAt),
      }
    })

    console.log(`Found ${hosted.length} hosted meetups`)

    // Get joined meetups
    const allMeetupsSnapshot = await getDocs(collection(db, "meetups"))

    const joined: Meetup[] = allMeetupsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as FirebaseMeetup
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          date: convertToDate(data.date),
          time: data.time || "",
          endDate: data.endDate ? convertToDate(data.endDate) : undefined,
          endTime: data.endTime || undefined,
          hostId: data.hostId || "",
          hostUsername: data.hostUsername || "",
          code: data.code || "",
          hasAlcohol: data.hasAlcohol || false,
          shoppingList: data.shoppingList || [],
          participants: data.participants || [],
          costs: data.costs || [],
          createdAt: convertToDate(data.createdAt),
        }
      })
      .filter((meetup) => {
        // Check if user is in participants array
        return (
          meetup.participants &&
          Array.isArray(meetup.participants) &&
          meetup.participants.some((p) => p.participantId === userId)
        )
      })

    console.log(`Found ${joined.length} joined meetups`)

    return NextResponse.json({ hosted, joined })
  } catch (error) {
    console.error("Error fetching user meetups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}