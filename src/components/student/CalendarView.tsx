import { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, MapPin, Clock, Users, QrCode, Download } from 'lucide-react';
import { getAllEvents, Event } from '../../utils/eventStorage';
import { useAuth } from '../AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { QRCodeDialog } from './QRCodeDialog';
import { GoogleCalendarSyncButton } from './GoogleCalendarSyncButton';
import { syncAllEventsToGoogleCalendar } from '../../utils/googleCalendar';
import { toast } from 'sonner';

export function CalendarView() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Load all events
    const allEvents = getAllEvents();
    setEvents(allEvents);
    
    // Load user-specific registrations
    const userRegistrationKey = `registeredEvents-${user.id}`;
    const saved = localStorage.getItem(userRegistrationKey);
    if (saved) {
      setRegisteredEventIds(JSON.parse(saved));
    }
    
    // Load global event data
    const savedEvents = localStorage.getItem('eventsData');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, [user]);

  // Filter events to only show registered ones
  const myRegistrations = events.filter(event => 
    registeredEventIds.includes(event.id)
  );

  // Get events for selected date
  const selectedDateEvents = myRegistrations.filter(event => {
    if (!date) return false;
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  // Get all dates with events
  const datesWithEvents = myRegistrations.map(event => {
    const eventDate = new Date(event.date);
    return eventDate;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-blue-500';
      case 'Networking': return 'bg-purple-500';
      case 'Workshop': return 'bg-green-500';
      case 'Competition': return 'bg-orange-500';
      default: return 'bg-pink-500';
    }
  };

  // Custom day modifier to highlight dates with events
  const modifiers = {
    hasEvent: datesWithEvents,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      borderRadius: '50%',
    },
  };

  const handleSyncAllEvents = async () => {
    if (myRegistrations.length === 0) {
      toast.info('No events to sync');
      return;
    }

    if (!user?.googleAccessToken) {
      // Demo mode
      toast.success(`Marked ${myRegistrations.length} events for calendar sync`, {
        description: 'Sign in with Google to enable real-time calendar sync',
      });
      return;
    }

    // Real sync
    setSyncing(true);
    const { success, failed } = await syncAllEventsToGoogleCalendar(
      myRegistrations,
      user.googleAccessToken,
      (current, total) => {
        console.log(`Syncing ${current}/${total} events...`);
      }
    );
    setSyncing(false);

    if (failed === 0) {
      toast.success(`Successfully synced ${success} events to Google Calendar!`);
    } else {
      toast.warning(`Synced ${success} events, ${failed} failed`);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Event Calendar
          </h2>
          <p className="text-muted-foreground">View your registered events on a calendar</p>
        </div>
        {myRegistrations.length > 0 && (
          <Button
            onClick={handleSyncAllEvents}
            disabled={syncing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {syncing ? 'Syncing...' : user?.googleAccessToken ? 'Sync All to Google Calendar' : 'Save All Events'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6 border-2 border-pink-500/30 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Events</span>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  {myRegistrations.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">This Month</span>
                <Badge variant="outline" className="border-purple-500 text-purple-600">
                  {myRegistrations.filter(event => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    return eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear();
                  }).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected Date</span>
                <Badge variant="outline" className="border-pink-500 text-pink-600">
                  {selectedDateEvents.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List Section */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-pink-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-pink-600" />
                Events on {date?.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden border-2 border-purple-500/30 hover:border-purple-500 hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                          <ImageWithFallback
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className={`absolute top-2 left-2 ${getCategoryColor(event.category)} text-white border-0`}>
                            {event.category}
                          </Badge>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.club}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 text-purple-600" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-pink-600" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span>{event.attendees} attending</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-wrap gap-2">
                              <QRCodeDialog eventId={event.id} eventTitle={event.title}>
                                <Button 
                                  size="sm" 
                                  className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                  <QrCode className="h-4 w-4 mr-2" />
                                  QR Code
                                </Button>
                              </QRCodeDialog>
                              <GoogleCalendarSyncButton
                                event={event}
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-initial border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No events scheduled for this date.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a highlighted date to view your events.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events List */}
          {myRegistrations.length > 0 && (
            <Card className="mt-6 border-2 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  All Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myRegistrations
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
                      <div 
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setDate(new Date(event.date))}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-xl font-bold">
                              {new Date(event.date).getDate()}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.time}</div>
                          </div>
                        </div>
                        <Badge className={`${getCategoryColor(event.category)} text-white border-0`}>
                          {event.category}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {myRegistrations.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-20 w-20 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-muted-foreground mb-4">
            Register for events to see them on your calendar
          </p>
        </div>
      )}
    </div>
  );
}
