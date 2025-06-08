import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { hashPassword } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { username, password, fullName } = await request.json()

    if (!username || !password || !fullName) {
      return NextResponse.json({ error: "Username, password, and full name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name must be at least 2 characters long" }, { status: 400 })
    }

    // Check if username already exists
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Hash password and create new user
    const hashedPassword = await hashPassword(password)
    const newUser = {
      username,
      fullName,
      password: hashedPassword,
      createdAt: new Date(),
    }

    const docRef = await addDoc(usersRef, newUser)

    const userData: User = {
      id: docRef.id,
      username,
      fullName,
      createdAt: new Date(),
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
