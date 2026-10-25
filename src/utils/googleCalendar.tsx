// Google Calendar API integration
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  club: string;
  category: string;
}

export const addEventToGoogleCalendar = async (
  event: Event,
  accessToken: string
): Promise<boolean> => {
  try {
    // Parse the event date and time
    const eventDate = new Date(event.date);
    const [startTime, endTime] = parseEventTime(event.time);
    
    // Create start and end datetime
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(startTime.hours, startTime.minutes);
    
    const endDateTime = new Date(eventDate);
    endDateTime.setHours(endTime.hours, endTime.minutes);

    // Create Google Calendar event object
    const calendarEvent = {
      summary: event.title,
      location: event.location,
      description: `${event.category} event organized by ${event.club}\n\nRegistered via ClubHub`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    // Call Google Calendar API
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Calendar API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to add event to Google Calendar:', error);
    return false;
  }
};

export const deleteEventFromGoogleCalendar = async (
  eventId: string,
  accessToken: string
): Promise<boolean> => {
  try {
    // In a real implementation, you'd store the Google Calendar event ID
    // For now, we'll just return true as a placeholder
    return true;
  } catch (error) {
    console.error('Failed to delete event from Google Calendar:', error);
    return false;
  }
};

// Helper function to parse time strings like "10:00 AM - 12:00 PM"
function parseEventTime(timeString: string): [
  { hours: number; minutes: number },
  { hours: number; minutes: number }
] {
  const [startStr, endStr] = timeString.split(' - ');
  
  const parseTime = (time: string) => {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { hours: 10, minutes: 0 }; // default
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return { hours, minutes };
  };
  
  return [
    parseTime(startStr),
    parseTime(endStr || startStr), // Use start time if no end time
  ];
}

export const syncAllEventsToGoogleCalendar = async (
  events: Event[],
  accessToken: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < events.length; i++) {
    const result = await addEventToGoogleCalendar(events[i], accessToken);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    if (onProgress) {
      onProgress(i + 1, events.length);
    }
  }

  return { success, failed };
};
