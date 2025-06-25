import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, Heart, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Recipe } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { addToFavorites, removeFromFavorites } from '../../store/slices/userSlice';
import { setSelectedRecipe } from '../../store/slices/recipesSlice';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.user.favorites);
  const isFavorite = favorites.includes(recipe.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(recipe.id));
    } else {
      dispatch(addToFavorites(recipe.id));
    }
  };

  const handleCardClick = () => {
    dispatch(setSelectedRecipe(recipe));
    onClick?.();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Match Score Badge */}
        {recipe.matchScore !== undefined && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(recipe.matchScore)}`}>
            {recipe.matchScore}% Match
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant={getDifficultyColor(recipe.difficulty)} size="sm">
            {recipe.difficulty}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title and Description */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
            {recipe.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {recipe.description}
          </p>
        </div>

        {/* Recipe Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          
          {recipe.nutrition && (
            <div className="text-xs">
              {recipe.nutrition.calories} cal
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="info" size="sm">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Ingredient Status */}
        {recipe.availableIngredients && recipe.missingIngredients && (
          <div className="space-y-2">
            {recipe.availableIngredients.length > 0 && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">
                  {recipe.availableIngredients.length} available
                </span>
              </div>
            )}
            
            {recipe.missingIngredients.length > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700">
                  {recipe.missingIngredients.length} missing
                </span>
              </div>
            )}
          </div>
        )}

        {/* Substitutions Available */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <div className="flex items-center space-x-2">
            <ChefHat className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              {recipe.substitutions.length} substitution{recipe.substitutions.length > 1 ? 's' : ''} available
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecipeCard;