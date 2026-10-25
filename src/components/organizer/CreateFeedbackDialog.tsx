import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, X } from 'lucide-react';
import { getAllEvents } from '../../utils/eventStorage';
import { addFeedbackForm } from '../../utils/feedbackStorage';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

interface CreateFeedbackDialogProps {
  children: React.ReactNode;
  onCreateFeedback: (form: any) => void;
}

export function CreateFeedbackDialog({ children, onCreateFeedback }: CreateFeedbackDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [questions, setQuestions] = useState([{ text: '', type: 'rating' }]);
  const [events, setEvents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load all events when dialog opens
    if (open) {
      const allEvents = getAllEvents();
      // Filter events to show only those created by this organizer
      const myEvents = allEvents.filter(event => event.organizerId === user?.id);
      setEvents(myEvents);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      toast.error('Please select an event');
      return;
    }

    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) {
      toast.error('Event not found');
      return;
    }

    const validQuestions = questions.filter(q => q.text);
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackForm = await addFeedbackForm(
        {
          eventId: selectedEventId,
          eventTitle: selectedEvent.title,
          questions: validQuestions.length,
          questionList: validQuestions,
        },
        user?.id
      );

      onCreateFeedback(feedbackForm);
      
      toast.success('Feedback form created successfully!', {
        description: 'Students can now provide feedback for this event.',
      });

      setSelectedEventId('');
      setQuestions([{ text: '', type: 'rating' }]);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create feedback form');
      console.error('Create feedback error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'rating' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: 'text' | 'type', value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Feedback Form</DialogTitle>
          <DialogDescription>
            Create a feedback form for your event
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event">Event</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No events available
                  </div>
                ) : (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions</Label>
              <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter question"
                      value={question.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    />
                  </div>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion(index, 'type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeQuestion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}