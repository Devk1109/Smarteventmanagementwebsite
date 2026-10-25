// Club storage utilities with member count tracking - syncs with Supabase

import { ClubsAPI, MembershipsAPI } from './supabaseData';

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  events: number;
  status: 'active' | 'inactive';
  image: string;
  createdAt?: string; // Optional for backwards compatibility
}

export interface ClubMembership {
  clubId: string;
  studentId: string;
  joinedAt: string;
}

const CLUBS_KEY = 'clubs';
const MEMBERSHIPS_KEY = 'clubMemberships';

// Sync from Supabase
export async function syncClubsFromSupabase(): Promise<void> {
  try {
    const clubs = await ClubsAPI.getAll();
    if (clubs.length > 0) {
      localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
    }
  } catch (error) {
    console.error('Error syncing clubs from Supabase:', error);
  }
}

export async function syncMembershipsFromSupabase(): Promise<void> {
  try {
    const memberships = await MembershipsAPI.getAll();
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
  } catch (error) {
    console.error('Error syncing memberships from Supabase:', error);
  }
}

// Initial clubs data
const initialClubs: Club[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    description: 'A community of tech enthusiasts exploring the latest in software development, AI, and cybersecurity.',
    members: 156,
    events: 12,
    category: 'Technology',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3B8ZW58MXx8fHwxNzYyMjQ3Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '2',
    name: 'Business Association',
    description: 'Connecting future business leaders through networking events, workshops, and professional development.',
    members: 203,
    events: 18,
    category: 'Business',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwZXZlbnR8ZW58MXx8fHwxNzYyMjQ2NjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '3',
    name: 'Design Collective',
    description: 'Creative minds collaborating on design projects, from UI/UX to graphic design and branding.',
    members: 89,
    events: 8,
    category: 'Design',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1649252504304-3d564a12dc52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYyMjUwMDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '4',
    name: 'Entrepreneurship Club',
    description: 'Supporting aspiring entrepreneurs with mentorship, pitch competitions, and startup resources.',
    members: 142,
    events: 15,
    category: 'Business',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlbWluYXJ8ZW58MXx8fHwxNzYyMjQ3Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '5',
    name: 'Photography Society',
    description: 'Capturing moments and honing photography skills through workshops, photo walks, and exhibitions.',
    members: 67,
    events: 6,
    category: 'Arts',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3B8ZW58MXx8fHwxNzYyMjQ3Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '6',
    name: 'Environmental Action',
    description: 'Making a positive impact on campus sustainability and environmental awareness.',
    members: 94,
    events: 10,
    category: 'Environment',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1649252504304-3d564a12dc52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYyMjUwMDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

// Initialize storage if empty
function initializeStorage() {
  if (!localStorage.getItem(CLUBS_KEY)) {
    localStorage.setItem(CLUBS_KEY, JSON.stringify(initialClubs));
  }
  if (!localStorage.getItem(MEMBERSHIPS_KEY)) {
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify([]));
  }
}

// Get all clubs
export function getAllClubs(): Club[] {
  initializeStorage();
  const clubs = localStorage.getItem(CLUBS_KEY);
  return clubs ? JSON.parse(clubs) : initialClubs;
}

// Get a single club by ID
export function getClubById(clubId: string): Club | null {
  const clubs = getAllClubs();
  return clubs.find(club => club.id === clubId) || null;
}

