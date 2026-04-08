#!/bin/bash

# Configuration
VENV_PATH="../venv"
SCRIPT_PATH="seed_drugs.py"

echo "=== MedGuard AI Database Seeder ==="

# Check if venv exists
if [ -d "$VENV_PATH" ]; then
    echo "Activating virtual environment..."
    source "$VENV_PATH/bin/activate" || source "$VENV_PATH/Scripts/activate"
else
    echo "Warning: Virtual environment not found at $VENV_PATH. Running with system python."
fi

# Set environment variables if needed
# export MONGO_URI="mongodb://localhost:27017"

echo "Starting seeding process..."
python "$SCRIPT_PATH"

echo "Done."
