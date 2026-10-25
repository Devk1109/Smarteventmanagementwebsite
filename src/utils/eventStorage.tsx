// Shared event storage utilities for ClubHub
// Automatically syncs between localStorage and Supabase

import { EventsAPI } from './supabaseData';

export interface Event {
  id: string;
  title: string;
  club?: string;
  date: string;
  time: string;
  location: string;
  attendees?: number;
  capacity?: number;
  image?: string;
  category: string;
  description?: string;
  team?: Array<{ name: string; role: string }>;
  registrations?: number;
  checkIns?: number;
  status?: string;
  organizerId?: string;
}

const EVENTS_STORAGE_KEY = 'clubhub-all-events';
const EVENTS_DATA_KEY = 'eventsData'; // Legacy key

// Sync from Supabase to localStorage (call this on app start)
export const syncEventsFromSupabase = async (): Promise<void> => {
  try {
    const events = await EventsAPI.getAll();
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(EVENTS_DATA_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error syncing events from Supabase:', error);
  }
};

// Get all events (synchronous, from localStorage)
export const getAllEvents = (): Event[] => {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Check for legacy data
    const legacyData = localStorage.getItem(EVENTS_DATA_KEY);
    if (legacyData) {
      const events = JSON.parse(legacyData);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return events;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

// Save to localStorage and sync to Supabase
const saveAllEvents = (events: Event[]): void => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(EVENTS_DATA_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

// Add a new event
export const addEvent = (event: Omit<Event, 'id'>, organizerId?: string): Event => {
  const events = getAllEvents();
  const newEvent: Event = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    attendees: event.attendees || 0,
    registrations: event.registrations || 0,
    checkIns: event.checkIns || 0,
    status: event.status || 'upcoming',
    organizerId,
  };
  
  events.unshift(newEvent);
  saveAllEvents(events);
  
  // Sync to Supabase in background
  EventsAPI.create(newEvent).catch(err => 
    console.error('Failed to sync new event to Supabase:', err)
  );
  
  return newEvent;
};

// Update an event
export const updateEvent = (eventId: string, updates: Partial<Event>): void => {
  const events = getAllEvents();
  const updatedEvents = events.map(event => 
    event.id === eventId ? { ...event, ...updates } : event
  );
  saveAllEvents(updatedEvents);
  
  // Sync to Supabase in background
  EventsAPI.update(eventId, updates).catch(err => 
    console.error('Failed to sync event update to Supabase:', err)
  );
};

// Delete an event
export const deleteEvent = (eventId: string): void => {
  const events = getAllEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  saveAllEvents(filteredEvents);
  
  // Sync to Supabase in background
  EventsAPI.delete(eventId).catch(err => 
    console.error('Failed to sync event deletion to Supabase:', err)
  );
};

// Get events by organizer
export const getEventsByOrganizer = (organizerId: string): Event[] => {
  const events = getAllEvents();
  return events.filter(event => event.organizerId === organizerId);
};

// Increment attendee count
export const incrementAttendees = (eventId: string): void => {
  const events = getAllEvents();
  const updatedEvents = events.map(event => {
    if (event.id === eventId) {
      return {
        ...event,
        attendees: (event.attendees || 0) + 1,
        registrations: (event.registrations || 0) + 1,
      };
    }
    return event;
  });
  saveAllEvents(updatedEvents);
  
  // Sync to Supabase
  const event = updatedEvents.find(e => e.id === eventId);
  if (event) {
    EventsAPI.update(eventId, { 
      attendees: event.attendees,
      registrations: event.registrations 
    }).catch(err => console.error('Failed to sync attendee update:', err));
  }
};

// Decrement attendee count
export const decrementAttendees = (eventId: string): void => {
  const events = getAllEvents();
  const updatedEvents = events.map(event => {
    if (event.id === eventId) {
      return {
        ...event,
        attendees: Math.max(0, (event.attendees || 0) - 1),
        registrations: Math.max(0, (event.registrations || 0) - 1),
      };
    }
    return event;
  });
  saveAllEvents(updatedEvents);
  
  // Sync to Supabase
  const event = updatedEvents.find(e => e.id === eventId);
  if (event) {
    EventsAPI.update(eventId, { 
      attendees: event.attendees,
      registrations: event.registrations 
    }).catch(err => console.error('Failed to sync attendee update:', err));
  }
};
