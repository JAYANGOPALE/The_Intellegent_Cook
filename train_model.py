import sqlite3
import joblib
import gzip
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from tqdm import tqdm
import os

# Define tokenizer function in the same script
def ingredient_tokenizer(text):
    if not text or not isinstance(text, str):
        return []
    return [ingredient.strip() for ingredient in text.split(',')]

class RecipeModelTrainer:
    def __init__(self, db_path, index_path):
        self.db_path = db_path
        self.index_path = index_path
        self.model = None
        self.vectorizer = None
        self.recipe_ids = []
        
    def load_data(self):
        conn = sqlite3.connect(self.db_path)
        query = "SELECT id, ingredients FROM recipes"
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df
    
    def load_vectorizer(self):
        # Register tokenizer before loading
        import sys
        sys.modules['__main__'].ingredient_tokenizer = ingredient_tokenizer
        
        with gzip.open(self.index_path, 'rb') as f:
            return joblib.load(f)
    
    def train_model(self, n_neighbors=10):
        print("Loading data...")
        df = self.load_data()
        self.recipe_ids = df['id'].tolist()
        
        print("Loading vectorizer...")
        self.vectorizer = self.load_vectorizer()
        
        print("Transforming ingredients to vectors...")
        # Use HashingVectorizer for memory efficiency
        from sklearn.feature_extraction.text import HashingVectorizer
        
        # Create a new vectorizer compatible with the preprocessed data
        self.vectorizer = HashingVectorizer(
            n_features=10000,
            alternate_sign=False,
            tokenizer=ingredient_tokenizer,
            token_pattern=None
        )
        
        # Transform in batches
        batch_size = 10000
        vectors = []
        
        for i in tqdm(range(0, len(df), batch_size), desc="Vectorizing"):
            batch = df['ingredients'].iloc[i:i+batch_size]
            batch_vectors = self.vectorizer.transform(batch)
            vectors.append(batch_vectors)
        
        X = np.vstack([v.toarray() for v in vectors]) if vectors else np.array([])
        
        print(f"Training model on {X.shape[0]} recipes...")
        self.model = NearestNeighbors(
            n_neighbors=n_neighbors,
            metric='cosine',
            algorithm='brute',
            n_jobs=-1
        )
        self.model.fit(X)
        
        print("Model training complete!")
        return self.model
    
    def save_model(self, output_path):
        model_data = {
            'model': self.model,
            'vectorizer': self.vectorizer,
            'recipe_ids': self.recipe_ids
        }
        with gzip.open(output_path, 'wb') as f:
            joblib.dump(model_data, f)
        print(f"Model saved to {output_path}")
    
    def test_model(self, test_ingredients, top_k=3):
        if not self.model or not self.vectorizer:
            print("Model not trained yet!")
            return
        
        input_vec = self.vectorizer.transform([test_ingredients])
        distances, indices = self.model.kneighbors(input_vec)
        
        conn = sqlite3.connect(self.db_path)
        results = []
        
        for i, dist in zip(indices[0], distances[0]):
            recipe_id = self.recipe_ids[i]
            cursor = conn.execute("SELECT title, ingredients, directions FROM recipes WHERE id=?", (recipe_id,))
            title, ingredients, directions = cursor.fetchone()
            results.append({
                'id': recipe_id,
                'title': title,
                'ingredients': ingredients,
                'directions': directions,
                'distance': dist
            })
        
        conn.close()
        return results[:top_k]

if __name__ == "__main__":
    # Configuration - update these paths
    db_path = "processed_data/recipes.db"
    index_path = "processed_data/search_index.pkl.gz"
    model_output = "recipe_model.pkl.gz"
    
    # Initialize and train the model
    trainer = RecipeModelTrainer(db_path, index_path)
    trainer.train_model(n_neighbors=10)
    
    # Save the trained model
    trainer.save_model(model_output)
    
    # Test the model
    test_ingredients = "chicken, rice, garlic, onion"
    print(f"\nTesting with ingredients: {test_ingredients}")
    results = trainer.test_model(test_ingredients, top_k=3)
    
    print("\nTop recommendations:")
    for i, recipe in enumerate(results):
        print(f"\n{i+1}. {recipe['title']} (Distance: {recipe['distance']:.4f})")
        print(f"Ingredients: {recipe['ingredients']}")
        print(f"Directions: {recipe['directions'][:100]}...")