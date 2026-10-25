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
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Star } from 'lucide-react';
import { FeedbackForm, submitFeedbackResponse, hasSubmittedFeedback } from '../../utils/feedbackStorage';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

interface StudentFeedbackDialogProps {
  children: React.ReactNode;
  feedbackForm: FeedbackForm;
  onSubmitted?: () => void;
}

export function StudentFeedbackDialog({ children, feedbackForm, onSubmitted }: StudentFeedbackDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<{ questionIndex: number; answer: string | number }[]>([]);
  const [hoveredRatings, setHoveredRatings] = useState<{ [key: number]: number }>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true);

  // Check if user has already submitted feedback
  useEffect(() => {
    const checkSubmission = async () => {
      if (user && feedbackForm) {
        setIsCheckingSubmission(true);
        const submitted = await hasSubmittedFeedback(feedbackForm.id, user.id);
        setAlreadySubmitted(submitted);
        setIsCheckingSubmission(false);
      }
    };
    
    if (open) {
      checkSubmission();
    }
  }, [open, user, feedbackForm]);

  const handleRatingClick = (questionIndex: number, rating: number) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionIndex === questionIndex);
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { questionIndex, answer: rating };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionIndex, answer: rating }]);
    }
  };

  const handleTextChange = (questionIndex: number, text: string) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionIndex === questionIndex);
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { questionIndex, answer: text };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionIndex, answer: text }]);
    }
  };

  const getAnswer = (questionIndex: number): string | number | undefined => {
    return answers.find(a => a.questionIndex === questionIndex)?.answer;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    // Validate all questions are answered
    if (answers.length < feedbackForm.questionList.length) {
      toast.error('Please answer all questions');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedbackResponse(
        feedbackForm.id,
        feedbackForm.eventId,
        user.id,
        user.name,
        answers
      );

      toast.success('Feedback submitted successfully!', {
        description: 'Thank you for your valuable feedback.',
      });

      setAnswers([]);
      setAlreadySubmitted(true);
      setOpen(false);
      onSubmitted?.();
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Feedback</DialogTitle>
          <DialogDescription>
            {feedbackForm.eventTitle}
          </DialogDescription>
        </DialogHeader>

        {isCheckingSubmission ? (
          <div className="py-8 text-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : alreadySubmitted ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium mb-2">Feedback Already Submitted</p>
            <p className="text-muted-foreground text-sm">
              Thank you for your feedback! You have already submitted a response for this event.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {feedbackForm.questionList.map((question, index) => (
              <div key={index} className="space-y-3">
                <Label className="text-base">
                  {index + 1}. {question.text}
                </Label>

                {question.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const currentAnswer = getAnswer(index);
                      const isSelected = currentAnswer === rating;
                      const isHovered = (hoveredRatings[index] || 0) >= rating;
                      
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingClick(index, rating)}
                          onMouseEnter={() => setHoveredRatings({ ...hoveredRatings, [index]: rating })}
                          onMouseLeave={() => setHoveredRatings({ ...hoveredRatings, [index]: 0 })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              isSelected || isHovered
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm text-muted-foreground self-center">
                      {getAnswer(index) ? `${getAnswer(index)}/5` : 'Select rating'}
                    </span>
                  </div>
                )}

                {question.type === 'text' && (
                  <Textarea
                    placeholder="Enter your answer..."
                    value={(getAnswer(index) as string) || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    rows={4}
                    required
                  />
                )}

                {question.type === 'multiple' && (
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={getAnswer(index) === option}
                          onChange={(e) => handleTextChange(index, e.target.value)}
                          className="w-4 h-4"
                          required
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
