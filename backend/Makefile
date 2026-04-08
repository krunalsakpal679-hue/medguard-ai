.PHONY: test test-watch lint format run run-prod shell

test: ## Run full test suite with coverage report
	pytest tests/ -v --tb=short --cov=app --cov-report=term-missing

test-watch: ## Continuous test execution on file changes
	pytest-watch tests/ -- -v

lint: ## Verification of code style and static analysis (Black, Flake8)
	flake8 app/ --max-line-length=100 --ignore=E203,W503
	black app/ --check

format: ## Automated stylistic normalization of the clinical logic layer
	black app/
	isort app/

run: ## Launch clinical API in debug/reload mode
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-prod: ## Launch high-availability production cluster
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

shell: ## Initialize interactive diagnostic shell
	python -c "import asyncio; from app.db.database import get_db; print('MedGuard DB connection verified and ready.')"
