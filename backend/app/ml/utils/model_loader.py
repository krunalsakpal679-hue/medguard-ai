try:
    import torch
    import torch.nn.functional as F
    HAS_ML = True
except ImportError:
    HAS_ML = False

import os
from typing import Dict, List
from app.models.drug import DrugInDB
from app.core.logger import logger

class ModelLoader:
    """
    Lazy-loading singleton for MedGuard AI model.
    """
    _instance = None
    _model = None
    _weights_path = "app/ml/model/weights/ddi_model.pt"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            if HAS_ML:
                cls._instance._initialize_model()
            else:
                logger.warning("ML Subsystem Offline: Torch/RDKit not found.")
        return cls._instance

    def _initialize_model(self):
        from app.ml.model.ddi_model import MedGuardDDIModel
        from app.ml.utils.feature_extractor import feature_extractor
        self._model = MedGuardDDIModel()
        
        if os.path.exists(self._weights_path):
            try:
                self._model.load_state_dict(torch.load(self._weights_path, map_location='cpu'))
                logger.info("MedGuard AI model weights loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load weights: {e}. Using untrained model.")
        else:
            logger.warning("Weights not found at path.")
        
        self._model.eval()

    async def predict_interaction(self, drug_a: DrugInDB, drug_b: DrugInDB) -> Dict:
        if not HAS_ML:
            return {
                "severity": "UNKNOWN",
                "severity_probs": {},
                "synergy_score": 0.0,
                "side_effect_probs": [],
                "is_untrained": True,
                "error": "ML Subsystem Unavailable (Dependencies failing on Render)"
            }
            
        from app.ml.utils.feature_extractor import feature_extractor
        # Use torch
        with torch.no_grad():
            feat_a = feature_extractor.extract_features(drug_a)
            feat_b = feature_extractor.extract_features(drug_b)
            output = self._model(feat_a, feat_b)
            probs = F.softmax(output["severity_logits"], dim=1).squeeze().tolist()
            severity_labels = ["NONE", "MINOR", "MODERATE", "MAJOR", "CONTRAINDICATED"]
            top_idx = torch.argmax(output["severity_logits"], dim=1).item()
            se_probs = output["side_effect_probs"].squeeze().tolist()
            
            return {
                "severity": severity_labels[top_idx],
                "severity_probs": {label: prob for label, prob in zip(severity_labels, probs)},
                "synergy_score": round(output["synergy_score"].item(), 4),
                "side_effect_probs": se_probs,
                "is_untrained": not os.path.exists(self._weights_path)
            }

# Singleton Instance
model_loader = ModelLoader()
