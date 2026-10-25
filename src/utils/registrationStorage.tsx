// Shared registration storage - syncs with Supabase

import { RegistrationsAPI } from './supabaseData';

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
  checkedIn: boolean;
}

const REGISTRATIONS_STORAGE_KEY = 'clubhub-registrations';

// Sync from Supabase
export const syncRegistrationsFromSupabase = async (): Promise<void> => {
  try {
    const registrations = await RegistrationsAPI.getAll();
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
  } catch (error) {
    console.error('Error syncing registrations from Supabase:', error);
  }
};

// Get all registrations
export const getAllRegistrations = (): Registration[] => {
  try {
    const stored = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading registrations:', error);
    return [];
  }
};

// Save all registrations
const saveAllRegistrations = (registrations: Registration[]): void => {
  try {
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
  } catch (error) {
    console.error('Error saving registrations:', error);
  }
};

// Add a registration
export const addRegistration = (
  eventId: string,
  studentId: string,
  studentName: string,
  studentEmail: string
): Registration => {
  const registrations = getAllRegistrations();
  
  // Check if already registered
  const existingReg = registrations.find(
    r => r.eventId === eventId && r.studentId === studentId
  );
  
  if (existingReg) {
    return existingReg;
  }
  
  const newRegistration: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    studentId,
    studentName,
    studentEmail,
    registeredAt: new Date().toISOString(),
    checkedIn: false,
  };
  
  registrations.push(newRegistration);
  saveAllRegistrations(registrations);
  
  // Sync to Supabase
  RegistrationsAPI.create(newRegistration).catch(err =>
    console.error('Failed to sync registration to Supabase:', err)
  );
  
  return newRegistration;
};

// Remove a registration
export const removeRegistration = (eventId: string, studentId: string): void => {
  const registrations = getAllRegistrations();
  const filtered = registrations.filter(
    r => !(r.eventId === eventId && r.studentId === studentId)
  );
  saveAllRegistrations(filtered);
  
  // Sync to Supabase
  RegistrationsAPI.delete(eventId, studentId).catch(err =>
    console.error('Failed to sync registration deletion to Supabase:', err)
  );
};

// Get registrations for a specific event
export const getRegistrationsByEvent = (eventId: string): Registration[] => {
  const registrations = getAllRegistrations();
  return registrations.filter(r => r.eventId === eventId);
};

// Get registrations for a specific student
export const getRegistrationsByStudent = (studentId: string): Registration[] => {
  const registrations = getAllRegistrations();
  return registrations.filter(r => r.studentId === studentId);
};

// Check in a student
export const checkInStudent = (eventId: string, studentId: string): boolean => {
  const registrations = getAllRegistrations();
  const updated = registrations.map(r => {
    if (r.eventId === eventId && r.studentId === studentId) {
      return { ...r, checkedIn: true };
    }
    return r;
  });
  saveAllRegistrations(updated);
  
  // Sync to Supabase
  RegistrationsAPI.checkIn(eventId, studentId).catch(err =>
    console.error('Failed to sync check-in to Supabase:', err)
  );
  
  return true;
};

// Check if a student is registered for an event
export const isRegistered = (eventId: string, studentId: string): boolean => {
  const registrations = getAllRegistrations();
  return registrations.some(r => r.eventId === eventId && r.studentId === studentId);
};
