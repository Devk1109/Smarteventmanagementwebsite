import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, MapPin, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CreateEventOrganizerDialog } from './CreateEventOrganizerDialog';
import { EventDetailsDialog } from './EventDetailsDialog';
import { useAuth } from '../AuthContext';
import { getAllEvents, addEvent, deleteEvent, Event } from '../../utils/eventStorage';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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
} from '../ui/alert-dialog';

export function OrganizerEventsView() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Load events on mount and when they change
  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    const allEvents = getAllEvents();
    // Filter events to show only those created by this organizer
    const myEvents = allEvents.filter(event => event.organizerId === user?.id);
    setEvents(myEvents);
  };

  const handleCreateEvent = (newEventData: any) => {
    // Format the time properly
    const formattedTime = newEventData.time.includes('-') 
      ? newEventData.time 
      : `${newEventData.time} - ${addHours(newEventData.time, 2)}`;

    const eventToAdd = {
      ...newEventData,
      time: formattedTime,
      club: user?.name || 'Organizer',
      attendees: 0,
      registrations: 0,
      checkIns: 0,
      status: 'upcoming',
      image: newEventData.image || getDefaultImageForCategory(newEventData.category),
    };

    const newEvent = addEvent(eventToAdd, user?.id);
    setEvents([newEvent, ...events]);
    toast.success('Event created successfully!', {
      description: 'Students can now see and register for your event.',
    });
  };

  // Helper to add hours to time string (HH:MM format)
  const addHours = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Get default images based on category
  const getDefaultImageForCategory = (category: string): string => {
    switch (category) {
      case 'Technology':
        return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Networking':
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Workshop':
        return 'https://images.unsplash.com/photo-1649252504304-3d564a12dc52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Competition':
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      default:
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    
    deleteEvent(eventToDelete.id);
    setEvents(events.filter(e => e.id !== eventToDelete.id));
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    
    toast.success('Event deleted successfully', {
      description: 'The event has been removed from the system.',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Networking': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Workshop': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'Competition': return 'bg-gradient-to-r from-orange-500 to-red-500';
      default: return 'bg-gradient-to-r from-pink-500 to-rose-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'ongoing': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-slate-500';
      default: return 'bg-gradient-to-r from-purple-500 to-pink-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Events
          </h2>
          <p className="text-muted-foreground">Manage your organized events</p>
        </div>
        <CreateEventOrganizerDialog onCreateEvent={handleCreateEvent}>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </CreateEventOrganizerDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group">
            <div className="aspect-video relative overflow-hidden">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <Badge className={`absolute top-3 right-3 ${getCategoryColor(event.category)} text-white border-0 shadow-lg`}>
                {event.category}
              </Badge>
              <Badge className={`absolute top-3 left-3 ${getStatusColor(event.status)} text-white border-0 shadow-lg capitalize`}>
                {event.status}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="group-hover:text-purple-600 transition-colors">{event.title}</CardTitle>
              <p className="text-muted-foreground">{event.club}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{event.time}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-pink-600" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">{event.attendees || event.registrations || 0} registrations</span>
                  {(event.attendees || event.registrations || 0) > 0 && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      {event.attendees || event.registrations || 0}
                    </Badge>
                  )}
                </div>
              </div>

              {event.team && event.team.length > 0 && (
                <div className="pt-4 border-t border-purple-200/30">
                  <p className="text-sm font-semibold mb-2 text-purple-600">Team Members</p>
                  <div className="space-y-2">
                    {event.team.map((member, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{member.name}</span>
                        <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(event)}
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteClick(event)}
                  className="border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-muted-foreground text-lg">You haven't created any events yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Click the "Create Event" button to get started!</p>
        </div>
      )}

      <EventDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone and will remove all associated registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}