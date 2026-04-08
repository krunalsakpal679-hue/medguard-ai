import torch
import os
from typing import Dict, List
from app.ml.model.ddi_model import MedGuardDDIModel
from app.ml.utils.feature_extractor import feature_extractor
from app.models.drug import DrugInDB
from app.core.logger import logger
import torch.nn.functional as F

class ModelLoader:
    """
    Singleton for managing MedGuard AI model weights and high-performance inference.
    """
    _instance = None
    _model = None
    _weights_path = "app/ml/model/weights/ddi_model.pt"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Load weights from disk or initialize fresh for development."""
        self._model = MedGuardDDIModel()
        
        if os.path.exists(self._weights_path):
            try:
                self._model.load_state_dict(torch.load(self._weights_path, map_location='cpu'))
                logger.info("MedGuard AI model weights loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load weights: {e}. Using untrained model.")
        else:
            logger.warning("Weights not found at path. INITIALIZING UNTRAINED MODEL — Predictions will be mathematical placeholders.")
        
        self._model.eval()

    @torch.no_grad()
    async def predict_interaction(self, drug_a: DrugInDB, drug_b: DrugInDB) -> Dict:
        """
        Runs symmetric inference to predict pharmacological interaction parameters.
        """
        # 1. Transform clinical data to tensors
        feat_a = feature_extractor.extract_features(drug_a)
        feat_b = feature_extractor.extract_features(drug_b)
        
        # 2. Forward pass
        output = self._model(feat_a, feat_b)
        
        # 3. Process Severity Logits
        probs = F.softmax(output["severity_logits"], dim=1).squeeze().tolist()
        severity_labels = ["NONE", "MINOR", "MODERATE", "MAJOR", "CONTRAINDICATED"]
        top_idx = torch.argmax(output["severity_logits"], dim=1).item()
        
        # 4. Map Side Effects (Placeholder mapping for 20 types)
        # In a real system, these would align with a MedDRA dictionary
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
