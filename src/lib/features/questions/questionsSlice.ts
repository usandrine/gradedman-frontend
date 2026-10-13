//src/lib/features/questions/questionsSlice.ts
import { createSlice, createAsyncThunk, nanoid, PayloadAction } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '@/lib/api';
import { logout } from '@/lib/features/auth/authSlice';

export type QuestionType = 'short_answer' | 'multiple_choice';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  // Client-side id — generated questions are not saved on the server until they become an exam
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  // Multiple choice only — empty for short answer
  options: string[];
  // Multiple choice only — index into options
  correct_option: number | null;
  // Short answer: the model answer. Multiple choice: why the correct option is right.
  answer: string;
  marks: number;
}

export interface GenerateQuestionsParams {
  materialId: number;
  count: number;
  difficulty: Difficulty;
  type: QuestionType;
  marks: number;
  topic?: string;
}

interface GenerateResponse {
  material: { id: number; original_name: string };
  requested: number;
  questions: Omit<Question, 'id'>[];
}

interface QuestionsState {
  items: Question[];
  // Name of the material the current questions came from
  sourceName: string | null;
  generating: boolean;
  error: string | null;
  // Set when the AI returned fewer questions than requested
  notice: string | null;
}

const initialState: QuestionsState = {
  items: [],
  sourceName: null,
  generating: false,
  error: null,
  notice: null,
};

export const generateQuestions = createAsyncThunk<GenerateResponse, GenerateQuestionsParams, { rejectValue: string }>(
  'questions/generate',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.post('/questions/generate', params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to generate questions'));
    }
  }
);

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    updateQuestion: (state, action: PayloadAction<Question>) => {
      const index = state.items.findIndex((question) => question.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((question) => question.id !== action.payload);
    },
    clearQuestions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestions.pending, (state) => {
        state.generating = true;
        state.error = null;
        state.notice = null;
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        const { questions, requested, material } = action.payload;

        state.generating = false;
        state.items = questions.map((question) => ({ ...question, id: nanoid() }));
        state.sourceName = material.original_name;
        state.notice =
          questions.length < requested
            ? `Only ${questions.length} of the ${requested} questions you asked for could be written from this material.`
            : null;
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload ?? 'Failed to generate questions';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { updateQuestion, removeQuestion, clearQuestions } = questionsSlice.actions;
export default questionsSlice.reducer;
