import { DetectionResult, Ingredient } from '../types';

// Simulate YOLOv8/EfficientNet ingredient detection
export const simulateImageDetection = async (imageFile: File): Promise<DetectionResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Mock detected ingredients based on common food items
  const mockDetections: Ingredient[] = [
    { id: 'det_1', name: 'tomato', category: 'vegetables', confidence: 0.95 },
    { id: 'det_2', name: 'onion', category: 'vegetables', confidence: 0.88 },
    { id: 'det_3', name: 'garlic', category: 'vegetables', confidence: 0.82 },
    { id: 'det_4', name: 'bell pepper', category: 'vegetables', confidence: 0.91 },
    { id: 'det_5', name: 'carrot', category: 'vegetables', confidence: 0.76 },
  ];

  // Randomly select 2-5 ingredients to simulate detection
  const numDetected = Math.floor(Math.random() * 4) + 2;
  const detectedIngredients = mockDetections
    .sort(() => Math.random() - 0.5)
    .slice(0, numDetected);

  // Add some variation to confidence scores
  const ingredientsWithVariation = detectedIngredients.map(ing => ({
    ...ing,
    confidence: Math.max(0.6, ing.confidence! + (Math.random() - 0.5) * 0.2),
  }));

  const averageConfidence = ingredientsWithVariation.reduce((sum, ing) => sum + ing.confidence!, 0) / ingredientsWithVariation.length;

  return {
    ingredients: ingredientsWithVariation,
    confidence: averageConfidence,
    processing: false,
  };
};

// Simulate batch processing
export const processBatchImages = async (files: File[]): Promise<DetectionResult[]> => {
  const results = await Promise.all(
    files.map(file => simulateImageDetection(file))
  );
  return results;
};

// Simulate confidence scoring for manual inputs
export const validateIngredient = async (ingredientName: string): Promise<number> => {
  // Simulate API call to validate ingredient
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return confidence based on ingredient name length and common ingredients
  const commonIngredients = ['tomato', 'onion', 'garlic', 'chicken', 'beef', 'rice', 'pasta'];
  const isCommon = commonIngredients.some(common => 
    ingredientName.toLowerCase().includes(common) || common.includes(ingredientName.toLowerCase())
  );
  
  return isCommon ? 0.9 + Math.random() * 0.1 : 0.6 + Math.random() * 0.3;
};