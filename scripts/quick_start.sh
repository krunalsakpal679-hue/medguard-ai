#!/bin/bash

# MedGuard AI — One-Command Onboarding
# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "  🏥 MedGuard AI — Quick Start"
echo -e "${BLUE}═══════════════════════════════════${NC}"

# Step 1: Pre-flight Python checks
echo -e "\n${GREEN}[1/4] Validating Core Runtime...${NC}"
python3 --version || { echo -e "${RED}Python 3.11+ is required.${NC}"; exit 1; }

# Step 2: Backend provision
echo -e "\n${GREEN}[2/4] Provisioning Clinical Logic Layer...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created backend/.env - UPDATE with your credentials!${NC}"
fi
cd ..

# Step 3: Frontend provision
echo -e "\n${GREEN}[3/4] Provisioning Interface Layer...${NC}"
cd frontend
npm install -q
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}Created frontend/.env.local - UPDATE with Client IDs!${NC}"
fi
cd ..

# Step 4: Verification
echo -e "\n${GREEN}[4/4] Running Environment Audit...${NC}"
python3 scripts/verify_setup.py

echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "  ${GREEN}Setup Lifecycle Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "🚀 Start Development: ${YELLOW}make dev${NC}"
echo -e "🔬 Run Test Suite:   ${YELLOW}make test${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"
