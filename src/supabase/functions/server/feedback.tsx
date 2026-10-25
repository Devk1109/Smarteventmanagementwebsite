import { Hono } from "hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Feedback form structure
interface FeedbackQuestion {
  text: string;
  type: 'rating' | 'text' | 'multiple';
  options?: string[];
}

interface FeedbackForm {
  id: string;
  eventId: string;
  eventTitle: string;
  questions: number;
  questionList: FeedbackQuestion[];
  responses: number;
  avgRating: number;
  createdAt: string;
  status: 'active' | 'closed';
  organizerId?: string;
}

interface FeedbackResponse {
  id: string;
  formId: string;
  eventId: string;
  studentId: string;
  studentName: string;
  answers: { questionIndex: number; answer: string | number }[];
  submittedAt: string;
}

// Create a feedback form
app.post("/make-server-94da7951/feedback/forms", async (c) => {
  try {
    const body = await c.req.json();
    const { eventId, eventTitle, questionList, organizerId } = body;

    if (!eventId || !eventTitle || !questionList || questionList.length === 0) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const formId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const feedbackForm: FeedbackForm = {
      id: formId,
      eventId,
      eventTitle,
      questions: questionList.length,
      questionList,
      responses: 0,
      avgRating: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      organizerId,
    };

    // Store the feedback form
    await kv.set(`feedback-form:${formId}`, feedbackForm);
    
    // Index by event ID for easy lookup
    await kv.set(`feedback-form-by-event:${eventId}`, formId);

    console.log(`Created feedback form: ${formId} for event: ${eventId}`);
    return c.json(feedbackForm, 201);
  } catch (error) {
    console.error("Error creating feedback form:", error);
    return c.json({ error: "Failed to create feedback form" }, 500);
  }
});

// Get all feedback forms
app.get("/make-server-94da7951/feedback/forms", async (c) => {
  try {
    const forms = await kv.getByPrefix("feedback-form:");
    
    // Filter out the index entries
    const feedbackForms = forms.filter((form: any) => 
      form && form.id && form.id.startsWith('feedback-')
    );

    console.log(`Retrieved ${feedbackForms.length} feedback forms`);
    return c.json(feedbackForms);
  } catch (error) {
    console.error("Error getting feedback forms:", error);
    return c.json({ error: "Failed to get feedback forms" }, 500);
  }
});

// Get feedback form by event ID
app.get("/make-server-94da7951/feedback/forms/event/:eventId", async (c) => {
  try {
    const eventId = c.req.param("eventId");
    
    // Get the form ID from the index
    const formId = await kv.get(`feedback-form-by-event:${eventId}`);
    
    if (!formId) {
      return c.json(null);
    }

    // Get the actual form
    const form = await kv.get(`feedback-form:${formId}`);
    
    console.log(`Retrieved feedback form for event ${eventId}: ${formId}`);
    return c.json(form);
  } catch (error) {
    console.error("Error getting feedback form by event:", error);
    return c.json({ error: "Failed to get feedback form" }, 500);
  }
});

// Submit a feedback response
app.post("/make-server-94da7951/feedback/responses", async (c) => {
  try {
    const body = await c.req.json();
    const { formId, eventId, studentId, studentName, answers } = body;

    if (!formId || !eventId || !studentId || !studentName || !answers) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if student already submitted
    const existingResponseId = await kv.get(`feedback-response-check:${formId}:${studentId}`);
    if (existingResponseId) {
      return c.json({ error: "Feedback already submitted" }, 409);
    }

    const responseId = `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response: FeedbackResponse = {
      id: responseId,
      formId,
      eventId,
      studentId,
      studentName,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // Store the response
    await kv.set(`feedback-response:${responseId}`, response);
    
    // Create a check to prevent duplicate submissions
    await kv.set(`feedback-response-check:${formId}:${studentId}`, responseId);

    // Update form statistics
    await updateFormStatistics(formId);

    console.log(`Created feedback response: ${responseId} for form: ${formId}`);
    return c.json(response, 201);
  } catch (error) {
    console.error("Error submitting feedback response:", error);
    return c.json({ error: "Failed to submit feedback response" }, 500);
  }
});

// Check if student has submitted feedback
app.get("/make-server-94da7951/feedback/check/:formId/:studentId", async (c) => {
  try {
    const formId = c.req.param("formId");
    const studentId = c.req.param("studentId");
    
    const responseId = await kv.get(`feedback-response-check:${formId}:${studentId}`);
    
    return c.json({ hasSubmitted: !!responseId });
  } catch (error) {
    console.error("Error checking feedback submission:", error);
    return c.json({ error: "Failed to check submission" }, 500);
  }
});

// Get all responses for a feedback form
app.get("/make-server-94da7951/feedback/responses/:formId", async (c) => {
  try {
    const formId = c.req.param("formId");
    
    const allResponses = await kv.getByPrefix("feedback-response:");
    
    // Filter responses for this form
    const formResponses = allResponses.filter((response: any) => 
      response && response.formId === formId
    );

    console.log(`Retrieved ${formResponses.length} responses for form ${formId}`);
    return c.json(formResponses);
  } catch (error) {
    console.error("Error getting feedback responses:", error);
    return c.json({ error: "Failed to get feedback responses" }, 500);
  }
});

// Helper function to update form statistics
async function updateFormStatistics(formId: string) {
  try {
    const form = await kv.get(`feedback-form:${formId}`);
    if (!form) return;

    const allResponses = await kv.getByPrefix("feedback-response:");
    const formResponses = allResponses.filter((response: any) => 
      response && response.formId === formId
    );

    // Calculate average rating
    let totalRating = 0;
    let ratingCount = 0;

    formResponses.forEach((response: FeedbackResponse) => {
      response.answers.forEach(answer => {
        if (typeof answer.answer === 'number') {
          totalRating += answer.answer;
          ratingCount++;
        }
      });
    });

    const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Update the form
    const updatedForm = {
      ...form,
      responses: formResponses.length,
      avgRating,
    };

    await kv.set(`feedback-form:${formId}`, updatedForm);
    console.log(`Updated statistics for form ${formId}: ${formResponses.length} responses, avg ${avgRating.toFixed(1)}`);
  } catch (error) {
    console.error("Error updating form statistics:", error);
  }
}

export default app;