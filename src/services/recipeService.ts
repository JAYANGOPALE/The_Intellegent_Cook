import { Recipe, SearchFilters, Substitution } from '../types';

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Classic Chicken Stir Fry',
    description: 'A quick and delicious stir fry with tender chicken and crisp vegetables',
    image: 'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'chicken breast', amount: '1', unit: 'lb', essential: true },
      { name: 'bell pepper', amount: '2', unit: 'pieces', essential: true },
      { name: 'onion', amount: '1', unit: 'medium', essential: true },
      { name: 'garlic', amount: '3', unit: 'cloves', essential: true },
      { name: 'ginger', amount: '1', unit: 'tbsp', essential: false },
      { name: 'olive oil', amount: '2', unit: 'tbsp', essential: true },
    ],
    instructions: [
      'Cut chicken breast into bite-sized pieces and season with salt and pepper',
      'Heat olive oil in a large wok or skillet over high heat',
      'Add chicken and cook for 3-4 minutes until golden brown',
      'Add garlic and ginger, stir for 30 seconds until fragrant',
      'Add bell peppers and onion, stir-fry for 3-4 minutes until crisp-tender',
      'Season with soy sauce and serve over rice'
    ],
    tags: ['quick', 'healthy', 'asian', 'protein-rich'],
    nutrition: {
      calories: 285,
      protein: 32,
      carbs: 12,
      fat: 14,
      fiber: 3
    }
  },
  {
    id: '2',
    name: 'Creamy Mushroom Pasta',
    description: 'Rich and creamy pasta with sautéed mushrooms and herbs',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'pasta', amount: '12', unit: 'oz', essential: true },
      { name: 'mushrooms', amount: '8', unit: 'oz', essential: true },
      { name: 'garlic', amount: '4', unit: 'cloves', essential: true },
      { name: 'butter', amount: '3', unit: 'tbsp', essential: true },
      { name: 'milk', amount: '1', unit: 'cup', essential: true },
      { name: 'cheese', amount: '1/2', unit: 'cup', essential: false },
    ],
    instructions: [
      'Cook pasta according to package directions until al dente',
      'Slice mushrooms and mince garlic',
      'In a large skillet, melt butter over medium-high heat',
      'Add mushrooms and cook until golden brown, about 5 minutes',
      'Add garlic and cook for 1 minute until fragrant',
      'Pour in milk and simmer until slightly thickened',
      'Add drained pasta and toss to combine',
      'Stir in cheese if using and season with salt and pepper'
    ],
    tags: ['vegetarian', 'comfort-food', 'creamy', 'italian'],
    nutrition: {
      calories: 420,
      protein: 16,
      carbs: 58,
      fat: 16,
      fiber: 4
    }
  },
  {
    id: '3',
    name: 'Mediterranean Vegetable Bowl',
    description: 'Fresh and healthy bowl with roasted vegetables and herbs',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 20,
    cookTime: 25,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'tomato', amount: '2', unit: 'large', essential: true },
      { name: 'bell pepper', amount: '1', unit: 'piece', essential: true },
      { name: 'onion', amount: '1', unit: 'medium', essential: true },
      { name: 'olive oil', amount: '3', unit: 'tbsp', essential: true },
      { name: 'garlic', amount: '2', unit: 'cloves', essential: true },
      { name: 'lemon', amount: '1', unit: 'piece', essential: false },
    ],
    instructions: [
      'Preheat oven to 425°F (220°C)',
      'Chop all vegetables into bite-sized pieces',
      'Toss vegetables with olive oil, salt, and pepper',
      'Spread on a baking sheet in a single layer',
      'Roast for 20-25 minutes until tender and lightly caramelized',
      'Squeeze lemon juice over vegetables before serving'
    ],
    tags: ['vegan', 'healthy', 'mediterranean', 'gluten-free'],
    nutrition: {
      calories: 245,
      protein: 6,
      carbs: 28,
      fat: 14,
      fiber: 8
    }
  },
  {
    id: '4',
    name: 'Fluffy Scrambled Eggs',
    description: 'Perfect creamy scrambled eggs with butter and herbs',
    image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 2,
    cookTime: 5,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'eggs', amount: '6', unit: 'large', essential: true },
      { name: 'butter', amount: '2', unit: 'tbsp', essential: true },
      { name: 'milk', amount: '2', unit: 'tbsp', essential: false },
    ],
    instructions: [
      'Crack eggs into a bowl and whisk with milk and a pinch of salt',
      'Heat butter in a non-stick pan over low-medium heat',
      'Pour in egg mixture when butter is melted',
      'Gently stir with a spatula, pushing eggs from edges to center',
      'Continue stirring gently until eggs are just set but still creamy',
      'Remove from heat and serve immediately'
    ],
    tags: ['breakfast', 'quick', 'protein-rich', 'vegetarian'],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 2,
      fat: 26,
      fiber: 0
    }
  },
  {
    id: '5',
    name: 'Garlic Herb Roasted Potatoes',
    description: 'Crispy golden potatoes with fresh herbs and garlic',
    image: 'https://images.pexels.com/photos/1435741/pexels-photo-1435741.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'potato', amount: '2', unit: 'lbs', essential: true },
      { name: 'olive oil', amount: '3', unit: 'tbsp', essential: true },
      { name: 'garlic', amount: '4', unit: 'cloves', essential: true },
    ],
    instructions: [
      'Preheat oven to 425°F (220°C)',
      'Wash and quarter potatoes (leave skin on)',
      'Toss with olive oil, minced garlic, salt, and pepper',
      'Arrange on baking sheet in single layer',
      'Roast for 30-35 minutes until golden and crispy',
      'Garnish with fresh herbs before serving'
    ],
    tags: ['side-dish', 'vegan', 'crispy', 'comfort-food'],
    nutrition: {
      calories: 180,
      protein: 4,
      carbs: 32,
      fat: 10,
      fiber: 4
    }
  },
  {
    id: '6',
    name: 'Fresh Spinach Salad',
    description: 'Light and refreshing salad with baby spinach and vegetables',
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=500',
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'spinach', amount: '4', unit: 'cups', essential: true },
      { name: 'tomato', amount: '1', unit: 'large', essential: true },
      { name: 'cucumber', amount: '1', unit: 'medium', essential: true },
      { name: 'olive oil', amount: '2', unit: 'tbsp', essential: true },
      { name: 'lemon', amount: '1/2', unit: 'piece', essential: true },
    ],
    instructions: [
      'Wash and dry spinach leaves thoroughly',
      'Dice tomatoes and cucumber into bite-sized pieces',
      'Combine spinach, tomatoes, and cucumber in a large bowl',
      'Whisk olive oil with lemon juice, salt, and pepper',
      'Toss salad with dressing just before serving'
    ],
    tags: ['salad', 'vegan', 'healthy', 'no-cook', 'gluten-free'],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 8,
      fat: 14,
      fiber: 4
    }
  }
];

