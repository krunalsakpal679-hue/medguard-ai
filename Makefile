.PHONY: all setup dev test build deploy seed train health clean help

all: help

setup: ## Install all dependencies and initialize environment
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install
	cd admin && npm install
	cd mobile && npm install
	cp backend/.env.example backend/.env
	@echo "✅ Setup complete. Edit backend/.env with your credentials."

dev: ## Start all services in development mode using tmux (Linux/WSL)
	docker-compose up -d mongo redis
	tmux new-session -d -s medguard -n backend 'cd backend && . venv/bin/activate && uvicorn app.main:app --reload'
	tmux new-window -t medguard -n frontend 'cd frontend && npm run dev'
	tmux new-window -t medguard -n admin 'cd admin && npm run dev'
	tmux attach-session -t medguard

dev-docker: ## Start the entire clinical stack with Docker Compose
	docker-compose up --build

test: ## Run the complete verification suite (Backend + Frontend)
	cd backend && . venv/bin/activate && pytest tests/ -v
	cd frontend && npm run test -- --run

test-backend: ## Run only specialized backend unit/integration tests
	cd backend && . venv/bin/activate && pytest tests/ -v --tb=short

test-frontend: ## Run only frontend component verification tests
	cd frontend && npm run test -- --run

build: ## Compile production-grade assets for dashboard and admin panels
	cd frontend && npm run build
	cd admin && npm run build

seed: ## Ingest initial pharmacological datasets into MongoDB
	cd backend && . venv/bin/activate && python scripts/seed_drugs.py

train: ## Orchestrate ML model training for interaction synergy weights
	cd backend && . venv/bin/activate && python -m app.ml.model.train

deploy-backend: ## Push backend core to Render environment
	bash backend/scripts/deploy_render.sh

deploy-frontend: ## Push dashboard logic to Vercel edge
	bash frontend/scripts/deploy_vercel.sh

health: ## Execute the master clinical system validation script
	bash scripts/full_system_check.sh

clean: ## Purge build artifacts and local cache files
	rm -rf frontend/dist admin/dist
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -name "*.pyc" -delete

help: ## Show this automated documentation
	@grep -E '^[a-zA-Z_-]+:.*?## .*' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
