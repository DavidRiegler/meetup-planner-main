"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import type { Meetup } from "@/lib/types"
import { getMeetupStatus, formatDateRange, formatTimeRange } from "@/lib/meetup-utils"
import { MeetupDetails } from "./meetup-details"
import { AlertCircle, Calendar, Clock, MapPin, Users } from "lucide-react"

export function MyMeetupsTab() {
  const { user } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

  const [hostedMeetups, setHostedMeetups] = useState<Meetup[]>([])
  const [joinedMeetups, setJoinedMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMeetupId, setSelectedMeetupId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchMeetups()
    }
  }, [user])

  const fetchMeetups = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching meetups for user:", user?.id)
      const response = await fetch(`/api/meetups/user/${user?.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch meetups`)
      }

      const data = await response.json()
      console.log("Meetups data received:", data)

      setHostedMeetups(data.hosted || [])
      setJoinedMeetups(data.joined || [])
    } catch (error) {
      console.error("Error fetching meetups:", error)
      setError(error instanceof Error ? error.message : "Failed to load meetups")
      showToast({
        type: "error",
        title: "Failed to load meetups",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  const categorizedHostedMeetups = categorizeMeetups(hostedMeetups)
  const categorizedJoinedMeetups = categorizeMeetups(joinedMeetups)

  if (selectedMeetupId) {
    return <MeetupDetails meetupId={selectedMeetupId} onBack={() => setSelectedMeetupId(null)} />
  }

  if (loading) {
    return <div className="text-center p-8">{t("loading")}</div>
  }

  if (error) {
    return (
      <div className="card text-center p-8">
        <AlertCircle size={48} className="mx-auto mb-4 text-destructive" />
        <div className="text-xl text-destructive mb-4">Failed to load meetups</div>
        <div className="text-muted mb-4">{error}</div>
        <button onClick={fetchMeetups} className="button button-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      {/* Hosted Meetups */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Hosted Meetups</h3>

        {categorizedHostedMeetups.inProgress.length > 0 && (
          <MeetupSection
            title="In Progress"
            meetups={categorizedHostedMeetups.inProgress}
            onSelect={setSelectedMeetupId}
            isHost={true}
            highlight={true}
          />
        )}

        {categorizedHostedMeetups.upcoming.length > 0 && (
          <MeetupSection
            title="Upcoming"
            meetups={categorizedHostedMeetups.upcoming}
            onSelect={setSelectedMeetupId}
            isHost={true}
          />
        )}

        {categorizedHostedMeetups.past.length > 0 && (
          <MeetupSection
            title="Past"
            meetups={categorizedHostedMeetups.past}
            onSelect={setSelectedMeetupId}
            isHost={true}
          />
        )}

        {hostedMeetups.length === 0 && <p className="text-muted">No hosted meetups yet</p>}
      </div>

      {/* Joined Meetups */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Joined Meetups</h3>

        {categorizedJoinedMeetups.inProgress.length > 0 && (
          <MeetupSection
            title="In Progress"
            meetups={categorizedJoinedMeetups.inProgress}
            onSelect={setSelectedMeetupId}
            isHost={false}
            highlight={true}
          />
        )}

        {categorizedJoinedMeetups.upcoming.length > 0 && (
          <MeetupSection
            title="Upcoming"
            meetups={categorizedJoinedMeetups.upcoming}
            onSelect={setSelectedMeetupId}
            isHost={false}
          />
        )}

        {categorizedJoinedMeetups.past.length > 0 && (
          <MeetupSection
            title="Past"
            meetups={categorizedJoinedMeetups.past}
            onSelect={setSelectedMeetupId}
            isHost={false}
          />
        )}

        {joinedMeetups.length === 0 && <p className="text-muted">No joined meetups yet</p>}
      </div>
    </div>
  )
}

function categorizeMeetups(meetups: Meetup[]) {
  const upcoming: Meetup[] = []
  const inProgress: Meetup[] = []
  const past: Meetup[] = []

  meetups.forEach((meetup) => {
    const status = getMeetupStatus(meetup)
    if (status === "upcoming") {
      upcoming.push(meetup)
    } else if (status === "inProgress") {
      inProgress.push(meetup)
    } else {
      past.push(meetup)
    }
  })

  // Sort upcoming by start date (ascending)
  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Sort in progress by end date (ascending)
  inProgress.sort((a, b) => {
    const aEndDate = a.endDate ? new Date(a.endDate) : new Date(a.date)
    const bEndDate = b.endDate ? new Date(b.endDate) : new Date(b.date)
    return aEndDate.getTime() - bEndDate.getTime()
  })

  // Sort past by start date (descending - most recent first)
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { upcoming, inProgress, past }
}

interface MeetupSectionProps {
  title: string
  meetups: Meetup[]
  onSelect: (id: string) => void
  isHost: boolean
  highlight?: boolean
}

function MeetupSection({ title, meetups, onSelect, isHost, highlight = false }: MeetupSectionProps) {
  if (meetups.length === 0) return null

  return (
    <div className="mb-6">
      <h4 className="text-lg font-medium mb-3">{title}</h4>
      <div className="grid gap-4">
        {meetups.map((meetup) => (
          <MeetupCard
            key={meetup.id}
            meetup={meetup}
            isHost={isHost}
            onClick={() => onSelect(meetup.id)}
            highlight={highlight}
          />
        ))}
      </div>
    </div>
  )
}

function MeetupCard({
  meetup,
  isHost,
  onClick,
  highlight = false,
}: {
  meetup: Meetup
  isHost: boolean
  onClick: () => void
  highlight?: boolean
}) {
  const { t } = useIntl()
  const isMultiDay = meetup.endDate !== undefined
  const status = getMeetupStatus(meetup)

  return (
    <div
      className={`card cursor-pointer hover:shadow-lg transition-shadow ${highlight ? "border-primary border-2" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold">{meetup.title}</h4>
            {status === "inProgress" && <span className="badge badge-success">In Progress</span>}
          </div>
          <p className="text-muted text-sm">{meetup.description}</p>
        </div>
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{meetup.code}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted" />
          <span>{meetup.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted" />
          <span>{formatDateRange(meetup)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <span>{formatTimeRange(meetup)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-muted" />
          <span>{(meetup.participants?.length || 0) + 1}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {isHost ? (
          <p className="text-sm text-muted">Click to manage this meetup</p>
        ) : (
          <p className="text-sm text-muted">Click to view details and manage your participation</p>
        )}
      </div>
    </div>
  )
}
