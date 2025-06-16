import sqlite3
import joblib
import gzip
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score
from tqdm import tqdm
import pandas as pd
import matplotlib.pyplot as plt

def ingredient_tokenizer(text):
    """Tokenize ingredients by splitting on commas and stripping whitespace"""
    if not text or not isinstance(text, str):
        return []
    return [ingredient.strip() for ingredient in text.split(',')]

class RecipeModelEvaluator:
    def __init__(self, db_path, model_path):
        self.db_path = db_path
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.recipe_ids = []
        self.all_recipe_ids = []
        
    def load_model(self):
        """Load the trained model with tokenizer workaround"""
        # Register tokenizer before loading
        import sys
        sys.modules['__main__'].ingredient_tokenizer = ingredient_tokenizer
        
        with gzip.open(self.model_path, 'rb') as f:
            model_data = joblib.load(f)
        return model_data['model'], model_data['vectorizer'], model_data['recipe_ids']
    
    def load_all_recipe_ids(self):
        """Load all recipe IDs from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM recipes")
        self.all_recipe_ids = [row[0] for row in cursor.fetchall()]
        conn.close()
    
    def create_test_set(self, test_size=0.2):
        """Create a test set by holding out some recipes"""
        self.load_all_recipe_ids()
        train_ids, test_ids = train_test_split(
            self.all_recipe_ids, 
            test_size=test_size, 
            random_state=42
        )
        return train_ids, test_ids
    
    def evaluate(self, k=5, test_size=0.2, sample_size=500):
        """Evaluate model performance with various metrics"""
        # Load model
        self.model, self.vectorizer, self.recipe_ids = self.load_model()
        
        # Create test set
        train_ids, test_ids = self.create_test_set(test_size)
        
        # Connect to database
        conn = sqlite3.connect(self.db_path)
        
        # Sample test recipes
        if len(test_ids) > sample_size:
            test_ids = np.random.choice(test_ids, sample_size, replace=False)
        
        # Initialize metrics
        precision_sum = 0
        recall_sum = 0
        reciprocal_rank_sum = 0
        coverage_count = 0
        
        print(f"Evaluating on {len(test_ids)} test recipes...")
        
        for recipe_id in tqdm(test_ids):
            # Get test recipe details
            cursor = conn.execute(
                "SELECT ingredients FROM recipes WHERE id=?", 
                (recipe_id,)
            )
            ingredients = cursor.fetchone()[0]
            
            # Transform input
            input_vec = self.vectorizer.transform([ingredients])
            
            # Get recommendations
            distances, indices = self.model.kneighbors(input_vec, n_neighbors=k)
            
            # Get recommended recipe IDs
            recommended_ids = [self.recipe_ids[i] for i in indices[0]]
            
            # Calculate metrics
            # Relevance: Only the test recipe is considered relevant
            relevant = [recipe_id]
            
            # Precision@k
            true_positives = len(set(recommended_ids) & set(relevant))
            precision = true_positives / k
            precision_sum += precision
            
            # Recall@k
            recall = true_positives / len(relevant)
            recall_sum += recall
            
            # Reciprocal Rank
            for rank, rec_id in enumerate(recommended_ids, 1):
                if rec_id in relevant:
                    reciprocal_rank_sum += 1 / rank
                    break
            
            # Coverage
            coverage_count += len(set(recommended_ids))
        
        # Calculate final metrics
        precision_avg = precision_sum / len(test_ids)
        recall_avg = recall_sum / len(test_ids)
        mrr = reciprocal_rank_sum / len(test_ids)
        
        # Coverage = unique recommended items / total items
        coverage = coverage_count / len(self.all_recipe_ids)
        
        # Print results
        print("\nEvaluation Results:")
        print(f"Precision@{k}: {precision_avg:.4f}")
        print(f"Recall@{k}: {recall_avg:.4f}")
        print(f"Mean Reciprocal Rank (MRR): {mrr:.4f}")
        print(f"Coverage: {coverage:.4f}")
        
        # Plot metrics
        self.plot_metrics(precision_avg, recall_avg, mrr, coverage, k)
        
        return {
            f"precision@{k}": precision_avg,
            f"recall@{k}": recall_avg,
            "mrr": mrr,
            "coverage": coverage
        }
    
    def plot_metrics(self, precision, recall, mrr, coverage, k):
        """Visualize evaluation metrics"""
        metrics = ['Precision', 'Recall', 'MRR', 'Coverage']
        values = [precision, recall, mrr, coverage]
        
        plt.figure(figsize=(10, 6))
        bars = plt.bar(metrics, values, color=['blue', 'green', 'orange', 'purple'])
        
        plt.title(f'Model Evaluation Metrics (k={k})')
        plt.ylabel('Score')
        plt.ylim(0, 1)
        
        # Add values on top of bars
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.4f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig('model_evaluation.png')
        plt.show()
    
    def test_recommendations(self, test_ingredients, k=5):
        """Test specific recommendations"""
        if not self.model or not self.vectorizer:
            self.model, self.vectorizer, self.recipe_ids = self.load_model()
        
        # Transform input
        input_vec = self.vectorizer.transform([test_ingredients])
        
        # Find nearest neighbors
        distances, indices = self.model.kneighbors(input_vec, n_neighbors=k)
        
        # Get recipe details
        conn = sqlite3.connect(self.db_path)
        results = []
        
        for i, dist in zip(indices[0], distances[0]):
            recipe_id = self.recipe_ids[i]
            cursor = conn.execute(
                "SELECT title, ingredients, directions FROM recipes WHERE id=?", 
                (recipe_id,)
            )
            title, ingredients, directions = cursor.fetchone()
            results.append({
                'id': recipe_id,
                'title': title,
                'ingredients': ingredients,
                'directions': directions,
                'distance': dist
            })
        
        conn.close()
        return results

if __name__ == "__main__":
    # Configuration - update these paths
    db_path = "processed_data/recipes.db"
    model_path = "recipe_model.pkl.gz"
    
    # Initialize evaluator
    evaluator = RecipeModelEvaluator(db_path, model_path)
    
    # Evaluate the model
    metrics = evaluator.evaluate(k=5, test_size=0.2, sample_size=1000)
    
    # Test specific recommendations
    test_ingredients = "chicken, rice, garlic, onion"
    print(f"\nTesting recommendations for: {test_ingredients}")
    results = evaluator.test_recommendations(test_ingredients, k=3)
    
    print("\nTop recommendations:")
    for i, recipe in enumerate(results):
        print(f"\n{i+1}. {recipe['title']} (Distance: {recipe['distance']:.4f})")
        print(f"Ingredients: {recipe['ingredients']}")
        print(f"Directions: {recipe['directions'][:100]}...")