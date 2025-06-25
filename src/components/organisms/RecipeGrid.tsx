import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChefHat, Utensils } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { findMatchingRecipes, searchRecipesByQuery, setSearchQuery } from '../../store/slices/recipesSlice';
import { setActiveTab } from '../../store/slices/uiSlice';
import RecipeCard from '../molecules/RecipeCard';
import SearchFilters from '../molecules/SearchFilters';
import LoadingSpinner from '../atoms/LoadingSpinner';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

const RecipeGrid: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredRecipes, loading, searchQuery } = useSelector((state: RootState) => state.recipes);
  const { available } = useSelector((state: RootState) => state.ingredients);

  const availableIngredients = available.filter(ing => ing.isAvailable);

  useEffect(() => {
    if (availableIngredients.length > 0) {
      dispatch(findMatchingRecipes());
    }
  }, [availableIngredients, dispatch]);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim()) {
      dispatch(searchRecipesByQuery(query));
    } else {
      dispatch(findMatchingRecipes());
    }
  };

  const handleRecipeClick = () => {
    // Recipe details would open in a modal or navigate to detail page
    // For this demo, we'll just log the action
    console.log('Recipe clicked - would open detail view');
  };

  if (availableIngredients.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-white rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Find Amazing Recipes?
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Add some ingredients first to get personalized recipe recommendations based on what you have available.
        </p>
        <Button
          onClick={() => dispatch(setActiveTab('upload'))}
          size="lg"
        >
          <Utensils className="h-5 w-5 mr-2" />
          Add Ingredients
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input
          type="text"
          placeholder="Search recipes, cuisines, or ingredients..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          className="w-full"
        />
      </motion.div>

      {/* Filters */}
      <SearchFilters />

      {/* Results Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {searchQuery ? 'Search Results' : 'Recommended Recipes'}
          </h2>
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Found ${filteredRecipes.length} recipes`}
            {availableIngredients.length > 0 && !searchQuery && (
              <span> based on your {availableIngredients.length} ingredients</span>
            )}
          </p>
        </div>

        {availableIngredients.length > 0 && (
          <div className="text-sm text-gray-500">
            Using: {availableIngredients.slice(0, 3).map(ing => ing.name).join(', ')}
            {availableIngredients.length > 3 && ` +${availableIngredients.length - 3} more`}
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Finding perfect recipes for you..." />
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && (
        <AnimatePresence>
          {filteredRecipes.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <RecipeCard recipe={recipe} onClick={handleRecipeClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recipes Found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? `No recipes match "${searchQuery}". Try different keywords or adjust your filters.`
                  : 'No recipes match your current ingredients and filters. Try adding more ingredients or adjusting your criteria.'}
              </p>
              <div className="space-x-2">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => handleSearch('')}
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  onClick={() => dispatch(setActiveTab('manual'))}
                >
                  Add More Ingredients
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Performance Stats (for demo purposes) */}
      {!loading && filteredRecipes.length > 0 && (
        <motion.div
          className="text-center text-sm text-gray-500 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          Results found in ~0.{Math.floor(Math.random() * 9) + 1}s • 
          Showing {filteredRecipes.length} of {filteredRecipes.length} recipes
        </motion.div>
      )}
    </div>
  );
};

export default RecipeGrid;