// Ingredient substitution database
const substitutions: Record<string, string[]> = {
  'chicken breast': ['turkey breast', 'tofu', 'tempeh'],
  'ground beef': ['ground turkey', 'lentils', 'mushrooms'],
  'butter': ['olive oil', 'coconut oil', 'margarine'],
  'milk': ['almond milk', 'oat milk', 'coconut milk'],
  'cheese': ['nutritional yeast', 'cashew cheese', 'vegan cheese'],
  'eggs': ['flax eggs', 'chia eggs', 'applesauce'],
  'flour': ['almond flour', 'coconut flour', 'oat flour'],
};

export const searchRecipes = async (
  availableIngredients: string[],
  filters: SearchFilters = {},
  searchQuery?: string
): Promise<Recipe[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredRecipes = [...mockRecipes];

  // Filter by search query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
    );
  }

  // Apply filters
  if (filters.difficulty && filters.difficulty.length > 0) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      filters.difficulty!.includes(recipe.difficulty)
    );
  }

  if (filters.cookTime) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      (recipe.prepTime + recipe.cookTime) <= filters.cookTime!
    );
  }

  if (filters.dietary && filters.dietary.length > 0) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      filters.dietary!.some(diet => recipe.tags.includes(diet))
    );
  }

  // Calculate match scores and add substitution suggestions
  const recipesWithScores = filteredRecipes.map(recipe => {
    const { matchScore, availableIngredients: available, missingIngredients, substitutionSuggestions } = 
      calculateMatchScore(recipe, availableIngredients);
    
    return {
      ...recipe,
      matchScore,
      availableIngredients: available,
      missingIngredients,
      substitutions: substitutionSuggestions,
    };
  });

  // Filter by minimum match score
  const minMatchScore = filters.minMatchScore || 0;
  const finalRecipes = recipesWithScores.filter(recipe =>
    (recipe.matchScore || 0) >= minMatchScore
  );

  // Sort by match score (highest first)
  return finalRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockRecipes.find(recipe => recipe.id === id) || null;
};

