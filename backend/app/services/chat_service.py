import httpx
import re
from typing import List, Dict, Optional
from app.core.config import settings
from app.core.logger import logger
import difflib

class ChatService:
    """
    Multilingual medical clinical assistant service with dual-LLM fallback architecture.
    """
    
    SYSTEM_PROMPT_EN = (
        "You are MedGuard AI, a clinical safety assistant specialized in drug information and safety. "
        "Recommend consulting a medical professional for all changes. Never provide dosage advice. "
        "Keep responses under 200 words. Language: English."
    )
    
    SYSTEM_PROMPT_HI = (
        "आप MedGuard AI हैं, एक चिकित्सा सुरक्षा सहायक जो दवा की जानकारी और सुरक्षा में विशिष्ट है। "
        "हमेशा डॉक्टर से परामर्श करने की सिफारिश करें। कभी भी खुराक की सलाह न दें। "
        "प्रतिक्रियाएं 200 शब्दों से कम रखें। भाषा: हिंदी।"
    )
    
    SYSTEM_PROMPT_GU = (
        "તમે MedGuard AI છો, જે દવાની માહિતી અને સુરક્ષામાં નિષ્ણાત તબીબી સુરક્ષા સહાયક છે. "
        "હંમેશા ડૉક્ટરની સલાહ લેવાની ભલામણ કરો. ક્યારેય ડોઝની સલાહ ન આપશો. "
        "પ્રતિભાવો ૨૦૦ શબ્દોની અંદર રાખો. ભાષા: ગુજરાતી."
    )

    async def generate_response(
        self, 
        message: str, 
        language: str, 
        history: List[Dict], 
        detected_drugs: List[str]
    ) -> str:
        """
        Orchestrates the clinical assistant response using Google Gemini or HuggingFace fallback.
        """
        # 1. Select prompt based on detected or requested language
        system_prompt = self.SYSTEM_PROMPT_EN
        if language == "hi": system_prompt = self.SYSTEM_PROMPT_HI
        elif language == "gu": system_prompt = self.SYSTEM_PROMPT_GU
        
        # 2. Inject clinical context if drugs were detected in the query
        if detected_drugs:
            context = f" [Context: User is asking about {', '.join(detected_drugs)}]"
            system_prompt += context

        # 3. Format history for Google/Mistral format
        # [ { "role": "user", "parts": [{"text": "..."}] }, ... ]
        
        try:
            # Primary: Google Gemini 1.5 Flash (Optimized for speed/multilingual)
            return await self._call_gemini_api(system_prompt, history, message)
        except Exception as e:
            logger.warn(f"Gemini API failed: {e}. Falling back to HuggingFace.")
            try:
                # Fallback: HuggingFace Inference API (Mistral-7B)
                return await self._call_huggingface_api(system_prompt, history, message)
            except Exception as hf_e:
                logger.error(f"Critical: All LLM providers failed: {hf_e}")
                return "I apologize, but my medical knowledge base is currently offline. Please consult a physical doctor for immediate safety concerns."

    async def _call_gemini_api(self, system_prompt, history, message) -> str:
        """Direct async call to Gemini 1.5 API."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GOOGLE_API_KEY}"
        
        contents = []
        for h in history:
            contents.append({"role": "user" if h["role"] == "user" else "model", "parts": [{"text": h["content"]}]})
        contents.append({"role": "user", "parts": [{"text": message}]})
        
        payload = {
            "contents": contents,
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {"maxOutputTokens": 400, "temperature": 0.7}
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=20.0)
            result = resp.json()
            return result['candidates'][0]['content']['parts'][0]['text']

    async def _call_huggingface_api(self, system_prompt, history, message) -> str:
        """Fallback to HuggingFace Inference API (Mistral)."""
        url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        
        full_text = f"Context: {system_prompt}\n"
        for h in history:
            full_text += f"{h['role']}: {h['content']}\n"
        full_text += f"user: {message}\nassistant:"
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={"inputs": full_text, "parameters": {"max_new_tokens": 250}}, headers=headers, timeout=15.0)
            result = resp.json()
            return result[0]['generated_text'].split("assistant:")[-1].strip()

    def detect_language(self, text: str) -> str:
        """Clinical heuristic for script detection (Hindi/Gujarati/English)."""
        # Devanagari range (Hindi)
        if re.search(r'[\u0900-\u097F]', text): return "hi"
        # Gujarati range
        if re.search(r'[\u0A80-\u0AFF]', text): return "gu"
        return "en"

    def detect_drug_mentions(self, text: str, drug_names: List[str]) -> List[str]:
        """Fuzzy match query text against the system's drug master list."""
        mentions = []
        tokens = text.lower().split()
        for token in tokens:
            if len(token) < 4: continue
            matches = difflib.get_close_matches(token, [d.lower() for d in drug_names], n=1, cutoff=0.85)
            if matches:
                mentions.append(matches[0].title())
        return list(set(mentions))

# Singleton Instance
chat_service = ChatService()
