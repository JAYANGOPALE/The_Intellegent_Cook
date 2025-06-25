import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, RecipesState, SearchFilters } from '../../types';
import { searchRecipes, getRecipeById } from '../../services/recipeService';
import { RootState } from '../index';

const initialState: RecipesState = {
  recipes: [],
  filteredRecipes: [],
  loading: false,
  searchQuery: '',
  filters: {},
  selectedRecipe: null,
};

// Async thunks
export const findMatchingRecipes = createAsyncThunk(
  'recipes/findMatching',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const availableIngredients = state.ingredients.available
      .filter(ing => ing.isAvailable)
      .map(ing => ing.name);
    
    const recipes = await searchRecipes(availableIngredients, state.recipes.filters);
    return recipes;
  }
);

export const searchRecipesByQuery = createAsyncThunk(
  'recipes/searchByQuery',
  async (query: string, { getState }) => {
    const state = getState() as RootState;
    const recipes = await searchRecipes([], state.recipes.filters, query);
    return recipes;
  }
);

export const fetchRecipeDetails = createAsyncThunk(
  'recipes/fetchDetails',
  async (recipeId: string) => {
    const recipe = await getRecipeById(recipeId);
    return recipe;
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
    },
    sortRecipes: (state, action: PayloadAction<'match' | 'time' | 'difficulty'>) => {
      const sortType = action.payload;
      state.filteredRecipes.sort((a, b) => {
        switch (sortType) {
          case 'match':
            return (b.matchScore || 0) - (a.matchScore || 0);
          case 'time':
            return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
          case 'difficulty':
            const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          default:
            return 0;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(findMatchingRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(findMatchingRecipes.fulfilled, (state, action) => {
        state.recipes = action.payload;
        state.filteredRecipes = action.payload;
        state.loading = false;
      })
      .addCase(findMatchingRecipes.rejected, (state) => {
        state.loading = false;
      })
      .addCase(searchRecipesByQuery.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchRecipesByQuery.fulfilled, (state, action) => {
        state.filteredRecipes = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecipeDetails.fulfilled, (state, action) => {
        state.selectedRecipe = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  updateFilters,
  clearFilters,
  setSelectedRecipe,
  sortRecipes,
} = recipesSlice.actions;

export default recipesSlice.reducer;