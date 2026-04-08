import os
import PIL.Image
import PIL.ImageOps
import PIL.ImageEnhance
import numpy as np
from typing import Dict, List, Optional
from app.core.logger import logger

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logger.warning("EasyOCR not installed, falling back to Tesseract.")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("Tesseract not installed.")

class OCREngine:
    """
    Multimodal clinical OCR engine with EasyOCR primary and Tesseract fallback.
    """
    def __init__(self):
        self.use_easyocr = EASYOCR_AVAILABLE
        self.reader = None
        
        if self.use_easyocr:
            try:
                # Initialize reader for English - will download models on first run
                self.reader = easyocr.Reader(['en'], gpu=False) # GPU False for dev stability
                logger.info("OCREngine: EasyOCR initialized successfully.")
            except Exception as e:
                logger.error(f"EasyOCR init failed: {e}. Falling back to Tesseract.")
                self.use_easyocr = False

    async def extract_text(self, image_path: str) -> str:
        """Process local image file and return normalized raw text."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Clinical image not found at: {image_path}")

        try:
            with PIL.Image.open(image_path) as img:
                # 1. Preprocess
                processed_img = self._preprocess_image(img)
                
                # 2. Extract
                if self.use_easyocr and self.reader:
                    # Convert PIL to numpy for EasyOCR
                    img_np = np.array(processed_img)
                    results = self.reader.readtext(img_np, detail=0)
                    return " ".join(results)
                
                elif TESSERACT_AVAILABLE:
                    return pytesseract.image_to_string(processed_img)
                
                else:
                    raise RuntimeError("No active OCR engine available in the backend environment.")
        except Exception as e:
            logger.error(f"OCR Extraction error: {e}")
            return ""

    def _preprocess_image(self, image: PIL.Image.Image) -> PIL.Image.Image:
        """
        Enhance image quality for better character recognition.
        - Grayscale conversion
        - Contrast enhancement
        - Binarization (Thresholding)
        """
        # Convert to Grayscale
        img = image.convert('L')
        
        # Enhance Contrast
        enhancer = PIL.ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Binarization (Fixed threshold for stability)
        img = img.point(lambda p: p > 127 and 255)
        
        # Resize if too small (minimum 300 DPI equivalent assumption)
        if img.width < 1000:
            scale = 1000 / img.width
            img = img.resize((int(img.width * scale), int(img.height * scale)), PIL.Image.LANCZOS)
            
        return img

# Singleton Instance
ocr_engine = OCREngine()
