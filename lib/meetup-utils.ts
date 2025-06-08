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
    return startDate.toLocaleDateString()
  }

  const endDate = new Date(meetup.endDate!)

  // Same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString()
  }

  // Same month
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString("default", { month: "long", year: "numeric" })}`
  }

  // Different months
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
}

export function formatTimeRange(meetup: Meetup): string {
  if (!meetup.endTime) {
    return meetup.time
  }

  return `${meetup.time} - ${meetup.endTime}`
}
