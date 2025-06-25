import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles } from 'lucide-react';
import { store } from './store';
import IngredientManager from './components/organisms/IngredientManager';
import RecipeGrid from './components/organisms/RecipeGrid';
import NotificationSystem from './components/organisms/NotificationSystem';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
          <NotificationSystem />
          
          {/* Header */}
          <motion.header
            className="bg-white shadow-sm border-b border-gray-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="p-2 bg-primary-100 rounded-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ChefHat className="h-8 w-8 text-primary-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Recipe<span className="text-primary-600">AI</span>
                    </h1>
                    <p className="text-sm text-gray-600">Smart Recipe Recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>AI-Powered • Real-time • 99.9% Uptime</span>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ingredient Manager - Left Sidebar */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Manage Ingredients
                  </h2>
                  <IngredientManager />
                </div>
              </motion.div>

              {/* Recipe Grid - Main Content */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <RecipeGrid />
              </motion.div>
            </div>
          </main>

          {/* Performance Footer */}
          <motion.footer
            className="bg-gray-50 border-t border-gray-200 py-6 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{'<2s'}</p>
                  <p className="text-sm text-gray-600">Page Load Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-600">{'<5s'}</p>
                  <p className="text-sm text-gray-600">Image Processing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-600">{'<1s'}</p>
                  <p className="text-sm text-gray-600">Recipe Search</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <p className="text-sm text-gray-600">Uptime SLA</p>
                </div>
              </div>
              
              <div className="text-center mt-6 text-xs text-gray-500">
                Built with React 18, TypeScript, Redux Toolkit, and Framer Motion • 
                Production-ready architecture with atomic design principles
              </div>
            </div>
          </motion.footer>
        </div>
      </Router>
    </Provider>
  );
}

export default App;