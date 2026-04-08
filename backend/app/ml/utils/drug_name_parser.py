import re
import difflib
import time
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.logger import logger

class DrugNameParser:
    """
    NLP-based clinical entity extractor for filtering drugs from raw OCR text.
    """
    def __init__(self):
        self.cached_drug_names: List[str] = []
        self.last_cache_update = 0
        self.CACHE_TTL = 600 # 10 minutes

    async def _refresh_cache(self, db: AsyncIOMotorDatabase):
        """Fetch valid drug names from clinical database to use as match targets."""
        now = time.time()
        if now - self.last_cache_update < self.CACHE_TTL and self.cached_drug_names:
            return

        try:
            cursor = db.drugs.find({"is_active": True}, {"name": 1})
            self.cached_drug_names = [d["name"] async for d in cursor]
            self.last_cache_update = now
            logger.info(f"DrugNameParser: Cache refreshed with {len(self.cached_drug_names)} drugs.")
        except Exception as e:
            logger.error(f"Failed to refresh drug cache: {e}")

    async def parse_drug_names(self, text: str, db: AsyncIOMotorDatabase) -> List[Dict]:
        """
        Tokenize text and find candidate drug matches using fuzzy logic and dosage filtering.
        """
        await self._refresh_cache(db)
        
        # 1. Cleaning & Tokenization
        clean_text = self._normalize_text(text)
        tokens = clean_text.split()
        
        # 2. Candidate Generation (including Bigrams for names like "Low Dose Aspirin")
        candidates = tokens.copy()
        for i in range(len(tokens) - 1):
            candidates.append(f"{tokens[i]} {tokens[i+1]}")
            
        results = []
        seen_matches = set()

        # 3. Fuzzy Matching
        for candidate in candidates:
            if self._is_dosage_string(candidate):
                continue
                
            # Compare against clinical database
            for known_name in self.cached_drug_names:
                score = difflib.SequenceMatcher(None, candidate.lower(), known_name.lower()).ratio()
                
                if score >= 0.8:
                    if known_name not in seen_matches:
                        results.append({
                            "name": known_name,
                            "confidence": round(score, 2),
                            "match_source": candidate
                        })
                        seen_matches.add(known_name)
        
        return sorted(results, key=lambda x: x["confidence"], reverse=True)

    def _normalize_text(self, text: str) -> str:
        """Remove clinical symbols and normalize whitespace."""
        # Remove non-alphanumeric except common dose symbols
        text = re.sub(r'[^a-zA-Z0-9\s/]', ' ', text)
        return " ".join(text.split())

    def _is_dosage_string(self, token: str) -> bool:
        """Filter out common dosage instructions to reduce false positives."""
        dosage_patterns = [
            r'\d+\s*(mg|ml|mcg|iu|g|tab|cap)',
            r'once|twice|daily|morning|night|evening|bedtime',
            r'(1|2|3|4)\s*times',
            r'before|after\s*meal'
        ]
        
        for pattern in dosage_patterns:
            if re.search(pattern, token, re.IGNORECASE):
                return True
        return False

# Singleton Instance
drug_parser = DrugNameParser()
