"use client"

import { useState } from "react"
import { useIntl } from "./intl-provider"
import { CreateMeetupForm } from "./create-meetup-form"
import { JoinMeetupForm } from "./join-meetup-form"

export function CreateJoinTab() {
  const [mode, setMode] = useState<"create" | "join" | null>(null)
  const { t } = useIntl()

  if (mode === "create") {
    return <CreateMeetupForm onBack={() => setMode(null)} />
  }

  if (mode === "join") {
    return <JoinMeetupForm onBack={() => setMode(null)} />
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card text-center">
        <h3 className="text-xl font-semibold mb-4">{t("createMeetup")}</h3>
        <p className="text-muted mb-4">Create a new meetup and invite your friends</p>
        <button onClick={() => setMode("create")} className="button button-primary">
          {t("createMeetup")}
        </button>
      </div>

      <div className="card text-center">
        <h3 className="text-xl font-semibold mb-4">{t("joinMeetup")}</h3>
        <p className="text-muted mb-4">Join an existing meetup with a code</p>
        <button onClick={() => setMode("join")} className="button button-secondary">
          {t("joinMeetup")}
        </button>
      </div>
    </div>
  )
}
