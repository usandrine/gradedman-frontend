//src/lib/features/exams/examsSlice.ts — the teacher's exams
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '@/lib/api';
import { logout } from '@/lib/features/auth/authSlice';
import type { Question } from '@/lib/features/questions/questionsSlice';

export type ExamStatus = 'draft' | 'published';

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  status: ExamStatus;
  question_count: number;
  total_marks: number;
  // How many students have started or submitted it
  submission_count: number;
  created_at: string;
}

// A saved question — same as a generated one, but with the database id
export interface ExamQuestion extends Omit<Question, 'id'> {
  id: number;
  position: number;
}

export interface ExamWithQuestions extends Exam {
  questions: ExamQuestion[];
}

export interface CreateExamParams {
  title: string;
  description?: string;
  durationMinutes: number;
  questions: Omit<Question, 'id'>[];
}

interface ExamsState {
  items: Exam[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  saving: boolean;
  saveError: string | null;
  // The exam open on the detail page
  current: ExamWithQuestions | null;
  currentStatus: 'idle' | 'loading' | 'failed';
}

const initialState: ExamsState = {
  items: [],
  status: 'idle',
  error: null,
  saving: false,
  saveError: null,
  current: null,
  currentStatus: 'idle',
};

export const fetchExams = createAsyncThunk<Exam[], void, { rejectValue: string }>(
  'exams/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/exams');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load exams'));
    }
  }
);

export const fetchExam = createAsyncThunk<ExamWithQuestions, number, { rejectValue: string }>(
  'exams/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/exams/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load the exam'));
    }
  }
);

export const createExam = createAsyncThunk<Exam, CreateExamParams, { rejectValue: string }>(
  'exams/create',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.post('/exams', params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to save the exam'));
    }
  }
);

export const setExamStatus = createAsyncThunk<
  { id: number; status: ExamStatus },
  { id: number; status: ExamStatus },
  { rejectValue: string }
>('exams/setStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await api.patch(`/exams/${id}/status`, { status });
    return { id, status };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to update the exam'));
  }
});

export const deleteExam = createAsyncThunk<number, number, { rejectValue: string }>(
  'exams/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exams/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete the exam'));
    }
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchExams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load exams';
      })
      // Detail
      .addCase(fetchExam.pending, (state) => {
        state.current = null;
        state.currentStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchExam.fulfilled, (state, action) => {
        state.current = action.payload;
        state.currentStatus = 'idle';
      })
      .addCase(fetchExam.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.error = action.payload ?? 'Failed to load the exam';
      })
      // Create
      .addCase(createExam.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload ?? 'Failed to save the exam';
      })
      // Publish / unpublish
      .addCase(setExamStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const exam = state.items.find((item) => item.id === id);
        if (exam) exam.status = status;
        if (state.current?.id === id) state.current.status = status;
      })
      .addCase(setExamStatus.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update the exam';
      })
      // Delete
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.items = state.items.filter((exam) => exam.id !== action.payload);
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete the exam';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default examsSlice.reducer;
