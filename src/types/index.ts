export interface Ingredient {
  id: string;
  name: string;
  category: string;
  confidence?: number;
  isAvailable?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  nutrition?: Nutrition;
  matchScore?: number;
  missingIngredients?: string[];
  availableIngredients?: string[];
  substitutions?: Substitution[];
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  essential: boolean;
}

export interface Substitution {
  original: string;
  substitute: string;
  confidence: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DetectionResult {
  ingredients: Ingredient[];
  confidence: number;
  processing: boolean;
  error?: string;
}

export interface SearchFilters {
  difficulty?: string[];
  cookTime?: number;
  dietary?: string[];
  cuisine?: string[];
  minMatchScore?: number;
}

export interface UserPreferences {
  dietary: string[];
  allergies: string[];
  cuisinePreferences: string[];
  skillLevel: string;
}

// Redux State Types
export interface AppState {
  ingredients: IngredientsState;
  recipes: RecipesState;
  user: UserState;
  ui: UIState;
}

export interface IngredientsState {
  available: Ingredient[];
  detection: DetectionResult;
  uploading: boolean;
  suggestions: Ingredient[];
}

export interface RecipesState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  loading: boolean;
  searchQuery: string;
  filters: SearchFilters;
  selectedRecipe: Recipe | null;
}

export interface UserState {
  preferences: UserPreferences;
  favorites: string[];
  recentSearches: string[];
}

export interface UIState {
  activeTab: 'upload' | 'manual' | 'search';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}