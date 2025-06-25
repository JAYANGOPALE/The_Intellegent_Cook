import { Ingredient } from '../types';

const commonIngredients: Ingredient[] = [
  { id: '1', name: 'tomato', category: 'vegetables' },
  { id: '2', name: 'onion', category: 'vegetables' },
  { id: '3', name: 'garlic', category: 'vegetables' },
  { id: '4', name: 'ginger', category: 'spices' },
  { id: '5', name: 'chicken breast', category: 'protein' },
  { id: '6', name: 'ground beef', category: 'protein' },
  { id: '7', name: 'eggs', category: 'protein' },
  { id: '8', name: 'rice', category: 'grains' },
  { id: '9', name: 'pasta', category: 'grains' },
  { id: '10', name: 'flour', category: 'grains' },
  { id: '11', name: 'olive oil', category: 'oils' },
  { id: '12', name: 'butter', category: 'dairy' },
  { id: '13', name: 'milk', category: 'dairy' },
  { id: '14', name: 'cheese', category: 'dairy' },
  { id: '15', name: 'bell pepper', category: 'vegetables' },
  { id: '16', name: 'carrot', category: 'vegetables' },
  { id: '17', name: 'potato', category: 'vegetables' },
  { id: '18', name: 'spinach', category: 'vegetables' },
  { id: '19', name: 'mushrooms', category: 'vegetables' },
  { id: '20', name: 'lemon', category: 'fruits' },
  { id: '21', name: 'cucumber', category: 'vegetables' },
  { id: '22', name: 'lettuce', category: 'vegetables' },
  { id: '23', name: 'broccoli', category: 'vegetables' },
  { id: '24', name: 'salmon', category: 'protein' },
  { id: '25', name: 'shrimp', category: 'protein' },
];

export const getIngredientSuggestions = async (query: string): Promise<Ingredient[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query || query.length < 2) {
    return [];
  }

  const filtered = commonIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, 8);
};

export const getIngredientsByCategory = async (category: string): Promise<Ingredient[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return commonIngredients.filter(ingredient => 
    ingredient.category === category
  );
};

export const getAllCategories = (): string[] => {
  const categories = [...new Set(commonIngredients.map(ing => ing.category))];
  return categories;
};