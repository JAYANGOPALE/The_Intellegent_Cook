import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, DetectionResult, IngredientsState } from '../../types';
import { simulateImageDetection } from '../../services/aiService';
import { getIngredientSuggestions } from '../../services/ingredientService';

const initialState: IngredientsState = {
  available: [],
  detection: {
    ingredients: [],
    confidence: 0,
    processing: false,
  },
  uploading: false,
  suggestions: [],
};

// Async thunks
export const detectIngredientsFromImage = createAsyncThunk(
  'ingredients/detectFromImage',
  async (imageFile: File) => {
    const result = await simulateImageDetection(imageFile);
    return result;
  }
);

export const fetchIngredientSuggestions = createAsyncThunk(
  'ingredients/fetchSuggestions',
  async (query: string) => {
    const suggestions = await getIngredientSuggestions(query);
    return suggestions;
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      const exists = state.available.find(ing => ing.id === action.payload.id);
      if (!exists) {
        state.available.push({ ...action.payload, isAvailable: true });
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.available = state.available.filter(ing => ing.id !== action.payload);
    },
    toggleIngredient: (state, action: PayloadAction<string>) => {
      const ingredient = state.available.find(ing => ing.id === action.payload);
      if (ingredient) {
        ingredient.isAvailable = !ingredient.isAvailable;
      }
    },
    clearIngredients: (state) => {
      state.available = [];
    },
    updateIngredientConfidence: (state, action: PayloadAction<{ id: string; confidence: number }>) => {
      const ingredient = state.available.find(ing => ing.id === action.payload.id);
      if (ingredient) {
        ingredient.confidence = action.payload.confidence;
      }
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectIngredientsFromImage.pending, (state) => {
        state.detection.processing = true;
        state.uploading = true;
        state.detection.error = undefined;
      })
      .addCase(detectIngredientsFromImage.fulfilled, (state, action) => {
        state.detection = action.payload;
        state.uploading = false;
        // Add detected ingredients to available list
        action.payload.ingredients.forEach(ingredient => {
          const exists = state.available.find(ing => ing.name === ingredient.name);
          if (!exists) {
            state.available.push({ ...ingredient, isAvailable: true });
          }
        });
      })
      .addCase(detectIngredientsFromImage.rejected, (state, action) => {
        state.detection.processing = false;
        state.uploading = false;
        state.detection.error = action.error.message || 'Detection failed';
      })
      .addCase(fetchIngredientSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const {
  addIngredient,
  removeIngredient,
  toggleIngredient,
  clearIngredients,
  updateIngredientConfidence,
  clearSuggestions,
} = ingredientsSlice.actions;

export default ingredientsSlice.reducer;