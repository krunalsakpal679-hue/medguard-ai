import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score, classification_report, f1_score
from app.ml.model.ddi_model import MedGuardDDIModel
from app.ml.model.train import generate_synthetic_data, DrugPairDataset
from app.core.logger import logger
import matplotlib.pyplot as plt
import seaborn as sns
import os

def evaluate_model(weights_path="app/ml/model/weights/ddi_model.pt"):
    """
    Independent clinical evaluation of the MedGuard AI model.
    Generates performance heatmaps and classification metrics.
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Evaluating on {device}...")
    
    # 1. Load Data
    raw_data = generate_synthetic_data(num_samples=1000) # Test set subset
    dataset = DrugPairDataset(raw_data)
    test_loader = DataLoader(dataset, batch_size=32)
    
    # 2. Load Model
    model = MedGuardDDIModel().to(device)
    if not os.path.exists(weights_path):
        logger.error("Weights file not found. Evaluation aborted.")
        return
        
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()

    all_preds = []
    all_true = []
    all_synergy_preds = []
    all_synergy_true = []

    # 3. Predict
    with torch.no_grad():
        for fa, fb, sev, syn, side in test_loader:
            fa, fb, sev, syn, side = fa.to(device), fb.to(device), sev.to(device), syn.to(device), side.to(device)
            out = model(fa, fb)
            
            preds = torch.argmax(out["severity_logits"], dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_true.extend(sev.cpu().numpy())
            
            all_synergy_preds.extend(out["synergy_score"].flatten().cpu().numpy())
            all_synergy_true.extend(syn.cpu().numpy())

    # 4. Final Metrics
    acc = accuracy_score(all_true, all_preds)
    f1 = f1_score(all_true, all_preds, average='weighted')
    
    logger.info(f"Global Accuracy: {acc:.4f} | Weighted F1: {f1:.4f}")
    
    # Synergy Correlation (RMSE)
    synergy_rmse = np.sqrt(np.mean((np.array(all_synergy_preds) - np.array(all_synergy_true))**2))
    logger.info(f"Synergy Prediction RMSE: {synergy_rmse:.4f}")
    
    # Clinical Report
    target_names = ["NONE", "MINOR", "MODERATE", "MAJOR", "CONTRAINDICATED"]
    print("\n" + "#"*40)
    print("### CLINICAL PERFORMANCE REPORT ###")
    print(classification_report(all_true, all_preds, target_names=target_names))
    print("#"*40 + "\n")

    # 5. Visualization: Confusion Matrix
    cm = confusion_matrix(all_true, all_preds)
    plt.figure(figsize=(12, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=target_names, yticklabels=target_names, cmap="Greens")
    plt.title("MedGuard DDI Severity Confusion Matrix")
    plt.ylabel('Actual Clinical Severity')
    plt.xlabel('AI Predicted Severity')
    
    vis_path = "app/ml/model/results/performance_matrix.png"
    os.makedirs(os.path.dirname(vis_path), exist_ok=True)
    plt.savefig(vis_path)
    logger.info(f"Performance heatmap saved to: {vis_path}")
    plt.close()

if __name__ == "__main__":
    evaluate_model()
