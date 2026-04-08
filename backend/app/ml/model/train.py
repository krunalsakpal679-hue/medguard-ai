import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
import numpy as np
from tqdm import tqdm
from sklearn.metrics import classification_report, f1_score, confusion_matrix
import time

from app.ml.model.ddi_model import MedGuardDDIModel
from app.core.logger import logger

# --- Dataset Definition ---

class DrugPairDataset(Dataset):
    """
    Clinical dataset for Drug-Drug Interaction pairs.
    Returns: (feat_a, feat_b, severity_label, synergy_score, side_effect_labels)
    """
    def __init__(self, data_list: list):
        self.data = data_list

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        # features are 1039-dim tensors
        return (
            torch.tensor(item['feat_a'], dtype=torch.float32),
            torch.tensor(item['feat_b'], dtype=torch.float32),
            torch.tensor(item['severity'], dtype=torch.long),
            torch.tensor(item['synergy'], dtype=torch.float32),
            torch.tensor(item['side_effects'], dtype=torch.float32)
        )

# --- Synthetic Bootstrapping ---

def generate_synthetic_data(num_samples=5000):
    """
    Generate synthetic clinical samples to bootstrap the model for development.
    NOTE: Real clinical data from databases like DrugBank or CredibleMeds is required for production.
    """
    logger.info(f"Generating {num_samples} synthetic training samples...")
    data = []
    for _ in range(num_samples):
        # 1024-bit fingerprint + 15 pharmacological
        feat_a = np.random.normal(0, 1, 1039)
        feat_b = np.random.normal(0, 1, 1039)
        
        # Randomly assign a severity (0=NONE, 1=MINOR, 2=MODERATE, 3=MAJOR, 4=CONTRAINDICATED)
        severity = np.random.choice([0, 1, 2, 3, 4], p=[0.6, 0.15, 0.1, 0.1, 0.05])
        synergy = 0.5 + 0.5 * np.random.rand() if severity > 2 else 0.5 * np.random.rand()
        side_effects = np.random.choice([0.0, 1.0], size=20, p=[0.8, 0.2])
        
        data.append({
            'feat_a': feat_a,
            'feat_b': feat_b,
            'severity': severity,
            'synergy': synergy,
            'side_effects': side_effects
        })
    return data

# --- Training Pipeline ---

def train_model(epochs=50, batch_size=32, lr=0.001):
    # 1. Preparation
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Training on device: {device}")
    
    raw_data = generate_synthetic_data()
    dataset = DrugPairDataset(raw_data)
    
    # 80/10/10 Split
    train_size = int(0.8 * len(dataset))
    val_size = int(0.1 * len(dataset))
    test_size = len(dataset) - train_size - val_size
    train_ds, val_ds, test_ds = random_split(dataset, [train_size, val_size, test_size])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size)
    
    # 2. Model & Optimization
    model = MedGuardDDIModel().to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    # Loss components
    # Weighted CE to handle class imbalance (NONE vs others)
    class_weights = torch.tensor([1.0, 2.0, 3.0, 4.0, 6.0]).to(device)
    severity_criterion = nn.CrossEntropyLoss(weight=class_weights)
    synergy_criterion = nn.MSELoss()
    side_effect_criterion = nn.BCEWithLogitsLoss()
    
    best_val_loss = float('inf')
    save_path = "app/ml/model/weights/ddi_model.pt"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # 3. Training Loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        
        for fa, fb, sev, syn, side in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}"):
            fa, fb, sev, syn, side = fa.to(device), fb.to(device), sev.to(device), syn.to(device), side.to(device)
            
            optimizer.zero_grad()
            out = model(fa, fb)
            
            l_sev = severity_criterion(out["severity_logits"], sev)
            l_syn = synergy_criterion(out["synergy_score"].flatten(), syn)
            l_side = side_effect_criterion(out["side_effect_probs"], side)
            
            # Weighted multi-task loss
            total_loss = l_sev + (0.3 * l_syn) + (0.2 * l_side)
            total_loss.backward()
            optimizer.step()
            
            train_loss += total_loss.item()
            
        scheduler.step()
        
        # Validation
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_true = []
        
        with torch.no_grad():
            for fa, fb, sev, syn, side in val_loader:
                fa, fb, sev, syn, side = fa.to(device), fb.to(device), sev.to(device), syn.to(device), side.to(device)
                out = model(fa, fb)
                
                l_sev = severity_criterion(out["severity_logits"], sev)
                total_loss = l_sev + (0.3 * synergy_criterion(out["synergy_score"].flatten(), syn))
                val_loss += total_loss.item()
                
                preds = torch.argmax(out["severity_logits"], dim=1)
                all_preds.extend(preds.cpu().numpy())
                all_true.extend(sev.cpu().numpy())
        
        avg_val_loss = val_loss / len(val_loader)
        f1 = f1_score(all_true, all_preds, average='weighted')
        
        logger.info(f"Epoch {epoch+1} Summary: Train Loss: {train_loss/len(train_loader):.4f} | Val Loss: {avg_val_loss:.4f} | Val F1: {f1:.4f}")
        
        # Save Best Model
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), save_path)
            logger.info("--> New best model saved.")

    logger.info("Training Pipeline Complete.")
    
    # Final Classification Report on Val
    report = classification_report(all_true, all_preds, target_names=["NONE", "MINOR", "MODERATE", "MAJOR", "CONTRAINDICATED"])
    print("\n--- Final Validation Clinical Report ---\n")
    print(report)

if __name__ == "__main__":
    train_model(epochs=50)
