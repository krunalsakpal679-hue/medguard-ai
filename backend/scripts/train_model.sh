#!/bin/bash

# MedGuard AI Model Training Automation
# This script initializes the environment and executes the multi-task DDI training pipeline.

echo "--- MedGuard AI Training Setup ---"

# 1. Environment Activation
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Using existing virtual environment."
else
    echo "Virtual environment (venv) not found. Please ensure dependencies are installed."
fi

# 2. Pipeline Execution
# Running with python -m to ensure internal module imports (app.ml...) work correctly
echo "Launching training pipeline (50 Epochs)..."
python -m app.ml.model.train

# 3. Final Validation
echo "Running standalone evaluation..."
python -m app.ml.model.evaluate

echo "--- Process Complete ---"
echo "Model Weights: backend/app/ml/model/weights/ddi_model.pt"
echo "Performance Chart: backend/app/ml/model/results/performance_matrix.png"
