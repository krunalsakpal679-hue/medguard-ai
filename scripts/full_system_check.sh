#!/bin/bash

# MedGuard AI — Master System Validation
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════"
echo "  MedGuard AI — Full System Check"
echo "═══════════════════════════════════"

echo -e "\n🔍 ${GREEN}1. Checking Backend Connectivity...${NC}"
curl -s http://localhost:8000/health | python3 -m json.tool || echo -e "${RED}Backend Unreachable${NC}"

echo -e "\n🔍 ${GREEN}2. Checking Frontend Availability...${NC}"
curl -s -o /dev/null -w "Frontend HTTP status: %{http_code}\n" http://localhost:5173 || echo -e "${RED}Frontend Unreachable${NC}"

echo -e "\n🔍 ${GREEN}3. Validating Persistence Layer (MongoDB)...${NC}"
# Attempt a simple list collections check if MONGO_URI is set
if [ -z "$MONGO_URI" ]; then
    echo "Warning: MONGO_URI not set in shell environment. Skipping direct check."
else
    python3 -c "from pymongo import MongoClient; import os; c=MongoClient(os.getenv('MONGO_URI')); print('Collections found:', c.get_database().list_collection_names())" || echo -e "${RED}DB Connection Failed${NC}"
fi

echo -e "\n🔍 ${GREEN}4. Executing End-to-End Integration Suite...${NC}"
python3 backend/scripts/integration_test.py --base-url http://localhost:8000

echo -e "\n🔍 ${GREEN}5. Running Component Unit Tests (Backend)...${NC}"
cd backend && pytest tests/ -v --tb=short -q && cd ..

echo -e "\n🔍 ${GREEN}6. Running Component Unit Tests (Frontend)...${NC}"
cd frontend && npm run test -- --run && cd ..

echo -e "\n═══════════════════════════════════"
echo "  Validation Complete"
echo "═══════════════════════════════════"
