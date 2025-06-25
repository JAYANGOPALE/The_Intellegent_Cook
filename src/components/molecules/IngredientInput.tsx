import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { addIngredient, fetchIngredientSuggestions, clearSuggestions } from '../../store/slices/ingredientsSlice';
import { Ingredient } from '../../types';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';

const IngredientInput: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { suggestions, available } = useSelector((state: RootState) => state.ingredients);
  
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        dispatch(fetchIngredientSuggestions(query));
        setShowSuggestions(true);
      } else {
        dispatch(clearSuggestions());
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddIngredient = (ingredient: Ingredient) => {
    dispatch(addIngredient(ingredient));
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleManualAdd = () => {
    if (query.trim()) {
      const newIngredient: Ingredient = {
        id: `manual-${Date.now()}`,
        name: query.trim().toLowerCase(),
        category: 'manual',
        confidence: 0.9,
      };
      handleAddIngredient(newIngredient);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAddIngredient(suggestions[0]);
      } else {
        handleManualAdd();
      }
    }
  };

  const isAlreadyAdded = (ingredientName: string) => {
    return available.some(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type an ingredient name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          icon={<Search className="h-4 w-4" />}
          className="pr-12"
        />
        
        {query.trim() && (
          <Button
            size="sm"
            onClick={handleManualAdd}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionBoxRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((ingredient, index) => (
                <motion.button
                  key={ingredient.id}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
                  } ${
                    isAlreadyAdded(ingredient.name) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isAlreadyAdded(ingredient.name) && handleAddIngredient(ingredient)}
                  disabled={isAlreadyAdded(ingredient.name)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {ingredient.category}
                      </p>
                    </div>
                    {isAlreadyAdded(ingredient.name) && (
                      <Badge variant="success" size="sm">
                        Added
                      </Badge>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Quick Add Categories</h4>
        <div className="flex flex-wrap gap-2">
          {['vegetables', 'protein', 'dairy', 'grains', 'spices'].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setQuery(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Manual Add Helper */}
      {query.trim() && suggestions.length === 0 && query.length >= 2 && (
        <motion.div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-blue-800">
            No suggestions found. You can still add "{query}" manually.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default IngredientInput;