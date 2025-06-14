"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useToast } from "./toast"
import type { MeetupDate, DateAvailability } from "@/lib/types"
import { Calendar, Clock, Check, X } from "lucide-react"

interface DateAvailabilityFormProps {
  meetupId: string
  possibleDates: MeetupDate[]
  existingAvailabilities: DateAvailability[]
  onUpdate: () => void
}

export function DateAvailabilityForm({
  meetupId,
  possibleDates,
  existingAvailabilities,
  onUpdate,
}: DateAvailabilityFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Initialize availability state
  const [availabilities, setAvailabilities] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    possibleDates.forEach((date) => {
      const existing = existingAvailabilities.find((a) => a.dateId === date.id && a.participantId === user?.id)
      initial[date.id] = existing?.available ?? false
    })
    return initial
  })

  const handleAvailabilityChange = (dateId: string, available: boolean) => {
    setAvailabilities((prev) => ({
      ...prev,
      [dateId]: available,
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/date-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          username: user.username,
          availabilities: Object.entries(availabilities).map(([dateId, available]) => ({
            dateId,
            available,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update availability")
      }

      showToast({
        type: "success",
        title: "Availability updated",
        message: "Your date preferences have been saved",
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating availability:", error)
      showToast({
        type: "error",
        title: "Failed to update availability",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!possibleDates || possibleDates.length === 0) {
    return null
  }

  return (
    <div className="date-availability-form">
      <div className="date-availability-header">
        <h4 className="date-availability-title">
          <Calendar size={18} />
          Select Your Available Dates
        </h4>
        <p className="date-availability-subtitle">
          Choose which dates work for you. The host will see everyone's preferences.
        </p>
      </div>

      <div className="date-availability-options">
        {possibleDates.map((date) => (
          <div key={date.id} className="date-availability-option">
            <div className="date-availability-option-info">
              <div className="date-availability-date">
                {new Date(date.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="date-availability-time">
                <Clock size={14} />
                {date.time}
                {date.endTime && ` - ${date.endTime}`}
              </div>
              {date.description && <div className="date-availability-description">{date.description}</div>}
            </div>

            <div className="date-availability-controls">
              <button
                type="button"
                onClick={() => handleAvailabilityChange(date.id, true)}
                className={`date-availability-btn ${availabilities[date.id] === true ? "active available" : ""}`}
              >
                <Check size={16} />
                Available
              </button>
              <button
                type="button"
                onClick={() => handleAvailabilityChange(date.id, false)}
                className={`date-availability-btn ${availabilities[date.id] === false ? "active unavailable" : ""}`}
              >
                <X size={16} />
                Not Available
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="date-availability-footer">
        <button onClick={handleSubmit} disabled={loading} className="button button-primary">
          {loading && <div className="loading-spinner" />}
          Save Availability
        </button>
      </div>
    </div>
  )
}
