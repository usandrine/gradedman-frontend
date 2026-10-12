//src/lib/features/materials/materialsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '@/lib/api';
import { logout } from '@/lib/features/auth/authSlice';

export type MaterialStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface Material {
  id: number;
  original_name: string;
  mime_type: string;
  size: number;
  status: MaterialStatus;
  // Number of text chunks stored for the AI once processing has finished
  chunk_count: number;
  error_message: string | null;
  created_at: string;
}

// The backend is still working on these — keep polling while any exist
export const isProcessing = (material: Material) => material.status === 'processing';

interface MaterialsState {
  items: Material[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
}

const initialState: MaterialsState = {
  items: [],
  status: 'idle',
  error: null,
  uploading: false,
  uploadProgress: 0,
  uploadError: null,
};

export const fetchMaterials = createAsyncThunk<Material[], void, { rejectValue: string }>(
  'materials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/materials');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load materials'));
    }
  }
);

// Same request as fetchMaterials, but silent: no loading state, and errors are ignored.
// Used for polling while documents are being processed.
export const refreshMaterials = createAsyncThunk<Material[]>('materials/refresh', async () => {
  const res = await api.get('/materials');
  return res.data.data;
});

// Run the AI processing again for a material that failed
export const reprocessMaterial = createAsyncThunk<Material, number, { rejectValue: string }>(
  'materials/reprocess',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/materials/${id}/process`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to start processing'));
    }
  }
);

export const uploadMaterial = createAsyncThunk<Material, File, { rejectValue: string }>(
  'materials/upload',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/materials', formData, {
        onUploadProgress: (event) => {
          const total = event.total ?? file.size;
          dispatch(setUploadProgress(Math.round((event.loaded * 100) / total)));
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Upload failed'));
    }
  }
);

export const deleteMaterial = createAsyncThunk<number, number, { rejectValue: string }>(
  'materials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/materials/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete material'));
    }
  }
);

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMaterials.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load materials';
      })
      // Silent refresh
      .addCase(refreshMaterials.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // Reprocess
      .addCase(reprocessMaterial.pending, (state) => {
        state.error = null;
      })
      .addCase(reprocessMaterial.fulfilled, (state, action) => {
        const index = state.items.findIndex((material) => material.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(reprocessMaterial.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to start processing';
      })
      // Upload
      .addCase(uploadMaterial.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.uploadError = null;
      })
      .addCase(uploadMaterial.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload);
      })
      .addCase(uploadMaterial.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload ?? 'Upload failed';
      })
      // Delete
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.items = state.items.filter((material) => material.id !== action.payload);
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete material';
      })
      // Never keep one user's materials around for the next login
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { setUploadProgress, clearUploadError } = materialsSlice.actions;
export default materialsSlice.reducer;
