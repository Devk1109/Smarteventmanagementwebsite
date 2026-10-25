import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';
import { RegisterEventDialog } from './RegisterEventDialog';
import { useAuth } from '../AuthContext';
import { getAllEvents, incrementAttendees, Event } from '../../utils/eventStorage';
import { addRegistration } from '../../utils/registrationStorage';

// Helper to format time display
const formatTime = (time: string): string => {
  // If time already has AM/PM or dash, return as is
  if (time.includes('AM') || time.includes('PM') || time.includes('-')) {
    return time;
  }
  
  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

export function StudentEventsView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Load events and registrations on mount
  useEffect(() => {
    if (!user) return;
    loadEvents();
    loadRegistrations();
  }, [user]);

  const loadEvents = () => {
    const allEvents = getAllEvents();
    setEvents(allEvents);
  };

  const loadRegistrations = () => {
    if (!user) return;
    
    // Load user-specific registrations
    const userRegistrationKey = `registeredEvents-${user.id}`;
    const saved = localStorage.getItem(userRegistrationKey);
    if (saved) {
      setRegisteredEvents(JSON.parse(saved));
    } else {
      // Migration: check if old global key exists and migrate it to user-specific
      const oldSaved = localStorage.getItem('registeredEvents');
      if (oldSaved) {
        setRegisteredEvents(JSON.parse(oldSaved));
        localStorage.setItem(userRegistrationKey, oldSaved);
        localStorage.removeItem('registeredEvents'); // Clean up old key
      }
    }
  };

  // Save registrations to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    const userRegistrationKey = `registeredEvents-${user.id}`;
    localStorage.setItem(userRegistrationKey, JSON.stringify(registeredEvents));
  }, [registeredEvents, user]);

  const categories = ['All', 'Technology', 'Networking', 'Workshop', 'Competition'];
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-blue-500 hover:bg-blue-600';
      case 'Networking': return 'bg-purple-500 hover:bg-purple-600';
      case 'Workshop': return 'bg-green-500 hover:bg-green-600';
      case 'Competition': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = (eventId: string) => {
    if (!user) return;
    
    // Add to registered events
    setRegisteredEvents([...registeredEvents, eventId]);
    
    // Save registration with student details
    addRegistration(eventId, user.id, user.name, user.email);
    
    // Increment attendee count in shared storage
    incrementAttendees(eventId);
    
    // Reload events to reflect the change
    loadEvents();
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              className={`cursor-pointer transition-all ${
                selectedCategory === category || (category === 'All' && !selectedCategory) 
                  ? getCategoryColor(category) + ' text-white shadow-lg scale-105' 
                  : 'bg-black text-white hover:bg-black/80'
              }`}
              onClick={() => setSelectedCategory(category === 'All' ? null : category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const attendancePercentage = (event.attendees / event.capacity) * 100;
          const spotsLeft = event.capacity - event.attendees;
          const isRegistered = registeredEvents.includes(event.id);

          return (
            <Card key={event.id} className="overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] border-2 hover:border-purple-500/50">
              <div className="aspect-video relative overflow-hidden">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-3 right-3 ${getCategoryColor(event.category)} text-white border-0`}>{event.category}</Badge>
              </div>
              
              <CardContent className="pt-4">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-muted-foreground mb-4">{event.club}</p>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} / {event.capacity}</span>
                    </div>
                    <span className="text-muted-foreground">{spotsLeft} spots left</span>
                  </div>
                  <Progress value={attendancePercentage} />
                </div>
              </CardContent>
              
              <CardFooter>
                {isRegistered ? (
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" disabled>
                    Registered ✓
                  </Button>
                ) : (
                  <RegisterEventDialog event={event} onRegister={() => handleRegister(event.id)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Register</Button>
                  </RegisterEventDialog>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
