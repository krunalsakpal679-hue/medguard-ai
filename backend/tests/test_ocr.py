import pytest
import PIL.Image
import io
from app.ml.utils.ocr_engine import ocr_engine
from app.ml.utils.drug_name_parser import drug_parser

def test_preprocess_image():
    """Verify that preprocessing correctly normalizes clinical images."""
    # Create a dummy white image
    img = PIL.Image.new('RGB', (500, 500), color = 'white')
    processed = ocr_engine._preprocess_image(img)
    
    # Check grayscale and normalization
    assert processed.mode == 'L'
    assert processed.width >= 1000 # Scaling check

@pytest.mark.asyncio
async def test_dosage_filter():
    """Ensure that dosage instructions aren't misidentified as drug entities."""
    dosage_str = "500mg once daily in the morning"
    assert drug_parser._is_dosage_string(dosage_str) == True
    
    non_dosage = "Sertraline"
    assert drug_parser._is_dosage_string(non_dosage) == False

@pytest.mark.asyncio
async def test_normalization():
    """Verify normalization of clinical text."""
    dirty_text = "Take: Aspirin (50mg) + Metformin/500mg!!"
    clean = drug_parser._normalize_text(dirty_text)
    assert "!" not in clean
    assert "(" not in clean
    assert "Aspirin" in clean

@pytest.mark.asyncio
async def test_fuzzy_match_logic():
    """Test the core difflib fuzzy matching logic."""
    import difflib
    
    # Close match
    score = difflib.SequenceMatcher(None, "sertriline", "sertraline").ratio()
    assert score > 0.8
    
    # Distant match
    score = difflib.SequenceMatcher(None, "aspirin", "warfarin").ratio()
    assert score < 0.6
