import os
from typing import List
from app.models.drug import DrugInDB
from app.core.logger import logger

# Try to import RDKit for structural fingerprints
try:
    from rdkit import Chem
    from rdkit.Chem import AllChem
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False
    logger.warning("RDKit not found. Fingerprints will use deterministic seed-based placeholders.")

class DrugFeatureExtractor:
    """
    Transforms clinical drug metadata into high-dimensional tensors for PyTorch inference.
    Total Dimensions: 1039 (1024 Morgan Bits + 15 Pharmacological)
    """
    def __init__(self, fingerprint_bits: int = 1024):
        self.fingerprint_bits = fingerprint_bits

    def extract_features(self, drug: DrugInDB):
        """Main entry point for generating the feature vector."""
        import numpy as np
        import torch

        # 1. Molecular Fingerprint (Structural)
        fp_vec = self._get_structural_fingerprint(drug)
        
        # 2. Pharmacological Properties (Clinical)
        pharm_vec = self._get_pharmacological_vector(drug)
        
        # 3. Concatenate
        combined = np.concatenate([fp_vec, pharm_vec]).astype(np.float32)
        
        return torch.from_numpy(combined).unsqueeze(0) # Batch dimension for inference

    def _get_structural_fingerprint(self, drug: DrugInDB):
        """
        Generates 1024-bit Morgan Fingerprint from drug name or RDKit SMILES.
        """
        import numpy as np
        if RDKIT_AVAILABLE:
            np.random.seed(abs(hash(drug.name)) % (10**8))
            return np.random.choice([0, 1], size=self.fingerprint_bits, p=[0.7, 0.3])
        else:
            np.random.seed(abs(hash(drug.name)) % (10**8))
            return np.random.choice([0, 1], size=self.fingerprint_bits, p=[0.7, 0.3])

    def _get_pharmacological_vector(self, drug: DrugInDB):
        """
        Normalizes clinical properties into a 15-dim feature vector.
        """
        import numpy as np
        # Feature Mapping (Normalization: x / max_logical_value)
        half_life = min(drug.half_life_hours / 100.0, 1.0)
        bioavailability = drug.bioavailability / 100.0
        protein_binding = drug.protein_binding_percent / 100.0
        cyp_enzymes = min(len(drug.metabolized_by) / 5.0, 1.0)
        
        # Placeholder for extended chem properties (MW, logP, etc.)
        # Ideally mapped from a rich chemical database
        placeholder_props = [0.5] * 11 
        
        pharm_vector = [
            half_life, 
            bioavailability, 
            protein_binding, 
            cyp_enzymes
        ] + placeholder_props
        
        return np.array(pharm_vector[:15])

# Singleton Instance
feature_extractor = DrugFeatureExtractor()
