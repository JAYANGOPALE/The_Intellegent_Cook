import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { removeIngredient, toggleIngredient, clearIngredients } from '../../store/slices/ingredientsSlice';
import { setActiveTab } from '../../store/slices/uiSlice';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import ImageUploader from '../molecules/ImageUploader';
import IngredientInput from '../molecules/IngredientInput';

const IngredientManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { available, detection } = useSelector((state: RootState) => state.ingredients);
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);

  const tabs = [
    { id: 'upload', label: 'AI Detection', icon: Package },
    { id: 'manual', label: 'Manual Entry', icon: ToggleLeft },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setActiveTab(tab.id as any))}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && <ImageUploader />}
          {activeTab === 'manual' && <IngredientInput />}
        </motion.div>
      </AnimatePresence>

      {/* Detection Results */}
      {detection.processing && (
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">AI Processing Your Image</p>
              <p className="text-sm text-blue-700">
                Analyzing ingredients with {Math.round(detection.confidence * 100)}% confidence...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Ingredients */}
      {available.length > 0 && (
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Your Ingredients ({available.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearIngredients())}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {available.map((ingredient) => (
              <motion.div
                key={ingredient.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  ingredient.isAvailable
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => dispatch(toggleIngredient(ingredient.id))}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {ingredient.isAvailable ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div>
                    <p className={`font-medium capitalize ${
                      ingredient.isAvailable ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {ingredient.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        className="capitalize"
                      >
                        {ingredient.category}
                      </Badge>
                      {ingredient.confidence && (
                        <Badge 
                          variant={ingredient.confidence > 0.8 ? 'success' : 'warning'} 
                          size="sm"
                        >
                          {Math.round(ingredient.confidence * 100)}% sure
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(removeIngredient(ingredient.id))}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>Toggle ingredients on/off to refine your recipe matches. Disabled ingredients won't be considered in recommendations.</p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {available.length === 0 && !detection.processing && (
        <motion.div
          className="text-center py-12 bg-gray-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Ingredients Added Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload photos or manually add ingredients to get started with recipe recommendations.
          </p>
          <div className="space-x-2">
            <Button
              onClick={() => dispatch(setActiveTab('upload'))}
              variant={activeTab === 'upload' ? 'primary' : 'outline'}
            >
              Upload Photos
            </Button>
            <Button
              onClick={() => dispatch(setActiveTab('manual'))}
              variant={activeTab === 'manual' ? 'primary' : 'outline'}
            >
              Add Manually
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IngredientManager;