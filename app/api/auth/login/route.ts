import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { verifyPassword } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Query users collection for matching username
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user: User = {
      id: userDoc.id,
      username: userData.username,
      fullName: userData.fullName || userData.username, // Fallback for existing users
      createdAt: userData.createdAt.toDate(),
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
