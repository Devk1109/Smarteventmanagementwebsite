import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, MapPin, Clock, QrCode, Download, X, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { QRCodeDialog } from './QRCodeDialog';
import { GoogleCalendarSyncButton } from './GoogleCalendarSyncButton';
import { StudentFeedbackDialog } from './StudentFeedbackDialog';
import { getAllEvents, decrementAttendees, Event } from '../../utils/eventStorage';
import { removeRegistration } from '../../utils/registrationStorage';
import { getFeedbackFormByEventId, FeedbackForm } from '../../utils/feedbackStorage';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export function MyRegistrationsView() {
  const { user } = useAuth();
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<Map<string, FeedbackForm>>(new Map());

  // Load registered events and event data from localStorage
  useEffect(() => {
    if (!user) return;
    
    // Load all events from shared storage
    const allEvents = getAllEvents();
    setEvents(allEvents);
    
    // Load user-specific registrations
    const userRegistrationKey = `registeredEvents-${user.id}`;
    const saved = localStorage.getItem(userRegistrationKey);
    if (saved) {
      setRegisteredEventIds(JSON.parse(saved));
    }
    
    // Load global event data (legacy support)
    const savedEvents = localStorage.getItem('eventsData');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, [user]);

  // Load feedback forms for registered events
  useEffect(() => {
    const loadFeedbackForms = async () => {
      const newFeedbackForms = new Map<string, FeedbackForm>();
      
      for (const eventId of registeredEventIds) {
        const form = await getFeedbackFormByEventId(eventId);
        if (form) {
          newFeedbackForms.set(eventId, form);
        }
      }
      
      setFeedbackForms(newFeedbackForms);
    };

    if (registeredEventIds.length > 0) {
      loadFeedbackForms();
    }
  }, [registeredEventIds]);

  const handleUnregister = (eventId: string, eventTitle: string) => {
    if (!user) return;

    // Remove from registered events
    const updatedRegistrations = registeredEventIds.filter(id => id !== eventId);
    setRegisteredEventIds(updatedRegistrations);

    // Update localStorage for user registrations
    const userRegistrationKey = `registeredEvents-${user.id}`;
    localStorage.setItem(userRegistrationKey, JSON.stringify(updatedRegistrations));

    // Remove from registration tracking
    removeRegistration(eventId, user.id);

    // Decrease attendee count in shared storage
    decrementAttendees(eventId);
    
    // Reload events to reflect the change
    const allEvents = getAllEvents();
    setEvents(allEvents);

    toast.success(`Unregistered from ${eventTitle}`);
  };

  // Filter events to only show registered ones
  const myRegistrations = events.filter(event => 
    registeredEventIds.includes(event.id)
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-blue-500';
      case 'Networking': return 'bg-purple-500';
      case 'Workshop': return 'bg-green-500';
      case 'Competition': return 'bg-orange-500';
      default: return 'bg-pink-500';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">My Registered Events</h2>
        <p className="text-muted-foreground">View your upcoming events and access QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myRegistrations.map((event) => {
          const feedbackForm = feedbackForms.get(event.id);
          
          return (
            <Card key={event.id} className="overflow-hidden border-2 border-pink-500/30 hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/20 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                  ✓ Registered
                </Badge>
                <Badge className={`absolute top-3 left-3 ${getCategoryColor(event.category)} text-white border-0`}>{event.category}</Badge>
              </div>

              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-muted-foreground">{event.club}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <QRCodeDialog eventId={event.id} eventTitle={event.title}>
                      <Button className="flex-1 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <QrCode className="h-4 w-4" />
                        Show QR Code
                      </Button>
                    </QRCodeDialog>
                    <GoogleCalendarSyncButton
                      event={event}
                      variant="outline"
                      className="flex items-center gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    />
                  </div>
                  
                  {feedbackForm && (
                    <StudentFeedbackDialog feedbackForm={feedbackForm}>
                      <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                        <MessageSquare className="h-4 w-4" />
                        Give Feedback
                      </Button>
                    </StudentFeedbackDialog>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <X className="h-4 w-4" />
                        Cancel Registration
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to unregister from "{event.title}"? You can always register again later if spots are available.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleUnregister(event.id, event.title)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Unregister
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {myRegistrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't registered for any events yet.</p>
        </div>
      )}
    </div>
  );
}
