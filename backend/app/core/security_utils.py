import re
import secrets
import unicodedata
from typing import List
from urllib.parse import urlparse

def sanitize_filename(filename: str) -> str:
    """
    Hardens filenames against path traversal and metadata injection.
    """
    # Remove directory components
    filename = os.path.basename(filename)
    
    # Strip non-alphanumeric (except . - _)
    filename = re.sub(r'[^a-zA-Z0-9.\-_]', '', filename)
    
    # Limit length
    return filename[:255]

def sanitize_text_input(text: str, max_length: int = 5000) -> str:
    """
    Cleanses text input from XSS vectors and control characters.
    """
    if not text:
        return ""
        
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    
    # Normalize unicode (NFKC)
    text = unicodedata.normalize('NFKC', text)
    
    # Remove control characters
    text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C")
    
    return text[:max_length]

def is_safe_redirect_url(url: str, allowed_domains: List[str]) -> bool:
    """
    Validates redirect URLs to prevent Open Redirect vulnerabilities.
    """
    if not url:
        return False
        
    # Allow relative URLs starting with /
    if url.startswith("/") and not url.startswith("//"):
        return True
        
    parsed_url = urlparse(url)
    return parsed_url.netloc in allowed_domains

def generate_secure_random_token(length: int = 32) -> str:
    """
    Generates a cryptographically secure random token for clinical session identifiers.
    """
    return secrets.token_urlsafe(length)

# Need to import os for sanitize_filename
import os
