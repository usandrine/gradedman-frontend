//src/lib/features/results/resultsSlice.ts — graded submissions, for students and teachers
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '@/lib/api';
import { logout } from '@/lib/features/auth/authSlice';
import type { SubmissionStatus } from '@/lib/features/exams/studentExamsSlice';
import type { QuestionType } from '@/lib/features/questions/questionsSlice';

export interface ExamSummary {
  id: number;
  title: string;
  total_marks: number;
  question_count: number;
}

export interface GradedAnswer {
  question_id: number;
  type: QuestionType;
  question: string;
  options: string[];
  marks: number;
  correct_option: number | null;
  // Model answer (short answer) or explanation (multiple choice)
  model_answer: string;
  answer_text: string | null;
  selected_option: number | null;
  score: number | null;
  feedback: string | null;
}

export interface ProctoringSummary {
  // Times the student left the exam tab or window
  tab_switches: number;
  away_seconds: number;
  // Copy, cut, paste and right-click attempts — all blocked
  blocked_actions: number;
}

export interface ProctoringReport extends ProctoringSummary {
  events: {
    type: 'tab_switch' | 'tab_return' | 'copy' | 'cut' | 'paste' | 'right_click';
    away_ms: number | null;
    created_at: string;
  }[];
}

export interface SubmissionResult {
  // Only present for teachers
  proctoring?: ProctoringReport;
  submission_id: number;
  exam: ExamSummary;
  // Only present for teachers
  student?: { name: string; email: string };
  status: SubmissionStatus;
  score: number | null;
  submitted_at: string | null;
  // Teachers get the reason; students only get `true`
  grading_error: string | true | null;
  // Empty until the submission is graded
  answers: GradedAnswer[];
}

export interface SubmissionRow {
  id: number;
  student: { name: string; email: string };
  status: SubmissionStatus;
  score: number | null;
  submitted_at: string | null;
  grading_error: string | null;
  proctoring: ProctoringSummary;
}

interface ExamSubmissions {
  exam: ExamSummary;
  submissions: SubmissionRow[];
}

interface ResultsState {
  // The result open on a detail page
  result: SubmissionResult | null;
  resultStatus: 'idle' | 'loading' | 'failed';
  // Teacher: everyone who took one exam
  examSubmissions: ExamSubmissions | null;
  listStatus: 'idle' | 'loading' | 'failed';
  regrading: boolean;
  error: string | null;
}

const initialState: ResultsState = {
  result: null,
  resultStatus: 'idle',
  examSubmissions: null,
  listStatus: 'idle',
  regrading: false,
  error: null,
};

// Student: my result for an exam. `silent` is used when polling for grading to finish.
export const fetchMyResult = createAsyncThunk<
  SubmissionResult,
  { examId: number; silent?: boolean },
  { rejectValue: string }
>('results/fetchMine', async ({ examId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/exams/${examId}/result`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load your result'));
  }
});

export const fetchExamSubmissions = createAsyncThunk<ExamSubmissions, number, { rejectValue: string }>(
  'results/fetchExamSubmissions',
  async (examId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/exams/${examId}/submissions`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load submissions'));
    }
  }
);

export const fetchSubmission = createAsyncThunk<
  SubmissionResult,
  { examId: number; submissionId: number },
  { rejectValue: string }
>('results/fetchSubmission', async ({ examId, submissionId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/exams/${examId}/submissions/${submissionId}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load the submission'));
  }
});

// Teacher: run the grading again, e.g. after it failed
export const regradeSubmission = createAsyncThunk<
  SubmissionResult,
  { examId: number; submissionId: number },
  { rejectValue: string }
>('results/regrade', async ({ examId, submissionId }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/exams/${examId}/submissions/${submissionId}/grade`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to grade the submission'));
  }
});

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Student result
      .addCase(fetchMyResult.pending, (state, action) => {
        if (action.meta.arg.silent) return;
        state.result = null;
        state.resultStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchMyResult.fulfilled, (state, action) => {
        state.result = action.payload;
        state.resultStatus = 'idle';
      })
      .addCase(fetchMyResult.rejected, (state, action) => {
        // A failed poll keeps what is on screen
        if (action.meta.arg.silent) return;
        state.resultStatus = 'failed';
        state.error = action.payload ?? 'Failed to load your result';
      })
      // Teacher: list
      .addCase(fetchExamSubmissions.pending, (state) => {
        state.examSubmissions = null;
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchExamSubmissions.fulfilled, (state, action) => {
        state.examSubmissions = action.payload;
        state.listStatus = 'idle';
      })
      .addCase(fetchExamSubmissions.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload ?? 'Failed to load submissions';
      })
      // Teacher: one submission
      .addCase(fetchSubmission.pending, (state) => {
        state.result = null;
        state.resultStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSubmission.fulfilled, (state, action) => {
        state.result = action.payload;
        state.resultStatus = 'idle';
      })
      .addCase(fetchSubmission.rejected, (state, action) => {
        state.resultStatus = 'failed';
        state.error = action.payload ?? 'Failed to load the submission';
      })
      // Regrade
      .addCase(regradeSubmission.pending, (state) => {
        state.regrading = true;
        state.error = null;
      })
      .addCase(regradeSubmission.fulfilled, (state, action) => {
        state.regrading = false;
        state.result = action.payload;
      })
      .addCase(regradeSubmission.rejected, (state, action) => {
        state.regrading = false;
        state.error = action.payload ?? 'Failed to grade the submission';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default resultsSlice.reducer;
