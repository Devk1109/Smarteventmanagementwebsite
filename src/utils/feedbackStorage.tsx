// Feedback storage utilities using Supabase backend
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1`;

export interface FeedbackQuestion {
  text: string;
  type: 'rating' | 'text' | 'multiple';
  options?: string[]; // For multiple choice
}

export interface FeedbackForm {
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

export interface FeedbackResponse {
  id: string;
  formId: string;
  eventId: string;
  studentId: string;
  studentName: string;
  answers: { questionIndex: number; answer: string | number }[];
  submittedAt: string;
}

// API helper function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Get all feedback forms
export const getAllFeedbackForms = async (): Promise<FeedbackForm[]> => {
  try {
    const forms = await apiCall('/make-server-94da7951/feedback/forms');
    return forms || [];
  } catch (error) {
    console.error('Error loading feedback forms:', error);
    return [];
  }
};

// Add a new feedback form
export const addFeedbackForm = async (
  form: Omit<FeedbackForm, 'id' | 'responses' | 'avgRating' | 'createdAt' | 'status'>,
  organizerId?: string
): Promise<FeedbackForm> => {
  try {
    const newForm = await apiCall('/make-server-94da7951/feedback/forms', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        organizerId,
      }),
    });
    return newForm;
  } catch (error) {
    console.error('Error creating feedback form:', error);
    throw error;
  }
};

// Get feedback form by event ID
export const getFeedbackFormByEventId = async (eventId: string): Promise<FeedbackForm | null> => {
  try {
    const form = await apiCall(`/make-server-94da7951/feedback/forms/event/${eventId}`);
    return form;
  } catch (error) {
    console.error('Error loading feedback form for event:', error);
    return null;
  }
};

// Submit feedback response
export const submitFeedbackResponse = async (
  formId: string,
  eventId: string,
  studentId: string,
  studentName: string,
  answers: { questionIndex: number; answer: string | number }[]
): Promise<FeedbackResponse> => {
  try {
    const response = await apiCall('/make-server-94da7951/feedback/responses', {
      method: 'POST',
      body: JSON.stringify({
        formId,
        eventId,
        studentId,
        studentName,
        answers,
      }),
    });
    return response;
  } catch (error) {
    console.error('Error submitting feedback response:', error);
    throw error;
  }
};

// Check if student has already submitted feedback
export const hasSubmittedFeedback = async (formId: string, studentId: string): Promise<boolean> => {
  try {
    const result = await apiCall(`/make-server-94da7951/feedback/check/${formId}/${studentId}`);
    return result.hasSubmitted || false;
  } catch (error) {
    console.error('Error checking feedback submission:', error);
    return false;
  }
};

// Get responses for a specific form
export const getResponsesByFormId = async (formId: string): Promise<FeedbackResponse[]> => {
  try {
    const responses = await apiCall(`/make-server-94da7951/feedback/responses/${formId}`);
    return responses || [];
  } catch (error) {
    console.error('Error loading feedback responses:', error);
    return [];
  }
};
