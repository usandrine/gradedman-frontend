//src/lib/features/exams/studentExamsSlice.ts — exams from the student's side
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '@/lib/api';
import { logout } from '@/lib/features/auth/authSlice';
import type { QuestionType } from '@/lib/features/questions/questionsSlice';

export type SubmissionStatus = 'in_progress' | 'submitted' | 'graded';

export interface AvailableExam {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  question_count: number;
  total_marks: number;
  teacher_name: string;
  // This student's attempt, if they have started one
  submission: {
    status: SubmissionStatus;
    started_at: string;
    submitted_at: string | null;
    score: number | null;
  } | null;
}

// A question as students receive it — no answers
export interface StudentQuestion {
  id: number;
  position: number;
  type: QuestionType;
  question: string;
  options: string[];
  marks: number;
}

export interface ExamAttempt {
  exam: {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
    total_marks: number;
    questions: StudentQuestion[];
  };
  submission: {
    id: number;
    started_at: string;
    deadline: string;
    server_time: string;
  };
  // When the timer ends, as a timestamp (ms) on this device's clock
  localDeadline: number;
}

export interface AnswerInput {
  questionId: number;
  text?: string;
  selectedOption?: number | null;
}

interface StudentExamsState {
  items: AvailableExam[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // The exam being taken right now
  attempt: ExamAttempt | null;
  attemptStatus: 'idle' | 'loading' | 'failed';
  attemptError: string | null;
  submitting: boolean;
  submitError: string | null;
}

const initialState: StudentExamsState = {
  items: [],
  status: 'idle',
  error: null,
  attempt: null,
  attemptStatus: 'idle',
  attemptError: null,
  submitting: false,
  submitError: null,
};

export const fetchAvailableExams = createAsyncThunk<AvailableExam[], void, { rejectValue: string }>(
  'studentExams/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/exams/available');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load exams'));
    }
  }
);

// Starts the attempt, or resumes it if the student already started
export const startExam = createAsyncThunk<ExamAttempt, number, { rejectValue: string }>(
  'studentExams/start',
  async (examId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/exams/${examId}/start`);
      const attempt = res.data.data;

      // Time left according to the server, counted on this device's clock — so a wrong clock can't add time
      const timeLeft = new Date(attempt.submission.deadline).getTime() - new Date(attempt.submission.server_time).getTime();
      return { ...attempt, localDeadline: Date.now() + timeLeft };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to open the exam'));
    }
  }
);

export const submitExam = createAsyncThunk<
  { examId: number; answered: number; total: number },
  { examId: number; answers: AnswerInput[] },
  { rejectValue: string }
>('studentExams/submit', async ({ examId, answers }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/exams/${examId}/submit`, { answers });
    return { examId, ...res.data.data };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to submit the exam'));
  }
});

const studentExamsSlice = createSlice({
  name: 'studentExams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchAvailableExams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAvailableExams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAvailableExams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load exams';
      })
      // Start
      .addCase(startExam.pending, (state) => {
        state.attempt = null;
        state.attemptStatus = 'loading';
        state.attemptError = null;
        state.submitError = null;
      })
      .addCase(startExam.fulfilled, (state, action) => {
        state.attempt = action.payload;
        state.attemptStatus = 'idle';
      })
      .addCase(startExam.rejected, (state, action) => {
        state.attemptStatus = 'failed';
        state.attemptError = action.payload ?? 'Failed to open the exam';
      })
      // Submit
      .addCase(submitExam.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.submitting = false;
        state.attempt = null;

        const exam = state.items.find((item) => item.id === action.payload.examId);
        if (exam?.submission) exam.submission.status = 'submitted';
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload ?? 'Failed to submit the exam';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default studentExamsSlice.reducer;
