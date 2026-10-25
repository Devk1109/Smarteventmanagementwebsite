import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-94da7951/make-server-94da7951/data`;

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let data: any;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    const detail = responseText.trim().slice(0, 240);
    throw new Error(
      `Supabase API returned non-JSON (${response.status} ${response.statusText})${detail ? `: ${detail}` : ''}`,
    );
  }

  if (!response.ok) {
    throw new Error(data?.error || `Supabase API request failed (${response.status})`);
  }

  return data;
}

// Events API
export const EventsAPI = {
  getAll: async () => {
    const data = await apiCall('/events');
    return data.events || [];
  },
  
  create: async (event: any) => {
    const data = await apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
    return data.event;
  },
  
  update: async (eventId: string, updates: any) => {
    await apiCall(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (eventId: string) => {
    await apiCall(`/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};

// Registrations API
export const RegistrationsAPI = {
  getAll: async () => {
    const data = await apiCall('/registrations');
    return data.registrations || [];
  },
  
  create: async (registration: any) => {
    const data = await apiCall('/registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
    return data.registration;
  },
  
  delete: async (eventId: string, studentId: string) => {
    await apiCall('/registrations', {
      method: 'DELETE',
      body: JSON.stringify({ eventId, studentId }),
    });
  },
  
  checkIn: async (eventId: string, studentId: string) => {
    await apiCall('/registrations/checkin', {
      method: 'PUT',
      body: JSON.stringify({ eventId, studentId }),
    });
  },
};

// Clubs API
export const ClubsAPI = {
  getAll: async () => {
    const data = await apiCall('/clubs');
    return data.clubs || [];
  },
  
  create: async (club: any) => {
    const data = await apiCall('/clubs', {
      method: 'POST',
      body: JSON.stringify(club),
    });
    return data.club;
  },
  
  delete: async (clubId: string) => {
    await apiCall(`/clubs/${clubId}`, {
      method: 'DELETE',
    });
  },
};

// Memberships API
export const MembershipsAPI = {
  getAll: async () => {
    const data = await apiCall('/memberships');
    return data.memberships || [];
  },
  
  create: async (membership: any) => {
    const data = await apiCall('/memberships', {
      method: 'POST',
      body: JSON.stringify(membership),
    });
    return data.membership;
  },
  
  delete: async (clubId: string, studentId: string) => {
    await apiCall('/memberships', {
      method: 'DELETE',
      body: JSON.stringify({ clubId, studentId }),
    });
  },
};
