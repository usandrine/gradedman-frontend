import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import materialsReducer from './features/materials/materialsSlice';
import questionsReducer from './features/questions/questionsSlice';
import examsReducer from './features/exams/examsSlice';
import studentExamsReducer from './features/exams/studentExamsSlice';
import resultsReducer from './features/results/resultsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    materials: materialsReducer,
    questions: questionsReducer,
    exams: examsReducer,
    studentExams: studentExamsReducer,
    results: resultsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
