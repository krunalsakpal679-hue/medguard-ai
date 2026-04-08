import torch
import torch.nn as nn
import torch.nn.functional as F

class DrugFeatureEncoder(nn.Module):
    """
    Encodes raw 1039-dim drug features into a 128-dim dense clinical embedding.
    Input: Fingerprints (1024) + Pharmacological (15)
    """
    def __init__(self, input_dim=1039, embedding_dim=128):
        super(DrugFeatureEncoder, self).__init__()
        
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(256, embedding_dim),
            nn.BatchNorm1d(embedding_dim),
            nn.ReLU()
        )

    def forward(self, x):
        return self.encoder(x)

class DDIClassifier(nn.Module):
    """
    Multi-task classification head for interaction, synergy, and side effects.
    Combines two drug embeddings using symmetric interaction logic.
    """
    def __init__(self, embedding_dim=128):
        super(DDIClassifier, self).__init__()
        
        # Concat(emb_a, emb_b, product, diff) = 128 * 4 = 512
        input_dim = embedding_dim * 4
        
        self.shared_layers = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.4),
            
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.4),
            
            nn.Linear(128, 64),
            nn.ReLU()
        )
        
        # Task 1: Severity Classification (5 classes)
        self.severity_head = nn.Linear(64, 5)
        
        # Task 2: Synergy Regression (0-1)
        self.synergy_head = nn.Linear(64, 1)
        
        # Task 3: Side Effect Multi-label (20 common effects)
        self.side_effects_head = nn.Linear(64, 20)

    def forward(self, emb_a, emb_b):
        # Create an interaction representation
        interaction = torch.cat([
            emb_a, 
            emb_b, 
            emb_a * emb_b, 
            torch.abs(emb_a - emb_b)
        ], dim=1)
        
        shared_out = self.shared_layers(interaction)
        
        severity_logits = self.severity_head(shared_out)
        synergy_score = torch.sigmoid(self.synergy_head(shared_out))
        side_effect_probs = torch.sigmoid(self.side_effects_head(shared_out))
        
        return severity_logits, synergy_score, side_effect_probs

class MedGuardDDIModel(nn.Module):
    """
    End-to-end MedGuard AI model combining structural encoding with interaction prediction.
    Ensures order-invariance (Drug A + Drug B == Drug B + Drug A).
    """
    def __init__(self):
        super(MedGuardDDIModel, self).__init__()
        self.encoder = DrugFeatureEncoder()
        self.classifier = DDIClassifier()

    def forward(self, drug_a_features, drug_b_features):
        # 1. Encode both drugs individually
        emb_a = self.encoder(drug_a_features)
        emb_b = self.encoder(drug_b_features)
        
        # 2. Run symmetric prediction (A,B) and (B,A) to ensure medical consistency
        logits_1, syn_1, side_1 = self.classifier(emb_a, emb_b)
        logits_2, syn_2, side_2 = self.classifier(emb_b, emb_a)
        
        # Average heads for symmetry
        severity_logits = (logits_1 + logits_2) / 2
        synergy_score = (syn_1 + syn_2) / 2
        side_effect_probs = (side_1 + side_2) / 2
        
        return {
            "severity_logits": severity_logits,
            "synergy_score": synergy_score,
            "side_effect_probs": side_effect_probs
        }
