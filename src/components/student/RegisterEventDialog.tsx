import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RegisterEventDialogProps {
  children: React.ReactNode;
  event: any;
  onRegister: () => void;
}

export function RegisterEventDialog({ children, event, onRegister }: RegisterEventDialogProps) {
  const [open, setOpen] = useState(false);

  const handleRegister = () => {
    onRegister();
    setOpen(false);
    toast.success('Successfully registered for ' + event.title);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{event.club}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{event.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Users className="h-4 w-4" />
              <span>{event.attendees} / {event.capacity} registered</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegister}>
            Confirm Registration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
