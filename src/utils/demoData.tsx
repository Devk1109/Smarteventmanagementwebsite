// Demo clubs and organizer credentials for testing
export interface DemoOrganizer {
  name: string;
  email: string;
  password: string;
  clubName: string;
  clubId: string;
}

export const DEMO_ORGANIZERS: DemoOrganizer[] = [
  {
    name: 'Tech Club Lead',
    email: 'tech@clubhub.com',
    password: 'tech123',
    clubName: 'Tech Innovators Club',
    clubId: 'demo-tech-club',
  },
  {
    name: 'Design Club Lead',
    email: 'design@clubhub.com',
    password: 'design123',
    clubName: 'Design & Art Society',
    clubId: 'demo-design-club',
  },
  {
    name: 'Sports Club Lead',
    email: 'sports@clubhub.com',
    password: 'sports123',
    clubName: 'Sports & Fitness Club',
    clubId: 'demo-sports-club',
  },
  {
    name: 'Music Club Lead',
    email: 'music@clubhub.com',
    password: 'music123',
    clubName: 'Music & Arts Club',
    clubId: 'demo-music-club',
  },
];

export const DEMO_CLUBS = [
  {
    id: 'demo-tech-club',
    name: 'Tech Innovators Club',
    category: 'Technology',
    description: 'Explore cutting-edge technologies, build innovative projects, and connect with fellow tech enthusiasts. Learn AI, web development, mobile apps, and more!',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    members: 245,
    events: 18,
    status: 'active',
  },
  {
    id: 'demo-design-club',
    name: 'Design & Art Society',
    category: 'Design',
    description: 'A creative community for designers, artists, and visual storytellers. Master UI/UX design, graphic design, illustration, and digital art.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    members: 187,
    events: 12,
    status: 'active',
  },
  {
    id: 'demo-sports-club',
    name: 'Sports & Fitness Club',
    category: 'Sports',
    description: 'Stay active and healthy! Join us for various sports activities, fitness training, tournaments, and wellness workshops.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    members: 321,
    events: 25,
    status: 'active',
  },
  {
    id: 'demo-music-club',
    name: 'Music & Arts Club',
    category: 'Music',
    description: 'For music lovers and performers! Learn instruments, join jam sessions, organize concerts, and explore different musical genres.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    members: 156,
    events: 15,
    status: 'active',
  },
];

// Initialize demo data if not already present
export function initializeDemoData() {
  // Check if demo data is already initialized
  const demoInitialized = localStorage.getItem('clubhub-demo-initialized');
  
  if (demoInitialized) {
    return; // Already initialized
  }

  // Add demo clubs
  const existingClubs = JSON.parse(localStorage.getItem('clubhub-clubs') || '[]');
  const clubsToAdd = DEMO_CLUBS.filter(
    demoClub => !existingClubs.some((club: any) => club.id === demoClub.id)
  );
  
  if (clubsToAdd.length > 0) {
    localStorage.setItem('clubhub-clubs', JSON.stringify([...existingClubs, ...clubsToAdd]));
  }

  // Add demo organizers to localStorage (for quick reference)
  const existingOrganizers = JSON.parse(localStorage.getItem('clubhub-organizers') || '[]');
  const organizersToAdd = DEMO_ORGANIZERS.map(org => ({
    id: org.clubId + '-organizer',
    name: org.name,
    email: org.email,
    password: org.password,
    clubId: org.clubId,
    clubName: org.clubName,
    createdAt: new Date().toISOString(),
  })).filter(
    demoOrg => !existingOrganizers.some((org: any) => org.email === demoOrg.email)
  );

  if (organizersToAdd.length > 0) {
    localStorage.setItem('clubhub-organizers', JSON.stringify([...existingOrganizers, ...organizersToAdd]));
  }

  // Mark as initialized
  localStorage.setItem('clubhub-demo-initialized', 'true');
  console.log('✅ Demo data initialized!');
}
