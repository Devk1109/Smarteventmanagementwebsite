import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Calendar, MapPin, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAllEvents } from '../../utils/eventStorage';
import { getAllRegistrations } from '../../utils/registrationStorage';

export function AdminEventsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allEvents, setAllEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
    
    // Auto-refresh events every 3 seconds
    const interval = setInterval(() => {
      loadEvents();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadEvents = () => {
    const events = getAllEvents();
    const registrations = getAllRegistrations();

    // Calculate real attendee counts and status for each event
    const eventsWithRealData = events.map(event => {
      const eventRegistrations = registrations.filter(r => r.eventId === event.id);
      const attendeeCount = eventRegistrations.length;
      
      // Determine status based on date
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      let status = 'upcoming';
      if (eventDate < today) {
        status = 'completed';
      } else if (eventDate.getTime() === today.getTime()) {
        status = 'today';
      }

      return {
        id: event.id,
        title: event.title,
        club: event.club || 'No Club',
        date: event.date,
        time: event.time,
        location: event.location || 'TBA',
        attendees: attendeeCount,
        capacity: event.capacity || 100,
        status: event.status || status,
      };
    });

    setAllEvents(eventsWithRealData);
  };

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">All Events</h2>
        <p className="text-muted-foreground">Monitor all events across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold mb-1">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.club}</p>
                  </div>
                  <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} / {event.capacity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">
                      {Math.round((event.attendees / event.capacity) * 100)}% filled
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No events found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}