// Add a new club
export function addClub(clubData: Omit<Club, 'id' | 'members'>): Club {
  const clubs = getAllClubs();
  const newClub: Club = {
    ...clubData,
    id: `club-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    members: 0, // Start with 0 members
    createdAt: new Date().toISOString(), // Add creation timestamp
  };
  clubs.unshift(newClub);
  localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  
  // Sync to Supabase
  ClubsAPI.create(newClub).catch(err =>
    console.error('Failed to sync club to Supabase:', err)
  );
  
  return newClub;
}

// Update a club
export function updateClub(clubId: string, updates: Partial<Club>): Club | null {
  const clubs = getAllClubs();
  const index = clubs.findIndex(club => club.id === clubId);
  if (index === -1) return null;
  
  clubs[index] = { ...clubs[index], ...updates };
  localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  return clubs[index];
}

// Delete a club
export function deleteClub(clubId: string): boolean {
  const clubs = getAllClubs();
  const filtered = clubs.filter(club => club.id !== clubId);
  if (filtered.length === clubs.length) return false;
  
  localStorage.setItem(CLUBS_KEY, JSON.stringify(filtered));
  
  // Also remove all memberships for this club
  const memberships = getAllMemberships();
  const updatedMemberships = memberships.filter(m => m.clubId !== clubId);
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(updatedMemberships));
  
  // Sync to Supabase
  ClubsAPI.delete(clubId).catch(err =>
    console.error('Failed to sync club deletion to Supabase:', err)
  );
  
  return true;
}

// Get all memberships
function getAllMemberships(): ClubMembership[] {
  initializeStorage();
  const memberships = localStorage.getItem(MEMBERSHIPS_KEY);
  return memberships ? JSON.parse(memberships) : [];
}

// Get memberships for a student
export function getStudentMemberships(studentId: string): string[] {
  const memberships = getAllMemberships();
  return memberships
    .filter(m => m.studentId === studentId)
    .map(m => m.clubId);
}

// Get memberships for a club
export function getClubMemberCount(clubId: string): number {
  const memberships = getAllMemberships();
  return memberships.filter(m => m.clubId === clubId).length;
}

// Join a club
export function joinClub(clubId: string, studentId: string): boolean {
  const memberships = getAllMemberships();
  
  // Check if already a member
  const existingMembership = memberships.find(
    m => m.clubId === clubId && m.studentId === studentId
  );
  
  if (existingMembership) {
    return false; // Already a member
  }
  
  // Add membership
  const newMembership: ClubMembership = {
    clubId,
    studentId,
    joinedAt: new Date().toISOString(),
  };
  
  memberships.push(newMembership);
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
  
  // Update club member count
  const clubs = getAllClubs();
  const clubIndex = clubs.findIndex(c => c.id === clubId);
  if (clubIndex !== -1) {
    clubs[clubIndex].members += 1;
    localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  }
  
  // Sync to Supabase
  MembershipsAPI.create(newMembership).catch(err =>
    console.error('Failed to sync membership to Supabase:', err)
  );
  
  return true;
}

// Leave a club
export function leaveClub(clubId: string, studentId: string): boolean {
  const memberships = getAllMemberships();
  
  const updatedMemberships = memberships.filter(
    m => !(m.clubId === clubId && m.studentId === studentId)
  );
  
  if (updatedMemberships.length === memberships.length) {
    return false; // Was not a member
  }
  
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(updatedMemberships));
  
  // Update club member count
  const clubs = getAllClubs();
  const clubIndex = clubs.findIndex(c => c.id === clubId);
  if (clubIndex !== -1 && clubs[clubIndex].members > 0) {
    clubs[clubIndex].members -= 1;
    localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  }
  
  // Sync to Supabase
  MembershipsAPI.delete(clubId, studentId).catch(err =>
    console.error('Failed to sync membership deletion to Supabase:', err)
  );
  
  return true;
}

// Check if student is a member of a club
export function isMemberOfClub(clubId: string, studentId: string): boolean {
  const memberships = getAllMemberships();
  return memberships.some(m => m.clubId === clubId && m.studentId === studentId);
}

// Get clubs with updated member counts
export function getClubsWithMemberCounts(): Club[] {
  const clubs = getAllClubs();
  const memberships = getAllMemberships();
  
  // Create a map of club IDs to member counts
  const memberCounts = new Map<string, number>();
  memberships.forEach(m => {
    memberCounts.set(m.clubId, (memberCounts.get(m.clubId) || 0) + 1);
  });
  
  // Update clubs with actual member counts
  return clubs.map(club => ({
    ...club,
    members: memberCounts.get(club.id) || 0,
  }));
}