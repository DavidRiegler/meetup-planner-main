"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import { formatLocationDisplay } from "@/lib/maps-utils"
import { AlertCircle, ExternalLink, MapPin } from "lucide-react"

interface JoinMeetupFormProps {
  onBack: () => void
}

export function JoinMeetupForm({ onBack }: JoinMeetupFormProps) {
  const { user } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

  const [code, setCode] = useState("")
  const [meetup, setMeetup] = useState<any>(null)
  const [participantData, setParticipantData] = useState({
    isVegetarian: false,
    isVegan: false,
    drinksAlcohol: false,
    stayDuration: 4,
    joinTime: "",
    suggestions: "",
    bringingItems: [] as string[],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findMeetup = async () => {
    if (!code.trim()) {
      showToast({
        type: "warning",
        title: "Code required",
        message: "Please enter a meetup code",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Finding meetup with code:", code)
      const response = await fetch(`/api/meetups/find?code=${code.trim().toUpperCase()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Meetup not found")
      }

      const meetupData = await response.json()
      console.log("Found meetup:", meetupData)
      setMeetup(meetupData)

      showToast({
        type: "success",
        title: "Meetup found!",
        message: `Found "${meetupData.title}" by @${meetupData.hostUsername}`,
      })
    } catch (error) {
      console.error("Error finding meetup:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to find meetup"
      setError(errorMessage)
      showToast({
        type: "error",
        title: "Meetup not found",
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const joinMeetup = async () => {
    if (!user || !meetup) return

    // Validate required fields
    if (!participantData.joinTime) {
      showToast({
        type: "warning",
        title: "Join time required",
        message: "Please specify when you plan to join the meetup",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Joining meetup with ID:", meetup.id)
      const response = await fetch(`/api/meetups/${meetup.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          username: user.username,
          ...participantData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to join meetup")
      }

      showToast({
        type: "success",
        title: "Successfully joined meetup!",
        message: `You've joined "${meetup.title}". The host will be notified.`,
        duration: 8000,
      })
      onBack()
    } catch (error) {
      console.error("Error joining meetup:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to join meetup"
      setError(errorMessage)
      showToast({
        type: "error",
        title: "Failed to join meetup",
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const locationInfo = meetup ? formatLocationDisplay(meetup.location) : null

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="button button-outline">
          ← {t("cancel")}
        </button>
        <h2 className="text-2xl font-bold">{t("joinMeetup")}</h2>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!meetup ? (
        <div className="grid gap-4">
          <div className="form-group">
            <label className="form-label">{t("meetupCode")}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input"
              placeholder="Enter 6-character meetup code"
              maxLength={6}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <button onClick={findMeetup} disabled={loading || !code.trim()} className="button button-primary">
            {loading && <div className="loading-spinner" />}
            {loading ? t("loading") : "Find Meetup"}
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">{meetup.title}</h3>
            <p className="text-muted mb-4">{meetup.description}</p>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted" />
                {locationInfo?.isGoogleMapsLink ? (
                  <a
                    href={locationInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {locationInfo.text}
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span>{locationInfo?.text}</span>
                )}
              </div>

              <p>
                <strong>{t("date")}:</strong> {new Date(meetup.date).toLocaleDateString()}
              </p>
              <p>
                <strong>{t("time")}:</strong> {meetup.time}
              </p>
              <p>
                <strong>Host:</strong> @{meetup.hostUsername}
              </p>

              {meetup.hasAlcohol && (
                <div className="mt-2">
                  <span className="badge badge-warning">🍺 Alcohol Available</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Your Preferences</h4>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={participantData.isVegetarian}
                    onChange={(e) => setParticipantData({ ...participantData, isVegetarian: e.target.checked })}
                  />
                  🥬 {t("isVegetarian")}
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={participantData.isVegan}
                    onChange={(e) => setParticipantData({ ...participantData, isVegan: e.target.checked })}
                  />
                  🌱 {t("isVegan")}
                </label>

                {meetup.hasAlcohol && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={participantData.drinksAlcohol}
                      onChange={(e) => setParticipantData({ ...participantData, drinksAlcohol: e.target.checked })}
                    />
                    🍺 {t("drinksAlcohol")}
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">{t("stayDuration")}</label>
                  <input
                    type="number"
                    value={participantData.stayDuration}
                    onChange={(e) => setParticipantData({ ...participantData, stayDuration: Number(e.target.value) })}
                    className="input"
                    min="1"
                    max="24"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("joinTime")} *</label>
                  <input
                    type="time"
                    value={participantData.joinTime}
                    onChange={(e) => setParticipantData({ ...participantData, joinTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t("suggestions")}</label>
                <textarea
                  value={participantData.suggestions}
                  onChange={(e) => setParticipantData({ ...participantData, suggestions: e.target.value })}
                  className="input textarea"
                  placeholder="Any suggestions or requests for the host..."
                />
              </div>
            </div>
          </div>

          <button onClick={joinMeetup} disabled={loading} className="button button-primary">
            {loading && <div className="loading-spinner" />}
            {loading ? t("loading") : t("joinMeetup")}
          </button>
        </div>
      )}
    </div>
  )
}
