import { useState } from 'react';
import { Button } from '../ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { addEventToGoogleCalendar } from '../../utils/googleCalendar';
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

interface GoogleCalendarSyncButtonProps {
  event: any;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function GoogleCalendarSyncButton({ 
  event, 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: GoogleCalendarSyncButtonProps) {
  const { user } = useAuth();
  const [synced, setSynced] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleAddToGoogleCalendar = async () => {
    if (!user?.googleAccessToken) {
      // Demo mode - just show success
      setSynced(true);
      toast.success(`"${event.title}" marked for Google Calendar sync`, {
        description: 'Sign in with Google to enable real calendar sync',
      });
      setShowDialog(false);
      return;
    }

    // Real Google Calendar sync
    const success = await addEventToGoogleCalendar(event, user.googleAccessToken);
    if (success) {
      setSynced(true);
      toast.success(`Added "${event.title}" to Google Calendar`);
    } else {
      toast.error('Failed to add event to Google Calendar', {
        description: 'Please try again or check your Google Calendar permissions',
      });
    }
    setShowDialog(false);
  };

  if (synced) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`${className} border-2 border-green-500 text-green-600 cursor-default`}
        disabled
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Added to Google
      </Button>
    );
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {user?.googleAccessToken ? 'Add to Google' : 'Save to Calendar'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user?.googleAccessToken ? 'Add to Google Calendar?' : 'Save Event?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user?.googleAccessToken ? (
              <>
                This will add "{event.title}" to your Google Calendar with:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Event reminders (1 day and 30 minutes before)</li>
                  <li>Location: {event.location}</li>
                  <li>Time: {event.time}</li>
                </ul>
              </>
            ) : (
              <>
                Mark this event to remind you about "{event.title}".
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  💡 <strong>Tip:</strong> Sign in with Google to automatically sync events to your Google Calendar!
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddToGoogleCalendar}>
            {user?.googleAccessToken ? 'Add to Calendar' : 'Mark Event'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
