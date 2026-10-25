import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, BarChart3, Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { CreateFeedbackDialog } from './CreateFeedbackDialog';
import { Badge } from '../ui/badge';
import { getAllFeedbackForms, FeedbackForm, getResponsesByFormId, FeedbackResponse } from '../../utils/feedbackStorage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function FeedbackManagement() {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [selectedFormResponses, setSelectedFormResponses] = useState<FeedbackResponse[] | null>(null);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    const allForms = await getAllFeedbackForms();
    setForms(allForms);
  };

  const handleCreateFeedback = (newForm: FeedbackForm) => {
    setForms([newForm, ...forms]);
  };

  const handleViewResponses = async (form: FeedbackForm) => {
    setSelectedForm(form);
    setIsLoadingResponses(true);
    
    try {
      const responses = await getResponsesByFormId(form.id);
      setSelectedFormResponses(responses);
    } catch (error) {
      console.error('Error loading responses:', error);
      setSelectedFormResponses([]);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Feedback Management
          </h2>
          <p className="text-muted-foreground">Create and manage event feedback forms</p>
        </div>
        <CreateFeedbackDialog onCreateFeedback={handleCreateFeedback}>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/50">
            <Plus className="h-4 w-4" />
            Create Feedback Form
          </Button>
        </CreateFeedbackDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg group-hover:text-pink-600 transition-colors">{form.eventTitle}</CardTitle>
                  <CardDescription>
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge 
                  variant={form.status === 'active' ? 'default' : 'secondary'}
                  className={form.status === 'active' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg' 
                    : 'bg-gray-500'}
                >
                  {form.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Responses</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {form.responses}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border-2 border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Star className="h-5 w-5 fill-amber-500" />
                    <span className="text-sm font-medium">Avg Rating</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {form.avgRating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    Questions
                  </span>
                  <span className="font-bold text-purple-600">{form.questions} questions</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-2 border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                  onClick={() => handleViewResponses(form)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Responses ({form.responses})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {forms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-muted-foreground text-lg">No feedback forms created yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Create a feedback form to collect responses from students.</p>
        </div>
      )}

      {/* Responses Dialog */}
      <Dialog open={selectedFormResponses !== null} onOpenChange={() => setSelectedFormResponses(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Feedback Responses
            </DialogTitle>
            <DialogDescription>
              {selectedForm?.eventTitle} - {selectedFormResponses?.length || 0} responses
            </DialogDescription>
          </DialogHeader>

          {isLoadingResponses ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Loading responses...</p>
            </div>
          ) : selectedFormResponses && selectedFormResponses.length > 0 ? (
            <div className="space-y-4">
              {selectedFormResponses.map((response) => (
                <Card key={response.id} className="border-2 border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{response.studentName}</CardTitle>
                        <CardDescription>
                          {new Date(response.submittedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        ✓ Submitted
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {response.answers.map((answer, idx) => {
                        const question = selectedForm?.questionList[answer.questionIndex];
                        return (
                          <div key={idx} className="border-l-4 border-gradient-to-b from-purple-500 to-pink-500 pl-4 py-2 bg-muted/30 rounded-r-lg">
                            <p className="font-medium text-sm mb-1 text-purple-700 dark:text-purple-300">
                              {answer.questionIndex + 1}. {question?.text}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-2">
                              {question?.type === 'rating' ? (
                                <span className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < (answer.answer as number) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="ml-2 font-medium">{answer.answer}/5</span>
                                </span>
                              ) : (
                                answer.answer
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-muted-foreground">No responses yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
