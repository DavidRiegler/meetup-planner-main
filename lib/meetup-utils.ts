import type { Meetup, MeetupStatus } from "./types"

export function getMeetupStatus(meetup: Meetup): MeetupStatus {
  const now = new Date()
  const startDate = new Date(meetup.date)
  startDate.setHours(Number.parseInt(meetup.time.split(":")[0]), Number.parseInt(meetup.time.split(":")[1]), 0, 0)

  let endDate: Date
  if (meetup.endDate && meetup.endTime) {
    endDate = new Date(meetup.endDate)
    endDate.setHours(Number.parseInt(meetup.endTime.split(":")[0]), Number.parseInt(meetup.endTime.split(":")[1]), 0, 0)
  } else {
    // If no end date/time, assume meetup lasts 3 hours
    endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 3)
  }

  if (now < startDate) {
    return "upcoming"
  } else if (now >= startDate && now <= endDate) {
    return "inProgress"
  } else {
    return "past"
  }
}

export function formatDateRange(meetup: Meetup): string {
  const startDate = new Date(meetup.date)
  const hasEndDate = meetup.endDate !== undefined

  if (!hasEndDate) {
    return startDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const endDate = new Date(meetup.endDate!)

  // Same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Same month
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
  }

  // Different months
  return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export function formatTimeRange(meetup: Meetup): string {
  if (!meetup.endTime) {
    return meetup.time
  }

  return `${meetup.time} - ${meetup.endTime}`
}

// Add a new utility for consistent date display
export function formatMeetupDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Add utility for consistent time display
export function formatMeetupTime(time: string, endTime?: string): string {
  if (!endTime) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const startFormatted = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const endFormatted = new Date(`2000-01-01T${endTime}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return `${startFormatted} - ${endFormatted}`
}
