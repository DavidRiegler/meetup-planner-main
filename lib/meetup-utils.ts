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
  try {
    const startDate = new Date(meetup.date);
    const endDate = meetup.endDate ? new Date(meetup.endDate) : null;

    if (endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return formatDate(startDate);
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Date to be set';
  }
}

export function formatTimeRange(meetup: Meetup): string {
  try {
    const startTime = meetup.time;
    const endTime = meetup.endTime;

    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return 'Time to be set';
  }
}

// Utility for consistent date display
export function formatMeetupDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Utility for consistent date display (short format)
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}