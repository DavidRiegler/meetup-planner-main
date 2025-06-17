"use client"
import type { MeetupDate, DateAvailability } from "@/lib/types"
import { Calendar, Clock, Users, Check, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "./toast"
import { formatDate } from "@/lib/utils"

interface DatePollProps {
  possibleDates: MeetupDate[]
  dateAvailabilities: DateAvailability[]
  isHost: boolean
  showResults?: boolean
  meetupId?: string
  dateFinalized?: boolean
  winningDateVotes?: number
  onUpdate?: () => void
}

export function DatePoll({
  possibleDates,
  dateAvailabilities,
  isHost,
  showResults = false,
  meetupId,
  dateFinalized = false,
  winningDateVotes,
  onUpdate,
}: DatePollProps) {
  const { showToast } = useToast()
  const [finalizing, setFinalizing] = useState(false)

  const handleFinalizeDate = async () => {
    if (!meetupId || !isHost) return

    setFinalizing(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/finalize-date`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to finalize date")
      }

      const result = await response.json()

      showToast({
        type: "success",
        title: "Date finalized",
        message: `${formatDate(result.winningDate.date)} has been set as the meetup date with ${result.votes} votes`,
      })

      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error finalizing date:", error)
      showToast({
        type: "error",
        title: "Failed to finalize date",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setFinalizing(false)
    }
  }

  if (!possibleDates || possibleDates.length === 0) {
    return null
  }

  const getDateStats = (dateId: string) => {
    const availabilities = dateAvailabilities.filter((a) => a.dateId === dateId)
    const available = availabilities.filter((a) => a.available)
    const unavailable = availabilities.filter((a) => !a.available)
    const total = availabilities.length

    return {
      available: available.length,
      unavailable: unavailable.length,
      total,
      percentage: total > 0 ? (available.length / total) * 100 : 0,
      availableUsers: available.map((a) => a.username),
      unavailableUsers: unavailable.map((a) => a.username),
    }
  }

  const sortedDates = [...possibleDates].sort((a, b) => {
    if (showResults) {
      const statsA = getDateStats(a.id)
      const statsB = getDateStats(b.id)
      return statsB.percentage - statsA.percentage
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="date-poll">
      <div className="date-poll-header">
        <h4 className="date-poll-title">
          <Calendar size={18} />
          {showResults ? "Date Poll Results" : "Available Dates"}
          {dateFinalized && <span className="badge badge-success ml-2">Finalized</span>}
        </h4>
        {showResults && (
          <div className="date-poll-summary">
            {dateAvailabilities.length > 0 ? (
              <span className="text-sm text-muted">
                {new Set(dateAvailabilities.map((a) => a.participantId)).size} participants voted
              </span>
            ) : (
              <span className="text-sm text-muted">No votes yet</span>
            )}
          </div>
        )}
      </div>

      {dateFinalized && (
        <div className="date-poll-finalized">
          <div className="alert alert-success">
            <Check size={16} />
            <span>
              Date has been finalized with {winningDateVotes} votes. The meetup date has been updated automatically.
            </span>
          </div>
        </div>
      )}

      <div className="date-poll-options">
        {sortedDates.map((date) => {
          // Debug: log the actual date value to console
          console.log('Date value:', date.date, 'Type:', typeof date.date);
          
          const stats = getDateStats(date.id)
          const isWinner =
            showResults &&
            stats.percentage > 0 &&
            stats.percentage >= Math.max(...sortedDates.map((d) => getDateStats(d.id).percentage))

          return (
            <div
              key={date.id}
              className={`date-poll-option ${isWinner ? "date-poll-winner" : ""} ${dateFinalized && isWinner ? "date-poll-finalized-winner" : ""}`}
            >
              <div className="date-poll-option-header">
                <div className="date-poll-option-info">
                  <div className="date-poll-date">
                    {new Date(date.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="date-poll-time">
                    <Clock size={14} />
                    {date.time}
                    {date.endTime && ` - ${date.endTime}`}
                  </div>
                  {date.description && <div className="date-poll-description">{date.description}</div>}
                </div>

                {showResults && (
                  <div className="date-poll-stats">
                    <div className="date-poll-count">
                      <Users size={14} />
                      {stats.available}/{stats.total}
                    </div>
                    {isWinner && !dateFinalized && <div className="date-poll-winner-badge">🏆</div>}
                    {isWinner && dateFinalized && <div className="date-poll-finalized-badge">✅ Final</div>}
                  </div>
                )}
              </div>

              {showResults && stats.total > 0 && (
                <>
                  <div className="date-poll-bar">
                    <div className="date-poll-bar-fill" style={{ width: `${stats.percentage}%` }} />
                    <div className="date-poll-percentage">{Math.round(stats.percentage)}%</div>
                  </div>

                  <div className="date-poll-participants">
                    {stats.availableUsers.length > 0 && (
                      <div className="date-poll-participant-group">
                        <div className="date-poll-participant-label">
                          <Check size={12} className="text-success" />
                          Available ({stats.available})
                        </div>
                        <div className="date-poll-participant-list">
                          {stats.availableUsers.map((username, index) => (
                            <span key={index} className="date-poll-participant available">
                              @{username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {stats.unavailableUsers.length > 0 && (
                      <div className="date-poll-participant-group">
                        <div className="date-poll-participant-label">
                          <X size={12} className="text-destructive" />
                          Not Available ({stats.unavailable})
                        </div>
                        <div className="date-poll-participant-list">
                          {stats.unavailableUsers.map((username, index) => (
                            <span key={index} className="date-poll-participant unavailable">
                              @{username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {isHost && showResults && !dateFinalized && dateAvailabilities.length > 0 && (
        <div className="date-poll-finalize">
          <button onClick={handleFinalizeDate} disabled={finalizing} className="button button-primary">
            {finalizing && <div className="loading-spinner" />}
            Finalize Winning Date
          </button>
          <p className="text-sm text-muted mt-2">
            This will set the date with the most votes as the official meetup date.
          </p>
        </div>
      )}
    </div>
  )
}