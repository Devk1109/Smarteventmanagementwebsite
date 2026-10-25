import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, Users, Clock, UserCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

interface TeamMember {
  name: string;
  role: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  registrations: number;
  checkIns: number;
  status: string;
  team?: TeamMember[];
}

interface EventDetailsDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Complete event details and information
              </DialogDescription>
            </div>
            <Badge className="ml-4">{event.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Event Information</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="font-semibold">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Registrations</span>
                </div>
                <p className="text-3xl font-bold">{event.registrations}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Check-ins</span>
                </div>
                <p className="text-3xl font-bold">{event.checkIns}</p>
              </div>
            </div>
          </div>

          {event.team && event.team.length > 0 && (
            <>
              <Separator />

              {/* Team Members */}
              <div className="space-y-3">
                <h3 className="font-semibold">Team Members</h3>
                <div className="grid gap-3">
                  {event.team.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
