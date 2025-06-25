import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Filter, X, ChefHat, Clock, Utensils } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { updateFilters, clearFilters, sortRecipes } from '../../store/slices/recipesSlice';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const SearchFilters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.recipes.filters);

  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];
  const cuisineOptions = ['italian', 'asian', 'mexican', 'mediterranean', 'american', 'indian'];
  const cookTimeOptions = [15, 30, 45, 60, 90];

  const handleDifficultyChange = (difficulty: string) => {
    const current = filters.difficulty || [];
    const updated = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty];
    
    dispatch(updateFilters({ difficulty: updated }));
  };

  const handleDietaryChange = (dietary: string) => {
    const current = filters.dietary || [];
    const updated = current.includes(dietary)
      ? current.filter(d => d !== dietary)
      : [...current, dietary];
    
    dispatch(updateFilters({ dietary: updated }));
  };

  const handleCuisineChange = (cuisine: string) => {
    const current = filters.cuisine || [];
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    
    dispatch(updateFilters({ cuisine: updated }));
  };

  const handleCookTimeChange = (time: number) => {
    dispatch(updateFilters({ 
      cookTime: filters.cookTime === time ? undefined : time 
    }));
  };

  const handleMatchScoreChange = (score: number) => {
    dispatch(updateFilters({ 
      minMatchScore: filters.minMatchScore === score ? undefined : score 
    }));
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4 space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
        </div>
        
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearFilters())}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Sort By</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(sortRecipes('match'))}
          >
            Best Match
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(sortRecipes('time'))}
          >
            <Clock className="h-4 w-4 mr-1" />
            Cooking Time
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(sortRecipes('difficulty'))}
          >
            <ChefHat className="h-4 w-4 mr-1" />
            Difficulty
          </Button>
        </div>
      </div>

      {/* Match Score Filter */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Minimum Match Score</h4>
        <div className="flex flex-wrap gap-2">
          {[50, 70, 80, 90].map((score) => (
            <Button
              key={score}
              variant={filters.minMatchScore === score ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleMatchScoreChange(score)}
            >
              {score}%+
            </Button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Difficulty</h4>
        <div className="flex flex-wrap gap-2">
          {difficultyOptions.map((difficulty) => (
            <Button
              key={difficulty}
              variant={(filters.difficulty || []).includes(difficulty) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleDifficultyChange(difficulty)}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Cook Time Filter */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Max Cooking Time</h4>
        <div className="flex flex-wrap gap-2">
          {cookTimeOptions.map((time) => (
            <Button
              key={time}
              variant={filters.cookTime === time ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCookTimeChange(time)}
            >
              {time} min
            </Button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Dietary Preferences</h4>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((dietary) => (
            <Button
              key={dietary}
              variant={(filters.dietary || []).includes(dietary) ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleDietaryChange(dietary)}
              className="capitalize"
            >
              {dietary}
            </Button>
          ))}
        </div>
      </div>

      {/* Cuisine Type */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Cuisine</h4>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((cuisine) => (
            <Button
              key={cuisine}
              variant={(filters.cuisine || []).includes(cuisine) ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleCuisineChange(cuisine)}
              className="capitalize"
            >
              <Utensils className="h-3 w-3 mr-1" />
              {cuisine}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <motion.div
          className="pt-3 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="font-medium text-gray-700 text-sm mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-1">
            {(filters.difficulty || []).map((diff) => (
              <Badge
                key={`diff-${diff}`}
                variant="primary"
                size="sm"
                removable
                onRemove={() => handleDifficultyChange(diff)}
              >
                {diff}
              </Badge>
            ))}
            {(filters.dietary || []).map((diet) => (
              <Badge
                key={`diet-${diet}`}
                variant="secondary"
                size="sm"
                removable
                onRemove={() => handleDietaryChange(diet)}
              >
                {diet}
              </Badge>
            ))}
            {(filters.cuisine || []).map((cuisine) => (
              <Badge
                key={`cuisine-${cuisine}`}
                variant="info"
                size="sm"
                removable
                onRemove={() => handleCuisineChange(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
            {filters.cookTime && (
              <Badge
                variant="warning"
                size="sm"
                removable
                onRemove={() => handleCookTimeChange(filters.cookTime!)}
              >
                ≤{filters.cookTime} min
              </Badge>
            )}
            {filters.minMatchScore && (
              <Badge
                variant="success"
                size="sm"
                removable
                onRemove={() => handleMatchScoreChange(filters.minMatchScore!)}
              >
                {filters.minMatchScore}%+ match
              </Badge>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchFilters;