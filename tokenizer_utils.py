# tokenizer_utils.py
def ingredient_tokenizer(text):
    """Tokenize ingredients by splitting on commas and stripping whitespace"""
    if not text or not isinstance(text, str):
        return []
    return [ingredient.strip() for ingredient in text.split(',')]