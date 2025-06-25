import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserPreferences } from '../../types';

const initialState: UserState = {
  preferences: {
    dietary: [],
    allergies: [],
    cuisinePreferences: [],
    skillLevel: 'beginner',
  },
  favorites: [],
  recentSearches: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const search = action.payload;
      state.recentSearches = [search, ...state.recentSearches.filter(s => s !== search)].slice(0, 10);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const {
  updatePreferences,
  addToFavorites,
  removeFromFavorites,
  addRecentSearch,
  clearRecentSearches,
} = userSlice.actions;

export default userSlice.reducer;