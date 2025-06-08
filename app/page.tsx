"use client"

import { useAuth } from "@/components/auth-provider"
import { AuthForm } from "@/components/auth-form"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container text-center" style={{ marginTop: "2rem" }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <AuthForm />
      </>
    )
  }

  return (
    <>
      <Header />
      <Dashboard />
    </>
  )
}
