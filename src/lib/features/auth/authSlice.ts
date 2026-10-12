//src/lib/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import api, { getErrorMessage } from '@/lib/api';
import { TOKEN_COOKIE, TOKEN_EXPIRY_DAYS } from '@/lib/constants';

export type UserRole = 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  // Login / register form submission
  loading: boolean;
  error: string | null;
  // Restoring the user from a saved token (e.g. after a page refresh)
  userStatus: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get(TOKEN_COOKIE) || null,
  loading: false,
  error: null,
  userStatus: 'idle',
};

const saveToken = (token: string) =>
  Cookies.set(TOKEN_COOKIE, token, { expires: TOKEN_EXPIRY_DAYS, sameSite: 'lax' });

// Register thunk
export const registerUser = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string; role: UserRole },
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    saveToken(res.data.data.token);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Registration failed'));
  }
});

// Login thunk
export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    saveToken(res.data.data.token);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Login failed'));
  }
});

// Get current user thunk
export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to get user'));
    }
  }
);

// Logout thunk — other slices listen to logout.fulfilled to clear their data
export const logout = createAsyncThunk('auth/logout', async () => {
  Cookies.remove(TOKEN_COOKIE);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Me
      .addCase(getCurrentUser.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.userStatus = 'idle';
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.userStatus = 'failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.userStatus = 'idle';
      })
      // Register + Login share the same handling
      .addMatcher(
        (action) => registerUser.pending.match(action) || loginUser.pending.match(action),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => registerUser.fulfilled.match(action) || loginUser.fulfilled.match(action),
        (state, action: { payload: AuthResponse }) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addMatcher(
        (action) => registerUser.rejected.match(action) || loginUser.rejected.match(action),
        (state, action: { payload?: string }) => {
          state.loading = false;
          state.error = action.payload ?? 'Something went wrong';
        }
      );
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
