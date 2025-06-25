// Recipe Finder Application
class RecipeFinder {
    constructor() {
        this.recipes = this.getRecipeData();
        this.selectedIngredients = [];
        this.filteredRecipes = [];
        this.currentRecipe = null;
        this.recentSearches = this.loadRecentSearches();
        this.savedRecipes = this.loadSavedRecipes();
        
        this.initializeElements();
        this.bindEvents();
        this.loadRecentSearches();
    }

    // Initialize DOM elements
    initializeElements() {
        this.elements = {
            ingredientInput: document.getElementById('ingredientInput'),
            suggestions: document.getElementById('suggestions'),
            findRecipesBtn: document.getElementById('findRecipesBtn'),
            clearBtn: document.getElementById('clearBtn'),
            selectedIngredients: document.getElementById('selectedIngredients'),
            recentSearches: document.getElementById('recentSearches'),
            recentSearchesList: document.getElementById('recentSearchesList'),
            filtersSection: document.getElementById('filtersSection'),
            cookingTimeFilter: document.getElementById('cookingTimeFilter'),
            difficultyFilter: document.getElementById('difficultyFilter'),
            cuisineFilter: document.getElementById('cuisineFilter'),
            categoryFilter: document.getElementById('categoryFilter'),
            resetFiltersBtn: document.getElementById('resetFiltersBtn'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            resultsSection: document.getElementById('resultsSection'),
            resultsTitle: document.getElementById('resultsTitle'),
            resultsCount: document.getElementById('resultsCount'),
            recipesGrid: document.getElementById('recipesGrid'),
            noResults: document.getElementById('noResults'),
            recipeModal: document.getElementById('recipeModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            printRecipeBtn: document.getElementById('printRecipeBtn'),
            shareRecipeBtn: document.getElementById('shareRecipeBtn'),
            saveRecipeBtn: document.getElementById('saveRecipeBtn'),
            savedRecipesBtn: document.getElementById('savedRecipesBtn'),
            toastContainer: document.getElementById('toastContainer')
        };
    }

    // Bind event listeners
    bindEvents() {
        // Search functionality
        this.elements.ingredientInput.addEventListener('input', this.handleIngredientInput.bind(this));
        this.elements.ingredientInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.elements.findRecipesBtn.addEventListener('click', this.findRecipes.bind(this));
        this.elements.clearBtn.addEventListener('click', this.clearAll.bind(this));

        // Filter functionality
        this.elements.cookingTimeFilter.addEventListener('change', this.applyFilters.bind(this));
        this.elements.difficultyFilter.addEventListener('change', this.applyFilters.bind(this));
        this.elements.cuisineFilter.addEventListener('change', this.applyFilters.bind(this));
        this.elements.categoryFilter.addEventListener('change', this.applyFilters.bind(this));
        this.elements.resetFiltersBtn.addEventListener('click', this.resetFilters.bind(this));

        // Modal functionality
        this.elements.closeModalBtn.addEventListener('click', this.closeModal.bind(this));
        this.elements.recipeModal.addEventListener('click', this.handleModalClick.bind(this));
        this.elements.printRecipeBtn.addEventListener('click', this.printRecipe.bind(this));
        this.elements.shareRecipeBtn.addEventListener('click', this.shareRecipe.bind(this));
        this.elements.saveRecipeBtn.addEventListener('click', this.toggleSaveRecipe.bind(this));
        this.elements.savedRecipesBtn.addEventListener('click', this.showSavedRecipes.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));

        // Click outside to close suggestions
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    // Handle ingredient input with suggestions
    handleIngredientInput(e) {
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            this.showSuggestions(query);
        } else {
            this.hideSuggestions();
        }

        // Handle comma-separated input
        if (query.includes(',')) {
            const ingredients = query.split(',').map(ing => ing.trim()).filter(ing => ing);
            const lastIngredient = ingredients.pop();
            
            ingredients.forEach(ingredient => {
                if (ingredient && !this.selectedIngredients.includes(ingredient.toLowerCase())) {
                    this.addIngredient(ingredient);
                }
            });
            
            e.target.value = lastIngredient || '';
            if (lastIngredient && lastIngredient.length >= 2) {
                this.showSuggestions(lastIngredient);
            } else {
                this.hideSuggestions();
            }
        }
    }

    // Show ingredient suggestions
    showSuggestions(query) {
        const suggestions = this.getIngredientSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.elements.suggestions.innerHTML = suggestions
            .map(ingredient => `
                <div class="suggestion-item" data-ingredient="${ingredient}">
                    ${this.highlightMatch(ingredient, query)}
                </div>
            `).join('');

        this.elements.suggestions.style.display = 'block';
        this.elements.suggestions.setAttribute('aria-hidden', 'false');

        // Add click listeners to suggestions
        this.elements.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.addIngredient(item.dataset.ingredient);
                this.elements.ingredientInput.value = '';
                this.hideSuggestions();
            });
        });
    }

    // Hide suggestions
    hideSuggestions() {
        this.elements.suggestions.style.display = 'none';
        this.elements.suggestions.setAttribute('aria-hidden', 'true');
    }

    // Get ingredient suggestions based on query
    getIngredientSuggestions(query) {
        const allIngredients = new Set();
        
        this.recipes.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => {
                allIngredients.add(ingredient.name.toLowerCase());
            });
        });

        const commonIngredients = [
            'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'eggs',
            'tomatoes', 'onions', 'garlic', 'ginger', 'bell peppers', 'carrots',
            'potatoes', 'spinach', 'broccoli', 'mushrooms', 'lettuce', 'cucumber',
            'rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa',
            'milk', 'cheese', 'butter', 'yogurt', 'cream',
            'olive oil', 'vegetable oil', 'coconut oil',
            'salt', 'pepper', 'paprika', 'cumin', 'oregano', 'basil', 'thyme',
            'lemon', 'lime', 'orange', 'apple', 'banana', 'berries'
        ];

        const combinedIngredients = [...allIngredients, ...commonIngredients];
        const uniqueIngredients = [...new Set(combinedIngredients)];

        return uniqueIngredients
            .filter(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase()) &&
                !this.selectedIngredients.includes(ingredient.toLowerCase())
            )
            .sort((a, b) => {
                const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
                const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.localeCompare(b);
            })
            .slice(0, 8);
    }

    // Highlight matching text in suggestions
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Handle keyboard navigation
    handleKeyDown(e) {
        const suggestions = this.elements.suggestions.querySelectorAll('.suggestion-item');
        const highlighted = this.elements.suggestions.querySelector('.highlighted');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (suggestions.length > 0) {
                    if (highlighted) {
                        highlighted.classList.remove('highlighted');
                        const next = highlighted.nextElementSibling || suggestions[0];
                        next.classList.add('highlighted');
                    } else {
                        suggestions[0].classList.add('highlighted');
                    }
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (suggestions.length > 0) {
                    if (highlighted) {
                        highlighted.classList.remove('highlighted');
                        const prev = highlighted.previousElementSibling || suggestions[suggestions.length - 1];
                        prev.classList.add('highlighted');
                    } else {
                        suggestions[suggestions.length - 1].classList.add('highlighted');
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (highlighted) {
                    this.addIngredient(highlighted.dataset.ingredient);
                    this.elements.ingredientInput.value = '';
                    this.hideSuggestions();
                } else if (e.target.value.trim()) {
                    this.addIngredient(e.target.value.trim());
                    e.target.value = '';
                    this.hideSuggestions();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    // Handle global keyboard shortcuts
    handleGlobalKeyDown(e) {
        if (e.key === 'Escape' && this.elements.recipeModal.style.display !== 'none') {
            this.closeModal();
        }
    }

    // Handle clicks outside suggestions
    handleDocumentClick(e) {
        if (!e.target.closest('.search-input-wrapper')) {
            this.hideSuggestions();
        }
    }

    // Add ingredient to selected list
    addIngredient(ingredient) {
        const normalizedIngredient = ingredient.toLowerCase().trim();
        
        if (!normalizedIngredient || this.selectedIngredients.includes(normalizedIngredient)) {
            return;
        }

        this.selectedIngredients.push(normalizedIngredient);
        this.updateSelectedIngredientsDisplay();
        this.showToast(`Added "${ingredient}" to your ingredients`, 'success');
    }

    // Remove ingredient from selected list
    removeIngredient(ingredient) {
        this.selectedIngredients = this.selectedIngredients.filter(ing => ing !== ingredient);
        this.updateSelectedIngredientsDisplay();
        
        // Re-apply filters if recipes are currently displayed
        if (this.filteredRecipes.length > 0) {
            this.applyFilters();
        }
    }

    // Update selected ingredients display
    updateSelectedIngredientsDisplay() {
        if (this.selectedIngredients.length === 0) {
            this.elements.selectedIngredients.innerHTML = '';
            return;
        }

        this.elements.selectedIngredients.innerHTML = this.selectedIngredients
            .map(ingredient => `
                <div class="ingredient-tag">
                    <span>${ingredient}</span>
                    <button type="button" onclick="recipeFinder.removeIngredient('${ingredient}')" aria-label="Remove ${ingredient}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');
    }

    // Find recipes based on selected ingredients
    async findRecipes() {
        if (this.selectedIngredients.length === 0) {
            this.showToast('Please add some ingredients first', 'warning');
            return;
        }

        // Save search to recent searches
        this.saveRecentSearch(this.selectedIngredients.join(', '));

        // Show loading
        this.showLoading();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Find matching recipes
        this.filteredRecipes = this.findMatchingRecipes(this.selectedIngredients);

        // Hide loading and show results
        this.hideLoading();
        this.showResults();
    }

    // Find matching recipes algorithm
    findMatchingRecipes(selectedIngredients) {
        const matches = this.recipes.map(recipe => {
            const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
            const matchedIngredients = selectedIngredients.filter(ingredient => 
                recipeIngredients.some(recipeIng => 
                    recipeIng.includes(ingredient) || ingredient.includes(recipeIng)
                )
            );
            
            const matchPercentage = (matchedIngredients.length / recipeIngredients.length) * 100;
            
            return {
                ...recipe,
                matchPercentage: Math.round(matchPercentage),
                matchedIngredients,
                missingIngredients: recipeIngredients.filter(recipeIng => 
                    !selectedIngredients.some(ingredient => 
                        recipeIng.includes(ingredient) || ingredient.includes(recipeIng)
                    )
                )
            };
        });

        // Filter recipes with at least one matching ingredient
        return matches
            .filter(recipe => recipe.matchedIngredients.length > 0)
            .sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    // Apply filters to current results
    applyFilters() {
        if (this.filteredRecipes.length === 0) return;

        let filtered = [...this.filteredRecipes];

        // Cooking time filter
        const cookingTime = this.elements.cookingTimeFilter.value;
        if (cookingTime) {
            filtered = filtered.filter(recipe => 
                (recipe.prepTime + recipe.cookTime) <= parseInt(cookingTime)
            );
        }

        // Difficulty filter
        const difficulty = this.elements.difficultyFilter.value;
        if (difficulty) {
            filtered = filtered.filter(recipe => recipe.difficulty === difficulty);
        }

        // Cuisine filter
        const cuisine = this.elements.cuisineFilter.value;
        if (cuisine) {
            filtered = filtered.filter(recipe => recipe.cuisine === cuisine);
        }

        // Category filter
        const category = this.elements.categoryFilter.value;
        if (category) {
            filtered = filtered.filter(recipe => recipe.tags.includes(category));
        }

        this.displayRecipes(filtered);
    }

    // Reset all filters
    resetFilters() {
        this.elements.cookingTimeFilter.value = '';
        this.elements.difficultyFilter.value = '';
        this.elements.cuisineFilter.value = '';
        this.elements.categoryFilter.value = '';
        
        if (this.filteredRecipes.length > 0) {
            this.displayRecipes(this.filteredRecipes);
        }
    }

    // Show loading indicator
    showLoading() {
        this.elements.loadingIndicator.style.display = 'block';
        this.elements.resultsSection.style.display = 'none';
        this.elements.filtersSection.style.display = 'none';
    }

    // Hide loading indicator
    hideLoading() {
        this.elements.loadingIndicator.style.display = 'none';
    }

    // Show results section
    showResults() {
        this.elements.resultsSection.style.display = 'block';
        this.elements.filtersSection.style.display = 'block';
        
        if (this.filteredRecipes.length > 0) {
            this.displayRecipes(this.filteredRecipes);
        } else {
            this.showNoResults();
        }
    }

    // Display recipes in grid
    displayRecipes(recipes) {
        this.elements.resultsTitle.textContent = `Recipe Results (${recipes.length})`;
        this.elements.resultsCount.textContent = `Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} matching your ingredients`;
        
        if (recipes.length === 0) {
            this.showNoResults();
            return;
        }

        this.elements.noResults.style.display = 'none';
        this.elements.recipesGrid.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');

        // Add click listeners to recipe cards
        this.elements.recipesGrid.querySelectorAll('.recipe-card').forEach((card, index) => {
            card.addEventListener('click', () => this.openRecipeModal(recipes[index]));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openRecipeModal(recipes[index]);
                }
            });
        });
    }

    // Create recipe card HTML
    createRecipeCard(recipe) {
        const tagsHtml = recipe.tags.slice(0, 3).map(tag => 
            `<span class="recipe-tag ${tag}">${tag.replace('-', ' ')}</span>`
        ).join('');

        return `
            <div class="recipe-card" tabindex="0" role="button" aria-label="View ${recipe.name} recipe">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" loading="lazy">
                <div class="recipe-match">${recipe.matchPercentage}% match</div>
                <div class="recipe-content">
                    <div class="recipe-header">
                        <h3 class="recipe-title">${recipe.name}</h3>
                        <p class="recipe-description">${recipe.description}</p>
                    </div>
                    <div class="recipe-meta">
                        <div class="recipe-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            <span>${recipe.prepTime + recipe.cookTime} min</span>
                        </div>
                        <div class="recipe-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>${recipe.servings} servings</span>
                        </div>
                        <div class="recipe-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                            </svg>
                            <span>${recipe.difficulty}</span>
                        </div>
                    </div>
                    <div class="recipe-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    // Show no results message
    showNoResults() {
        this.elements.noResults.style.display = 'block';
        this.elements.recipesGrid.innerHTML = '';
        this.elements.resultsCount.textContent = 'No recipes found matching your criteria';
    }

    // Open recipe detail modal
    openRecipeModal(recipe) {
        this.currentRecipe = recipe;
        this.elements.modalTitle.textContent = recipe.name;
        this.elements.modalBody.innerHTML = this.createRecipeDetailHTML(recipe);
        this.elements.recipeModal.style.display = 'flex';
        
        // Update save button state
        const isSaved = this.savedRecipes.includes(recipe.id);
        this.elements.saveRecipeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            ${isSaved ? 'Saved' : 'Save'}
        `;

        // Focus management for accessibility
        this.elements.closeModalBtn.focus();
        
        // Add ingredient checkboxes functionality
        this.addIngredientCheckboxListeners();
    }

    // Create recipe detail HTML
    createRecipeDetailHTML(recipe) {
        const nutritionHtml = recipe.nutrition ? `
            <div class="recipe-section">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                    </svg>
                    Nutrition Information
                </h3>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <h4>Calories</h4>
                        <p>${recipe.nutrition.calories}</p>
                    </div>
                    <div class="nutrition-item">
                        <h4>Protein</h4>
                        <p>${recipe.nutrition.protein}g</p>
                    </div>
                    <div class="nutrition-item">
                        <h4>Carbs</h4>
                        <p>${recipe.nutrition.carbs}g</p>
                    </div>
                    <div class="nutrition-item">
                        <h4>Fat</h4>
                        <p>${recipe.nutrition.fat}g</p>
                    </div>
                    <div class="nutrition-item">
                        <h4>Fiber</h4>
                        <p>${recipe.nutrition.fiber}g</p>
                    </div>
                </div>
            </div>
        ` : '';

        const equipmentHtml = recipe.equipment ? `
            <div class="recipe-section">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/>
                        <line x1="6" y1="7" x2="18" y2="7"/>
                    </svg>
                    Required Equipment
                </h3>
                <div class="equipment-list">
                    ${recipe.equipment.map(item => `<span class="equipment-item">${item}</span>`).join('')}
                </div>
            </div>
        ` : '';

        const tipsHtml = recipe.tips ? `
            <div class="recipe-section">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Cooking Tips
                </h3>
                <ul class="tips-list">
                    ${recipe.tips.map(tip => `
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            ${tip}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';

        return `
            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-image">
            
            <div class="recipe-detail-meta">
                <div class="recipe-detail-meta-item">
                    <h4>Prep Time</h4>
                    <p>${recipe.prepTime} min</p>
                </div>
                <div class="recipe-detail-meta-item">
                    <h4>Cook Time</h4>
                    <p>${recipe.cookTime} min</p>
                </div>
                <div class="recipe-detail-meta-item">
                    <h4>Total Time</h4>
                    <p>${recipe.prepTime + recipe.cookTime} min</p>
                </div>
                <div class="recipe-detail-meta-item">
                    <h4>Servings</h4>
                    <p>${recipe.servings}</p>
                </div>
                <div class="recipe-detail-meta-item">
                    <h4>Difficulty</h4>
                    <p>${recipe.difficulty}</p>
                </div>
                <div class="recipe-detail-meta-item">
                    <h4>Match</h4>
                    <p>${recipe.matchPercentage}%</p>
                </div>
            </div>

            <div class="recipe-section">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                    </svg>
                    Ingredients
                </h3>
                <div class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `
                        <div class="ingredient-item">
                            <input type="checkbox" class="ingredient-checkbox" id="ingredient-${ingredient.name.replace(/\s+/g, '-')}">
                            <label for="ingredient-${ingredient.name.replace(/\s+/g, '-')}" class="ingredient-text">
                                ${ingredient.amount} ${ingredient.unit} ${ingredient.name}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="recipe-section">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Instructions
                </h3>
                <div class="instructions-list">
                    ${recipe.instructions.map(instruction => `
                        <div class="instruction-item">
                            <div class="instruction-text">${instruction}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${equipmentHtml}
            ${nutritionHtml}
            ${tipsHtml}
        `;
    }

    // Add ingredient checkbox listeners
    addIngredientCheckboxListeners() {
        const checkboxes = this.elements.modalBody.querySelectorAll('.ingredient-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const label = e.target.nextElementSibling;
                if (e.target.checked) {
                    label.style.textDecoration = 'line-through';
                    label.style.opacity = '0.6';
                } else {
                    label.style.textDecoration = 'none';
                    label.style.opacity = '1';
                }
            });
        });
    }

    // Close recipe modal
    closeModal() {
        this.elements.recipeModal.style.display = 'none';
        this.currentRecipe = null;
    }

    // Handle modal click (close on overlay click)
    handleModalClick(e) {
        if (e.target === this.elements.recipeModal) {
            this.closeModal();
        }
    }

    // Print recipe
    printRecipe() {
        if (!this.currentRecipe) return;
        
        window.print();
    }

    // Share recipe
    shareRecipe() {
        if (!this.currentRecipe) return;

        if (navigator.share) {
            navigator.share({
                title: this.currentRecipe.name,
                text: this.currentRecipe.description,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            const shareText = `Check out this recipe: ${this.currentRecipe.name}\n${this.currentRecipe.description}\n${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('Recipe link copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Unable to copy link', 'error');
            });
        }
    }

    // Toggle save recipe
    toggleSaveRecipe() {
        if (!this.currentRecipe) return;

        const isSaved = this.savedRecipes.includes(this.currentRecipe.id);
        
        if (isSaved) {
            this.savedRecipes = this.savedRecipes.filter(id => id !== this.currentRecipe.id);
            this.showToast('Recipe removed from saved recipes', 'info');
        } else {
            this.savedRecipes.push(this.currentRecipe.id);
            this.showToast('Recipe saved successfully!', 'success');
        }

        this.saveSavedRecipes();
        
        // Update button state
        this.elements.saveRecipeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="${!isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            ${!isSaved ? 'Saved' : 'Save'}
        `;
    }

    // Show saved recipes
    showSavedRecipes() {
        if (this.savedRecipes.length === 0) {
            this.showToast('No saved recipes yet', 'info');
            return;
        }

        const savedRecipeObjects = this.recipes.filter(recipe => 
            this.savedRecipes.includes(recipe.id)
        );

        this.filteredRecipes = savedRecipeObjects;
        this.elements.resultsSection.style.display = 'block';
        this.elements.filtersSection.style.display = 'none';
        this.displayRecipes(savedRecipeObjects);
        
        // Scroll to results
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Clear all ingredients and results
    clearAll() {
        this.selectedIngredients = [];
        this.filteredRecipes = [];
        this.updateSelectedIngredientsDisplay();
        this.elements.ingredientInput.value = '';
        this.elements.resultsSection.style.display = 'none';
        this.elements.filtersSection.style.display = 'none';
        this.hideSuggestions();
        this.resetFilters();
        this.showToast('All ingredients cleared', 'info');
    }

    // Save recent search
    saveRecentSearch(searchQuery) {
        if (!searchQuery.trim()) return;

        this.recentSearches = this.recentSearches.filter(search => search !== searchQuery);
        this.recentSearches.unshift(searchQuery);
        this.recentSearches = this.recentSearches.slice(0, 5);
        
        localStorage.setItem('recipeFinderRecentSearches', JSON.stringify(this.recentSearches));
        this.displayRecentSearches();
    }

    // Load recent searches from localStorage
    loadRecentSearches() {
        try {
            const saved = localStorage.getItem('recipeFinderRecentSearches');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading recent searches:', error);
            return [];
        }
    }

    // Display recent searches
    displayRecentSearches() {
        if (this.recentSearches.length === 0) {
            this.elements.recentSearches.style.display = 'none';
            return;
        }

        this.elements.recentSearches.style.display = 'block';
        this.elements.recentSearchesList.innerHTML = this.recentSearches
            .map(search => `
                <span class="recent-search-item" onclick="recipeFinder.loadRecentSearch('${search}')">${search}</span>
            `).join('');
    }

    // Load recent search
    loadRecentSearch(searchQuery) {
        const ingredients = searchQuery.split(',').map(ing => ing.trim());
        this.selectedIngredients = ingredients.map(ing => ing.toLowerCase());
        this.updateSelectedIngredientsDisplay();
        this.findRecipes();
    }

    // Save saved recipes to localStorage
    saveSavedRecipes() {
        localStorage.setItem('recipeFinderSavedRecipes', JSON.stringify(this.savedRecipes));
    }

    // Load saved recipes from localStorage
    loadSavedRecipes() {
        try {
            const saved = localStorage.getItem('recipeFinderSavedRecipes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved recipes:', error);
            return [];
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
            warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
            info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
        };

        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${icons[type]}
            </svg>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Get recipe data (mock data for demo)
    getRecipeData() {
        return [
            {
                id: '1',
                name: 'Classic Chicken Stir Fry',
                description: 'A quick and delicious stir fry with tender chicken and crisp vegetables in a savory sauce.',
                image: 'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 10,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Asian',
                tags: ['quick-meals', 'healthy'],
                ingredients: [
                    { name: 'chicken breast', amount: '1', unit: 'lb' },
                    { name: 'bell peppers', amount: '2', unit: 'pieces' },
                    { name: 'onion', amount: '1', unit: 'medium' },
                    { name: 'garlic', amount: '3', unit: 'cloves' },
                    { name: 'ginger', amount: '1', unit: 'tbsp' },
                    { name: 'soy sauce', amount: '3', unit: 'tbsp' },
                    { name: 'vegetable oil', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Cut chicken breast into bite-sized pieces and season with salt and pepper.',
                    'Heat vegetable oil in a large wok or skillet over high heat.',
                    'Add chicken pieces and cook for 3-4 minutes until golden brown.',
                    'Add minced garlic and ginger, stir for 30 seconds until fragrant.',
                    'Add sliced bell peppers and onion, stir-fry for 3-4 minutes until crisp-tender.',
                    'Pour in soy sauce and toss everything together for 1-2 minutes.',
                    'Serve immediately over steamed rice or noodles.'
                ],
                equipment: ['Wok or large skillet', 'Cutting board', 'Sharp knife'],
                nutrition: {
                    calories: 285,
                    protein: 32,
                    carbs: 12,
                    fat: 14,
                    fiber: 3
                },
                tips: [
                    'Cut all ingredients before starting to cook as stir-frying happens quickly.',
                    'Make sure your pan is very hot before adding ingredients for best results.',
                    'Don\'t overcrowd the pan - cook in batches if necessary.'
                ]
            },
            {
                id: '2',
                name: 'Creamy Mushroom Pasta',
                description: 'Rich and indulgent pasta dish with sautéed mushrooms in a creamy garlic sauce.',
                image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 10,
                cookTime: 20,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'Italian',
                tags: ['vegetarian', 'comfort-food'],
                ingredients: [
                    { name: 'pasta', amount: '12', unit: 'oz' },
                    { name: 'mushrooms', amount: '8', unit: 'oz' },
                    { name: 'garlic', amount: '4', unit: 'cloves' },
                    { name: 'butter', amount: '3', unit: 'tbsp' },
                    { name: 'heavy cream', amount: '1', unit: 'cup' },
                    { name: 'parmesan cheese', amount: '1/2', unit: 'cup' },
                    { name: 'white wine', amount: '1/4', unit: 'cup' }
                ],
                instructions: [
                    'Cook pasta according to package directions until al dente. Reserve 1 cup pasta water.',
                    'Slice mushrooms and mince garlic.',
                    'In a large skillet, melt butter over medium-high heat.',
                    'Add mushrooms and cook until golden brown, about 5-6 minutes.',
                    'Add garlic and cook for 1 minute until fragrant.',
                    'Pour in white wine and let it reduce by half.',
                    'Add heavy cream and simmer until slightly thickened.',
                    'Add drained pasta and toss with sauce, adding pasta water as needed.',
                    'Stir in parmesan cheese and season with salt and pepper.',
                    'Serve immediately with extra parmesan.'
                ],
                equipment: ['Large pot', 'Large skillet', 'Colander'],
                nutrition: {
                    calories: 420,
                    protein: 16,
                    carbs: 58,
                    fat: 16,
                    fiber: 4
                },
                tips: [
                    'Don\'t wash mushrooms - just wipe them clean with a damp paper towel.',
                    'Save some pasta water - the starch helps bind the sauce.',
                    'Add pasta water gradually until you reach desired consistency.'
                ]
            },
            {
                id: '3',
                name: 'Mediterranean Quinoa Bowl',
                description: 'Fresh and healthy bowl packed with quinoa, vegetables, and Mediterranean flavors.',
                image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 20,
                cookTime: 15,
                servings: 2,
                difficulty: 'Easy',
                cuisine: 'Mediterranean',
                tags: ['vegan', 'healthy', 'gluten-free'],
                ingredients: [
                    { name: 'quinoa', amount: '1', unit: 'cup' },
                    { name: 'cucumber', amount: '1', unit: 'large' },
                    { name: 'tomatoes', amount: '2', unit: 'medium' },
                    { name: 'red onion', amount: '1/4', unit: 'cup' },
                    { name: 'olives', amount: '1/4', unit: 'cup' },
                    { name: 'olive oil', amount: '3', unit: 'tbsp' },
                    { name: 'lemon juice', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Rinse quinoa under cold water until water runs clear.',
                    'Cook quinoa according to package directions and let cool.',
                    'Dice cucumber, tomatoes, and red onion.',
                    'In a large bowl, combine cooled quinoa with diced vegetables.',
                    'Add olives and fresh herbs if using.',
                    'Whisk together olive oil, lemon juice, salt, and pepper.',
                    'Pour dressing over quinoa mixture and toss well.',
                    'Let sit for 10 minutes to allow flavors to meld.',
                    'Serve chilled or at room temperature.'
                ],
                equipment: ['Medium saucepan', 'Large mixing bowl', 'Whisk'],
                nutrition: {
                    calories: 320,
                    protein: 12,
                    carbs: 45,
                    fat: 12,
                    fiber: 8
                },
                tips: [
                    'Rinse quinoa well to remove bitter coating.',
                    'This bowl tastes even better the next day as flavors develop.',
                    'Add feta cheese or chickpeas for extra protein.'
                ]
            },
            {
                id: '4',
                name: 'Perfect Scrambled Eggs',
                description: 'Creamy, fluffy scrambled eggs cooked low and slow for the perfect texture.',
                image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 2,
                cookTime: 5,
                servings: 2,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian', 'quick-meals'],
                ingredients: [
                    { name: 'eggs', amount: '6', unit: 'large' },
                    { name: 'butter', amount: '2', unit: 'tbsp' },
                    { name: 'milk', amount: '2', unit: 'tbsp' },
                    { name: 'salt', amount: '1/4', unit: 'tsp' },
                    { name: 'pepper', amount: '1/8', unit: 'tsp' }
                ],
                instructions: [
                    'Crack eggs into a bowl and whisk with milk, salt, and pepper.',
                    'Heat butter in a non-stick pan over low-medium heat.',
                    'Pour in egg mixture when butter is melted and foaming.',
                    'Let eggs sit for 20 seconds, then gently stir with a spatula.',
                    'Continue stirring gently every 20 seconds, pushing eggs from edges to center.',
                    'Remove from heat when eggs are still slightly wet - they\'ll continue cooking.',
                    'Serve immediately on warm plates.'
                ],
                equipment: ['Non-stick pan', 'Whisk', 'Rubber spatula'],
                nutrition: {
                    calories: 320,
                    protein: 18,
                    carbs: 2,
                    fat: 26,
                    fiber: 0
                },
                tips: [
                    'Low heat is key - rushing will make eggs tough.',
                    'Remove from heat while slightly underdone.',
                    'Fresh herbs like chives or parsley make a great garnish.'
                ]
            },
            {
                id: '5',
                name: 'Honey Garlic Salmon',
                description: 'Flaky salmon glazed with a sweet and savory honey garlic sauce.',
                image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 10,
                cookTime: 15,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'Asian',
                tags: ['healthy', 'gluten-free'],
                ingredients: [
                    { name: 'salmon fillets', amount: '4', unit: 'pieces' },
                    { name: 'honey', amount: '1/4', unit: 'cup' },
                    { name: 'soy sauce', amount: '3', unit: 'tbsp' },
                    { name: 'garlic', amount: '4', unit: 'cloves' },
                    { name: 'ginger', amount: '1', unit: 'tbsp' },
                    { name: 'olive oil', amount: '2', unit: 'tbsp' },
                    { name: 'lemon juice', amount: '1', unit: 'tbsp' }
                ],
                instructions: [
                    'Pat salmon fillets dry and season with salt and pepper.',
                    'Mix honey, soy sauce, minced garlic, ginger, and lemon juice in a bowl.',
                    'Heat olive oil in a large skillet over medium-high heat.',
                    'Add salmon skin-side up and cook for 4-5 minutes until golden.',
                    'Flip salmon and cook for 3-4 minutes more.',
                    'Pour honey garlic sauce over salmon and let it bubble.',
                    'Spoon sauce over salmon and cook for 1-2 minutes until glazed.',
                    'Serve immediately with steamed vegetables or rice.'
                ],
                equipment: ['Large skillet', 'Small mixing bowl'],
                nutrition: {
                    calories: 280,
                    protein: 25,
                    carbs: 18,
                    fat: 12,
                    fiber: 0
                },
                tips: [
                    'Don\'t move salmon once placed in pan - let it develop a crust.',
                    'Salmon is done when it flakes easily with a fork.',
                    'Garnish with sesame seeds and green onions for extra flavor.'
                ]
            },
            {
                id: '6',
                name: 'Classic Caesar Salad',
                description: 'Crisp romaine lettuce with homemade Caesar dressing, croutons, and parmesan.',
                image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 10,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'American',
                tags: ['vegetarian'],
                ingredients: [
                    { name: 'romaine lettuce', amount: '2', unit: 'heads' },
                    { name: 'parmesan cheese', amount: '1/2', unit: 'cup' },
                    { name: 'bread', amount: '4', unit: 'slices' },
                    { name: 'garlic', amount: '3', unit: 'cloves' },
                    { name: 'mayonnaise', amount: '1/3', unit: 'cup' },
                    { name: 'lemon juice', amount: '2', unit: 'tbsp' },
                    { name: 'olive oil', amount: '1/4', unit: 'cup' }
                ],
                instructions: [
                    'Cut bread into cubes and toss with olive oil and minced garlic.',
                    'Bake croutons at 375°F for 10 minutes until golden.',
                    'Wash and chop romaine lettuce into bite-sized pieces.',
                    'For dressing, whisk together mayonnaise, lemon juice, minced garlic.',
                    'Slowly whisk in olive oil until emulsified.',
                    'Season dressing with salt, pepper, and worcestershire sauce.',
                    'Toss lettuce with dressing until well coated.',
                    'Top with croutons and grated parmesan cheese.',
                    'Serve immediately.'
                ],
                equipment: ['Baking sheet', 'Large salad bowl', 'Whisk'],
                nutrition: {
                    calories: 220,
                    protein: 8,
                    carbs: 15,
                    fat: 16,
                    fiber: 4
                },
                tips: [
                    'Make croutons fresh for best texture.',
                    'Dry lettuce thoroughly after washing.',
                    'Add dressing gradually - you may not need it all.'
                ]
            },
            {
                id: '7',
                name: 'Beef Tacos',
                description: 'Seasoned ground beef in soft tortillas with fresh toppings and lime.',
                image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 15,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Mexican',
                tags: ['quick-meals'],
                ingredients: [
                    { name: 'ground beef', amount: '1', unit: 'lb' },
                    { name: 'tortillas', amount: '8', unit: 'small' },
                    { name: 'onion', amount: '1', unit: 'medium' },
                    { name: 'garlic', amount: '2', unit: 'cloves' },
                    { name: 'tomatoes', amount: '2', unit: 'medium' },
                    { name: 'lettuce', amount: '2', unit: 'cups' },
                    { name: 'cheese', amount: '1', unit: 'cup' }
                ],
                instructions: [
                    'Heat a large skillet over medium-high heat.',
                    'Add ground beef and cook, breaking it up, until browned.',
                    'Add diced onion and garlic, cook until softened.',
                    'Season with cumin, chili powder, salt, and pepper.',
                    'Warm tortillas in a dry skillet or microwave.',
                    'Dice tomatoes and shred lettuce.',
                    'Fill tortillas with beef mixture.',
                    'Top with tomatoes, lettuce, cheese, and any desired toppings.',
                    'Serve with lime wedges and hot sauce.'
                ],
                equipment: ['Large skillet', 'Small skillet for tortillas'],
                nutrition: {
                    calories: 380,
                    protein: 22,
                    carbs: 28,
                    fat: 20,
                    fiber: 4
                },
                tips: [
                    'Drain excess fat from beef for healthier tacos.',
                    'Warm tortillas for better flavor and flexibility.',
                    'Set up a taco bar so everyone can customize their own.'
                ]
            },
            {
                id: '8',
                name: 'Vegetable Curry',
                description: 'Aromatic and flavorful curry with mixed vegetables in coconut milk.',
                image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 20,
                cookTime: 25,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'Indian',
                tags: ['vegan', 'healthy'],
                ingredients: [
                    { name: 'potatoes', amount: '2', unit: 'medium' },
                    { name: 'carrots', amount: '2', unit: 'large' },
                    { name: 'bell peppers', amount: '1', unit: 'piece' },
                    { name: 'onion', amount: '1', unit: 'large' },
                    { name: 'garlic', amount: '4', unit: 'cloves' },
                    { name: 'ginger', amount: '2', unit: 'tbsp' },
                    { name: 'coconut milk', amount: '1', unit: 'can' }
                ],
                instructions: [
                    'Dice potatoes, carrots, bell pepper, and onion.',
                    'Heat oil in a large pot over medium heat.',
                    'Add onion and cook until softened, about 5 minutes.',
                    'Add garlic, ginger, and curry spices, cook for 1 minute.',
                    'Add potatoes and carrots, stir to coat with spices.',
                    'Pour in coconut milk and bring to a simmer.',
                    'Cover and cook for 15 minutes until vegetables are tender.',
                    'Add bell pepper and cook for 5 minutes more.',
                    'Season with salt and serve over rice.'
                ],
                equipment: ['Large pot', 'Cutting board', 'Sharp knife'],
                nutrition: {
                    calories: 280,
                    protein: 6,
                    carbs: 35,
                    fat: 14,
                    fiber: 8
                },
                tips: [
                    'Cut vegetables into similar sizes for even cooking.',
                    'Toast spices briefly to enhance their flavor.',
                    'Adjust consistency with water or more coconut milk as needed.'
                ]
            },
            {
                id: '9',
                name: 'Chocolate Chip Cookies',
                description: 'Classic chewy chocolate chip cookies that are crispy on the edges.',
                image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 12,
                servings: 24,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian'],
                ingredients: [
                    { name: 'flour', amount: '2 1/4', unit: 'cups' },
                    { name: 'butter', amount: '1', unit: 'cup' },
                    { name: 'brown sugar', amount: '3/4', unit: 'cup' },
                    { name: 'white sugar', amount: '3/4', unit: 'cup' },
                    { name: 'eggs', amount: '2', unit: 'large' },
                    { name: 'vanilla', amount: '2', unit: 'tsp' },
                    { name: 'chocolate chips', amount: '2', unit: 'cups' }
                ],
                instructions: [
                    'Preheat oven to 375°F (190°C).',
                    'Cream together softened butter and both sugars until fluffy.',
                    'Beat in eggs one at a time, then vanilla.',
                    'In a separate bowl, whisk together flour, baking soda, and salt.',
                    'Gradually mix dry ingredients into wet ingredients.',
                    'Stir in chocolate chips.',
                    'Drop rounded tablespoons of dough onto ungreased baking sheets.',
                    'Bake for 9-11 minutes until golden brown.',
                    'Cool on baking sheet for 5 minutes before transferring to wire rack.'
                ],
                equipment: ['Electric mixer', 'Baking sheets', 'Wire cooling racks'],
                nutrition: {
                    calories: 180,
                    protein: 2,
                    carbs: 26,
                    fat: 8,
                    fiber: 1
                },
                tips: [
                    'Don\'t overbake - cookies will continue cooking on hot pan.',
                    'Room temperature ingredients mix better.',
                    'Chill dough for 30 minutes for thicker cookies.'
                ]
            },
            {
                id: '10',
                name: 'Greek Salad',
                description: 'Fresh Mediterranean salad with tomatoes, cucumber, olives, and feta cheese.',
                image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 0,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Mediterranean',
                tags: ['vegetarian', 'healthy', 'gluten-free'],
                ingredients: [
                    { name: 'tomatoes', amount: '4', unit: 'large' },
                    { name: 'cucumber', amount: '1', unit: 'large' },
                    { name: 'red onion', amount: '1/2', unit: 'medium' },
                    { name: 'olives', amount: '1/2', unit: 'cup' },
                    { name: 'feta cheese', amount: '4', unit: 'oz' },
                    { name: 'olive oil', amount: '1/4', unit: 'cup' },
                    { name: 'lemon juice', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Cut tomatoes into wedges and cucumber into thick slices.',
                    'Thinly slice red onion.',
                    'Combine tomatoes, cucumber, and onion in a large bowl.',
                    'Add olives and crumbled feta cheese.',
                    'Whisk together olive oil, lemon juice, oregano, salt, and pepper.',
                    'Pour dressing over salad and toss gently.',
                    'Let sit for 10 minutes to allow flavors to meld.',
                    'Serve at room temperature or chilled.'
                ],
                equipment: ['Large salad bowl', 'Sharp knife', 'Whisk'],
                nutrition: {
                    calories: 200,
                    protein: 6,
                    carbs: 12,
                    fat: 16,
                    fiber: 4
                },
                tips: [
                    'Use the ripest tomatoes you can find for best flavor.',
                    'Don\'t overdress - the vegetables should shine.',
                    'This salad tastes better after sitting for a while.'
                ]
            },
            {
                id: '11',
                name: 'Pancakes',
                description: 'Fluffy buttermilk pancakes perfect for weekend breakfast.',
                image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 10,
                cookTime: 15,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian', 'quick-meals'],
                ingredients: [
                    { name: 'flour', amount: '2', unit: 'cups' },
                    { name: 'milk', amount: '1 3/4', unit: 'cups' },
                    { name: 'eggs', amount: '2', unit: 'large' },
                    { name: 'butter', amount: '1/4', unit: 'cup' },
                    { name: 'sugar', amount: '2', unit: 'tbsp' },
                    { name: 'baking powder', amount: '2', unit: 'tsp' },
                    { name: 'salt', amount: '1', unit: 'tsp' }
                ],
                instructions: [
                    'In a large bowl, whisk together flour, sugar, baking powder, and salt.',
                    'In another bowl, whisk together milk, eggs, and melted butter.',
                    'Pour wet ingredients into dry ingredients and stir until just combined.',
                    'Don\'t overmix - lumps are okay.',
                    'Heat a griddle or large skillet over medium heat.',
                    'Pour 1/4 cup batter for each pancake onto hot griddle.',
                    'Cook until bubbles form on surface, then flip.',
                    'Cook until golden brown on both sides.',
                    'Serve hot with butter and syrup.'
                ],
                equipment: ['Large mixing bowls', 'Whisk', 'Griddle or large skillet'],
                nutrition: {
                    calories: 280,
                    protein: 8,
                    carbs: 42,
                    fat: 9,
                    fiber: 2
                },
                tips: [
                    'Don\'t overmix the batter - this makes tough pancakes.',
                    'Let batter rest for 5 minutes before cooking.',
                    'Keep cooked pancakes warm in a 200°F oven.'
                ]
            },
            {
                id: '12',
                name: 'Chicken Soup',
                description: 'Comforting homemade chicken soup with vegetables and noodles.',
                image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 20,
                cookTime: 45,
                servings: 6,
                difficulty: 'Medium',
                cuisine: 'American',
                tags: ['comfort-food', 'healthy'],
                ingredients: [
                    { name: 'chicken breast', amount: '1', unit: 'lb' },
                    { name: 'carrots', amount: '3', unit: 'large' },
                    { name: 'celery', amount: '3', unit: 'stalks' },
                    { name: 'onion', amount: '1', unit: 'large' },
                    { name: 'garlic', amount: '3', unit: 'cloves' },
                    { name: 'chicken broth', amount: '8', unit: 'cups' },
                    { name: 'egg noodles', amount: '2', unit: 'cups' }
                ],
                instructions: [
                    'In a large pot, bring chicken broth to a boil.',
                    'Add chicken breast and simmer for 20 minutes until cooked through.',
                    'Remove chicken and shred when cool enough to handle.',
                    'Dice carrots, celery, and onion.',
                    'Add vegetables to the broth and simmer for 15 minutes.',
                    'Add egg noodles and cook according to package directions.',
                    'Return shredded chicken to pot.',
                    'Season with salt, pepper, and herbs.',
                    'Simmer for 5 more minutes and serve hot.'
                ],
                equipment: ['Large pot', 'Ladle', 'Cutting board'],
                nutrition: {
                    calories: 220,
                    protein: 20,
                    carbs: 18,
                    fat: 8,
                    fiber: 3
                },
                tips: [
                    'Skim foam from surface while cooking for clearer broth.',
                    'Don\'t overcook noodles - they\'ll continue cooking in hot soup.',
                    'This soup freezes well without the noodles.'
                ]
            },
            {
                id: '13',
                name: 'Margherita Pizza',
                description: 'Classic Italian pizza with tomato sauce, mozzarella, and fresh basil.',
                image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 30,
                cookTime: 15,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'Italian',
                tags: ['vegetarian'],
                ingredients: [
                    { name: 'pizza dough', amount: '1', unit: 'lb' },
                    { name: 'tomatoes', amount: '1', unit: 'can' },
                    { name: 'mozzarella cheese', amount: '8', unit: 'oz' },
                    { name: 'basil', amount: '1/4', unit: 'cup' },
                    { name: 'garlic', amount: '2', unit: 'cloves' },
                    { name: 'olive oil', amount: '2', unit: 'tbsp' },
                    { name: 'salt', amount: '1', unit: 'tsp' }
                ],
                instructions: [
                    'Preheat oven to 475°F (245°C).',
                    'Roll out pizza dough on a floured surface.',
                    'Transfer to a pizza stone or baking sheet.',
                    'Crush tomatoes with garlic, salt, and a pinch of sugar for sauce.',
                    'Spread sauce evenly over dough, leaving a border for crust.',
                    'Tear mozzarella into pieces and distribute over sauce.',
                    'Drizzle with olive oil.',
                    'Bake for 12-15 minutes until crust is golden and cheese is bubbly.',
                    'Top with fresh basil leaves before serving.'
                ],
                equipment: ['Pizza stone or baking sheet', 'Rolling pin'],
                nutrition: {
                    calories: 320,
                    protein: 14,
                    carbs: 38,
                    fat: 12,
                    fiber: 2
                },
                tips: [
                    'Use a pizza stone for crispier crust.',
                    'Don\'t overload with toppings - less is more.',
                    'Let dough come to room temperature before rolling.'
                ]
            },
            {
                id: '14',
                name: 'Banana Bread',
                description: 'Moist and flavorful banana bread made with overripe bananas.',
                image: 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 60,
                servings: 12,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian'],
                ingredients: [
                    { name: 'bananas', amount: '3', unit: 'large ripe' },
                    { name: 'flour', amount: '1 3/4', unit: 'cups' },
                    { name: 'butter', amount: '1/3', unit: 'cup' },
                    { name: 'sugar', amount: '3/4', unit: 'cup' },
                    { name: 'eggs', amount: '1', unit: 'large' },
                    { name: 'vanilla', amount: '1', unit: 'tsp' },
                    { name: 'baking soda', amount: '1', unit: 'tsp' }
                ],
                instructions: [
                    'Preheat oven to 350°F (175°C). Grease a 9x5 inch loaf pan.',
                    'Mash bananas in a large bowl until smooth.',
                    'Mix in melted butter, sugar, egg, and vanilla.',
                    'In a separate bowl, whisk together flour, baking soda, and salt.',
                    'Add dry ingredients to banana mixture and stir until just combined.',
                    'Pour batter into prepared loaf pan.',
                    'Bake for 55-65 minutes until a toothpick comes out clean.',
                    'Cool in pan for 10 minutes, then turn out onto wire rack.',
                    'Cool completely before slicing.'
                ],
                equipment: ['9x5 inch loaf pan', 'Large mixing bowl', 'Wire rack'],
                nutrition: {
                    calories: 180,
                    protein: 3,
                    carbs: 32,
                    fat: 5,
                    fiber: 2
                },
                tips: [
                    'Use very ripe bananas with brown spots for best flavor.',
                    'Don\'t overmix the batter to keep bread tender.',
                    'Wrap cooled bread tightly - it gets better after a day.'
                ]
            },
            {
                id: '15',
                name: 'Chicken Caesar Wrap',
                description: 'Grilled chicken and crisp romaine lettuce with Caesar dressing in a tortilla.',
                image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 10,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['quick-meals'],
                ingredients: [
                    { name: 'chicken breast', amount: '1', unit: 'lb' },
                    { name: 'tortillas', amount: '4', unit: 'large' },
                    { name: 'romaine lettuce', amount: '4', unit: 'cups' },
                    { name: 'parmesan cheese', amount: '1/2', unit: 'cup' },
                    { name: 'caesar dressing', amount: '1/4', unit: 'cup' },
                    { name: 'croutons', amount: '1', unit: 'cup' },
                    { name: 'olive oil', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Season chicken breast with salt, pepper, and garlic powder.',
                    'Heat olive oil in a skillet over medium-high heat.',
                    'Cook chicken for 6-7 minutes per side until cooked through.',
                    'Let chicken rest for 5 minutes, then slice into strips.',
                    'Chop romaine lettuce into bite-sized pieces.',
                    'Warm tortillas in microwave for 30 seconds.',
                    'Spread Caesar dressing on each tortilla.',
                    'Add lettuce, chicken strips, croutons, and parmesan.',
                    'Roll up tightly and cut in half to serve.'
                ],
                equipment: ['Large skillet', 'Cutting board', 'Sharp knife'],
                nutrition: {
                    calories: 380,
                    protein: 28,
                    carbs: 32,
                    fat: 16,
                    fiber: 3
                },
                tips: [
                    'Don\'t overfill wraps or they\'ll be hard to roll.',
                    'Warm tortillas make them more pliable.',
                    'Serve immediately to prevent wraps from getting soggy.'
                ]
            },
            {
                id: '16',
                name: 'Beef Stir Fry',
                description: 'Tender beef strips with colorful vegetables in a savory stir fry sauce.',
                image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 20,
                cookTime: 10,
                servings: 4,
                difficulty: 'Medium',
                cuisine: 'Asian',
                tags: ['quick-meals', 'healthy'],
                ingredients: [
                    { name: 'beef sirloin', amount: '1', unit: 'lb' },
                    { name: 'broccoli', amount: '2', unit: 'cups' },
                    { name: 'bell peppers', amount: '2', unit: 'pieces' },
                    { name: 'onion', amount: '1', unit: 'medium' },
                    { name: 'garlic', amount: '3', unit: 'cloves' },
                    { name: 'soy sauce', amount: '3', unit: 'tbsp' },
                    { name: 'vegetable oil', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Slice beef against the grain into thin strips.',
                    'Cut broccoli into florets, slice bell peppers and onion.',
                    'Heat oil in a large wok or skillet over high heat.',
                    'Add beef and stir-fry for 2-3 minutes until browned.',
                    'Remove beef and set aside.',
                    'Add vegetables to pan and stir-fry for 3-4 minutes.',
                    'Return beef to pan and add garlic.',
                    'Pour in soy sauce and stir everything together.',
                    'Cook for 1-2 minutes more and serve over rice.'
                ],
                equipment: ['Wok or large skillet', 'Sharp knife', 'Cutting board'],
                nutrition: {
                    calories: 280,
                    protein: 26,
                    carbs: 12,
                    fat: 14,
                    fiber: 4
                },
                tips: [
                    'Cut beef against the grain for tenderness.',
                    'Have all ingredients prepped before you start cooking.',
                    'Keep heat high for proper stir-frying.'
                ]
            },
            {
                id: '17',
                name: 'Caprese Salad',
                description: 'Simple Italian salad with fresh tomatoes, mozzarella, and basil.',
                image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 10,
                cookTime: 0,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Italian',
                tags: ['vegetarian', 'healthy', 'gluten-free'],
                ingredients: [
                    { name: 'tomatoes', amount: '4', unit: 'large' },
                    { name: 'mozzarella cheese', amount: '8', unit: 'oz' },
                    { name: 'basil', amount: '1/4', unit: 'cup' },
                    { name: 'olive oil', amount: '3', unit: 'tbsp' },
                    { name: 'balsamic vinegar', amount: '2', unit: 'tbsp' },
                    { name: 'salt', amount: '1/2', unit: 'tsp' },
                    { name: 'pepper', amount: '1/4', unit: 'tsp' }
                ],
                instructions: [
                    'Slice tomatoes and mozzarella into 1/4-inch thick rounds.',
                    'Arrange alternating slices of tomato and mozzarella on a platter.',
                    'Tuck fresh basil leaves between the slices.',
                    'Drizzle with olive oil and balsamic vinegar.',
                    'Season with salt and freshly ground black pepper.',
                    'Let sit for 10 minutes to allow flavors to meld.',
                    'Serve at room temperature.'
                ],
                equipment: ['Sharp knife', 'Serving platter'],
                nutrition: {
                    calories: 180,
                    protein: 12,
                    carbs: 8,
                    fat: 12,
                    fiber: 2
                },
                tips: [
                    'Use the ripest tomatoes and freshest mozzarella you can find.',
                    'Room temperature ingredients taste better than cold.',
                    'A drizzle of good balsamic vinegar makes all the difference.'
                ]
            },
            {
                id: '18',
                name: 'French Toast',
                description: 'Classic French toast made with thick bread slices and cinnamon.',
                image: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 10,
                cookTime: 15,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian', 'quick-meals'],
                ingredients: [
                    { name: 'bread', amount: '8', unit: 'thick slices' },
                    { name: 'eggs', amount: '4', unit: 'large' },
                    { name: 'milk', amount: '1/2', unit: 'cup' },
                    { name: 'vanilla', amount: '1', unit: 'tsp' },
                    { name: 'cinnamon', amount: '1/2', unit: 'tsp' },
                    { name: 'butter', amount: '2', unit: 'tbsp' },
                    { name: 'sugar', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'In a shallow dish, whisk together eggs, milk, vanilla, cinnamon, and sugar.',
                    'Heat butter in a large skillet over medium heat.',
                    'Dip each slice of bread in egg mixture, coating both sides.',
                    'Cook bread slices for 2-3 minutes per side until golden brown.',
                    'Transfer to a warm plate and keep warm in low oven.',
                    'Repeat with remaining slices.',
                    'Serve hot with butter and maple syrup.',
                    'Dust with powdered sugar if desired.'
                ],
                equipment: ['Shallow dish', 'Large skillet', 'Whisk'],
                nutrition: {
                    calories: 280,
                    protein: 12,
                    carbs: 32,
                    fat: 12,
                    fiber: 2
                },
                tips: [
                    'Use day-old bread for best texture - it absorbs custard better.',
                    'Don\'t soak bread too long or it will fall apart.',
                    'Keep cooked slices warm in a 200°F oven.'
                ]
            },
            {
                id: '19',
                name: 'Chicken Quesadilla',
                description: 'Crispy tortilla filled with seasoned chicken and melted cheese.',
                image: 'https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 10,
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Mexican',
                tags: ['quick-meals'],
                ingredients: [
                    { name: 'chicken breast', amount: '1', unit: 'lb' },
                    { name: 'tortillas', amount: '4', unit: 'large' },
                    { name: 'cheese', amount: '2', unit: 'cups' },
                    { name: 'bell peppers', amount: '1', unit: 'piece' },
                    { name: 'onion', amount: '1/2', unit: 'medium' },
                    { name: 'garlic', amount: '2', unit: 'cloves' },
                    { name: 'olive oil', amount: '2', unit: 'tbsp' }
                ],
                instructions: [
                    'Season chicken with salt, pepper, cumin, and chili powder.',
                    'Cook chicken in olive oil until done, then dice.',
                    'Sauté diced bell pepper and onion until softened.',
                    'Place filling on half of each tortilla.',
                    'Top with cheese and fold tortilla over.',
                    'Cook in a dry skillet for 2-3 minutes per side until crispy.',
                    'Cut into wedges and serve hot.',
                    'Serve with salsa, sour cream, and guacamole.'
                ],
                equipment: ['Large skillet', 'Spatula', 'Pizza cutter'],
                nutrition: {
                    calories: 420,
                    protein: 28,
                    carbs: 28,
                    fat: 22,
                    fiber: 3
                },
                tips: [
                    'Don\'t overfill quesadillas or cheese will leak out.',
                    'Use a combination of cheeses for better flavor.',
                    'Press down gently while cooking for even browning.'
                ]
            },
            {
                id: '20',
                name: 'Chocolate Brownies',
                description: 'Rich, fudgy brownies with a crackly top and dense chocolate flavor.',
                image: 'https://images.pexels.com/photos/887853/pexels-photo-887853.jpeg?auto=compress&cs=tinysrgb&w=500',
                prepTime: 15,
                cookTime: 30,
                servings: 16,
                difficulty: 'Easy',
                cuisine: 'American',
                tags: ['vegetarian'],
                ingredients: [
                    { name: 'chocolate', amount: '4', unit: 'oz' },
                    { name: 'butter', amount: '1/2', unit: 'cup' },
                    { name: 'sugar', amount: '1', unit: 'cup' },
                    { name: 'eggs', amount: '2', unit: 'large' },
                    { name: 'flour', amount: '1/2', unit: 'cup' },
                    { name: 'cocoa powder', amount: '1/4', unit: 'cup' },
                    { name: 'vanilla', amount: '1', unit: 'tsp' }
                ],
                instructions: [
                    'Preheat oven to 350°F (175°C). Grease an 8x8 inch pan.',
                    'Melt chocolate and butter together in microwave or double boiler.',
                    'Stir in sugar until combined.',
                    'Beat in eggs one at a time, then vanilla.',
                    'Sift together flour, cocoa powder, and salt.',
                    'Fold dry ingredients into chocolate mixture until just combined.',
                    'Pour into prepared pan and spread evenly.',
                    'Bake for 25-30 minutes until a toothpick comes out with moist crumbs.',
                    'Cool completely before cutting.'
                ],
                equipment: ['8x8 inch baking pan', 'Double boiler or microwave', 'Sifter'],
                nutrition: {
                    calories: 160,
                    protein: 3,
                    carbs: 22,
                    fat: 8,
                    fiber: 2
                },
                tips: [
                    'Don\'t overbake - brownies should be slightly underdone.',
                    'Use good quality chocolate for best flavor.',
                    'Cool completely before cutting for clean edges.'
                ]
            }
        ];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.recipeFinder = new RecipeFinder();
});