// Advanced matching algorithm
function calculateMatchScore(recipe: Recipe, availableIngredients: string[]): {
  matchScore: number;
  availableIngredients: string[];
  missingIngredients: string[];
  substitutionSuggestions: Substitution[];
} {
  const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
  const available = availableIngredients.map(ing => ing.toLowerCase());
  
  let matchedIngredients: string[] = [];
  let missingIngredients: string[] = [];
  let substitutionSuggestions: Substitution[] = [];

  recipeIngredients.forEach(ingredient => {
    if (available.includes(ingredient)) {
      matchedIngredients.push(ingredient);
    } else {
      missingIngredients.push(ingredient);
      
      // Check for possible substitutions
      const possibleSubs = substitutions[ingredient];
      if (possibleSubs) {
        const availableSubstitution = possibleSubs.find(sub => 
          available.includes(sub.toLowerCase())
        );
        
        if (availableSubstitution) {
          substitutionSuggestions.push({
            original: ingredient,
            substitute: availableSubstitution,
            confidence: 0.8 + Math.random() * 0.15, // 80-95% confidence
          });
          matchedIngredients.push(ingredient); // Count as matched due to substitution
          missingIngredients = missingIngredients.filter(ing => ing !== ingredient);
        }
      }
    }
  });

  // Calculate match score with weighted importance
  const essentialIngredients = recipe.ingredients.filter(ing => ing.essential);
  const nonEssentialIngredients = recipe.ingredients.filter(ing => !ing.essential);
  
  let essentialMatches = 0;
  let nonEssentialMatches = 0;

  essentialIngredients.forEach(ingredient => {
    if (matchedIngredients.includes(ingredient.name.toLowerCase())) {
      essentialMatches++;
    }
  });

  nonEssentialIngredients.forEach(ingredient => {
    if (matchedIngredients.includes(ingredient.name.toLowerCase())) {
      nonEssentialMatches++;
    }
  });

  // Weighted score: essential ingredients worth 80%, non-essential 20%
  const essentialScore = essentialIngredients.length > 0 ? 
    (essentialMatches / essentialIngredients.length) * 0.8 : 0.8;
  
  const nonEssentialScore = nonEssentialIngredients.length > 0 ? 
    (nonEssentialMatches / nonEssentialIngredients.length) * 0.2 : 0.2;

  const matchScore = Math.round((essentialScore + nonEssentialScore) * 100);

  return {
    matchScore,
    availableIngredients: matchedIngredients,
    missingIngredients,
    substitutionSuggestions,
  };
}

export const getPopularRecipes = async (): Promise<Recipe[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRecipes.slice(0, 3);
};

export const getRecipesByCategory = async (category: string): Promise<Recipe[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockRecipes.filter(recipe => recipe.tags.includes(category));
};