import pandas as pd
import numpy as np
import re
import sqlite3
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import gzip
import os
import shutil
from tqdm import tqdm
import gc  # Garbage collector for memory management

# Define tokenizer function at the top level
def ingredient_tokenizer(text):
    """Tokenize ingredients by splitting on commas and stripping whitespace"""
    if not text:
        return []
    return [ingredient.strip() for ingredient in text.split(',')]

class RecipePreprocessor:
    def __init__(self, input_csv, output_dir='processed_data'):
        self.input_csv = input_csv
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Configuration
        self.max_recipes = 500000  # Target number of recipes
        self.min_ingredients = 3   # Minimum ingredients per recipe
        self.max_ingredients = 20  # Maximum ingredients per recipe
        self.min_direction_words = 20  # Minimum words in directions
        
    def clean_text(self, text):
        """Normalize and clean recipe text"""
        if not isinstance(text, str):
            return ""
            
        text = text.lower()
        text = re.sub(r'[^\w\s,]', '', text)  # Remove special chars except commas
        text = re.sub(r'\s+', ' ', text).strip()  # Collapse whitespace
        return text

    def process_chunk(self, chunk):
        """Process a chunk of the CSV"""
        # Clean data
        chunk = chunk.dropna(subset=['ingredients', 'directions'])
        chunk['ingredients'] = chunk['ingredients'].apply(self.clean_text)
        chunk['directions'] = chunk['directions'].apply(self.clean_text)
        
        # Filter by criteria
        ingredient_count = chunk['ingredients'].str.count(',') + 1
        direction_word_count = chunk['directions'].str.split().str.len()
        
        mask = (
            (ingredient_count >= self.min_ingredients) &
            (ingredient_count <= self.max_ingredients) &
            (direction_word_count >= self.min_direction_words)
        )
        
        return chunk[mask].copy()

    def preprocess_to_sqlite(self):
        """Process CSV into SQLite database with TF-IDF index"""
        print(f"Preprocessing {self.input_csv}...")
        
        # Initialize SQLite database
        db_path = os.path.join(self.output_dir, 'recipes.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            ingredients TEXT,
            directions TEXT,
            source TEXT
        )
        """)
        conn.commit()
        
        # Estimate total chunks
        try:
            total_rows = sum(1 for _ in open(self.input_csv, 'r', encoding='latin-1')) - 1
        except UnicodeDecodeError:
            total_rows = sum(1 for _ in open(self.input_csv, 'r', encoding='utf-8')) - 1
            
        chunksize = 50000
        total_chunks = (total_rows // chunksize) + 1
        
        all_ingredients = []
        inserted_count = 0
        chunk_counter = 0
        
        # Create progress bar
        pbar = tqdm(total=total_chunks, desc="Processing chunks")
        
        # Process CSV in chunks
        try:
            encoding = 'latin-1'
            reader = pd.read_csv(self.input_csv, chunksize=chunksize, encoding=encoding)
        except UnicodeDecodeError:
            encoding = 'utf-8'
            reader = pd.read_csv(self.input_csv, chunksize=chunksize, encoding=encoding)
        
        for chunk in reader:
            processed = self.process_chunk(chunk)
            
            if not processed.empty:
                # Store in SQLite
                processed[['title', 'ingredients', 'directions', 'source']].to_sql(
                    'recipes', conn, if_exists='append', index=False)
                
                # Collect ingredients for TF-IDF
                all_ingredients.extend(processed['ingredients'].tolist())
                inserted_count += len(processed)
            
            chunk_counter += 1
            pbar.update(1)
            
            # Clean up memory
            del chunk, processed
            gc.collect()
            
            if inserted_count >= self.max_recipes:
                print(f"Reached target of {self.max_recipes} recipes")
                break
        
        pbar.close()
        
        # Create TF-IDF vectorizer if we have data
        if all_ingredients:
            print("Creating search index...")
            vectorizer = TfidfVectorizer(
                tokenizer=ingredient_tokenizer,  # Use the top-level function
                token_pattern=None,
                stop_words='english',
                max_features=10000
            )
            
            # Fit on sampled ingredients (for memory efficiency)
            sample_size = min(100000, len(all_ingredients))
            sample = np.random.choice(all_ingredients, sample_size, replace=False)
            vectorizer.fit(sample)
            
            # Save compressed index
            index_path = os.path.join(self.output_dir, 'search_index.pkl.gz')
            with gzip.open(index_path, 'wb') as f:
                joblib.dump(vectorizer, f)
        else:
            print("Warning: No recipes processed. Search index not created.")
        
        # Create optimized indices
        print("Optimizing database...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ingredients ON recipes(ingredients)")
        conn.commit()
        conn.close()
        
        print(f"Preprocessing complete. Database saved to {db_path}")
        print(f"Total recipes processed: {inserted_count}")
        
        return inserted_count

    def split_for_github(self):
        """Split output files for GitHub upload"""
        print("Preparing files for GitHub...")
        
        # Split SQLite database if >95MB
        db_path = os.path.join(self.output_dir, 'recipes.db')
        if os.path.exists(db_path) and os.path.getsize(db_path) > 95 * 1024 * 1024:
            print("Database too large for GitHub, creating subsets...")
            self._create_sqlite_subsets(db_path)
        
        # Compress index if it exists
        index_path = os.path.join(self.output_dir, 'search_index.pkl')
        if os.path.exists(index_path):
            with open(index_path, 'rb') as f_in, gzip.open(index_path + '.gz', 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
            os.remove(index_path)
    
    def _create_sqlite_subsets(self, db_path):
        """Create smaller SQLite subsets for GitHub"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get total recipe count
        cursor.execute("SELECT COUNT(*) FROM recipes")
        total_recipes = cursor.fetchone()[0]
        
        # Calculate number of subsets needed (max 50,000 recipes per file)
        subset_size = 50000
        num_subsets = (total_recipes // subset_size) + 1
        
        print(f"Creating {num_subsets} database subsets...")
        
        for i in range(num_subsets):
            subset_path = os.path.join(self.output_dir, f'recipes_{i+1}.db')
            if os.path.exists(subset_path):
                os.remove(subset_path)
                
            subset_conn = sqlite3.connect(subset_path)
            subset_cursor = subset_conn.cursor()
            subset_cursor.execute("""
                CREATE TABLE recipes (
                    id INTEGER PRIMARY KEY,
                    title TEXT,
                    ingredients TEXT,
                    directions TEXT,
                    source TEXT
                )
            """)
            subset_conn.commit()
            
            # Copy a subset of recipes
            offset = i * subset_size
            cursor.execute(f"SELECT * FROM recipes LIMIT {subset_size} OFFSET {offset}")
            recipes = cursor.fetchall()
            
            if recipes:
                subset_cursor.executemany(
                    "INSERT INTO recipes (id, title, ingredients, directions, source) VALUES (?, ?, ?, ?, ?)",
                    recipes
                )
                subset_conn.commit()
            
            subset_conn.close()
            print(f"Created subset {i+1}/{num_subsets}: {os.path.getsize(subset_path)/1024/1024:.2f} MB")
        
        conn.close()
        # Remove original large database
        os.remove(db_path)

if __name__ == "__main__":
    # Configuration - UPDATE THESE PATHS
    input_csv = "RecipeNLG_dataset.csv"  # Path to your large CSV file
    output_dir = "processed_data"        # Output directory
    
    # Run preprocessing
    preprocessor = RecipePreprocessor(input_csv, output_dir)
    recipe_count = preprocessor.preprocess_to_sqlite()
    
    if recipe_count > 0:
        preprocessor.split_for_github()