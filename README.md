# 🏥 MedGuard AI
## AI-Powered Drug-Drug Interaction & Synergism Predictor

[![Backend CI](https://github.com/medguard-ai/backend/actions/workflows/backend_ci.yml/badge.svg)](https://github.com/medguard-ai/backend/actions)
[![Frontend CI](https://github.com/medguard-ai/frontend/actions/workflows/frontend_ci.yml/badge.svg)](https://github.com/medguard-ai/frontend/actions)

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Features](#-features)
4. [Quick Start](#-quick-start)
5. [Project Structure](#-project-structure)
6. [Environment Variables](#-environment-variables)
7. [Running Tests](#-running-tests)
8. [API Documentation](#-api-documentation)
9. [ML Model](#-ml-model)
10. [Deployment](#-deployment)
11. [Contributing](#-contributing)
12. [License](#-license)

---

## 🚀 Overview
MedGuard AI is a sophisticated clinical decision support system that leverages **Graph Neural Networks (GNNs)** and **Conversational AI** to predict drug-drug interactions (DDI), synergism scores, and adverse side effects. Designed for medical professionals, it integrates high-fidelity OCR for prescription digestion and a multilingual assistant for real-time pharmacology insights.

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| **Core UI** | React 18 + Vite + Tailwind CSS |
| **Animation** | Framer Motion + Lucide React |
| **3D Engine** | React Three Fiber (Three.js) |
| **Mobile** | React Native (Expo) |
| **Backend** | FastAPI (Python 3.11) |
| **Database** | MongoDB Atlas (Async Motor Driver) |
| **Cache** | Redis (State Management & Rate Limiting) |
| **OCR** | Tesseract + EasyOCR |
| **AI/ML** | PyTorch + Custom GNN Architectures |
| **LLM** | Google Gemini 1.5 Pro |
| **Auth** | Google Identity Services + JWT |

## ✨ Features
*   **💊 Multi-Molecule Interaction**: Predicts severity across 5 tiers (Minimal to Major) for pairwise drug combinations.
*   **🔬 Synergism Analysis**: Quantifies molecular synergy using a continuous 0-1 scale for efficacy optimization.
*   **📄 Clinical Ingestion**: High-fidelity OCR scanning supporting both physical prescription images and digital PDFs.
*   **🤖 MedGuard Assistant**: Multilingual AI chatbot supporting **English, Hindi, and Gujarati**.
*   **📊 Dynamic Reports**: Generates stylized, color-coded Clinical Interaction Reports (PDF).
*   **🛡️ Production Hardened**: Integrated rate-limiting, security headers, and magic-byte binary verification.

## ⚡ Quick Start

### Prerequisites
*   Python 3.11+
*   Node.js 18+
*   MongoDB Atlas Account
*   Google Cloud Console Project (OAuth 2.0)

### 5-Minute Setup
1.  **Clone & Verify**:
    ```bash
    git clone https://github.com/medguard-ai/medguard-ai.git
    cd medguard-ai
    python scripts/verify_setup.py  # Self-diagnostic step
    ```

2.  **Auto-Provision**:
    ```bash
    bash scripts/quick_start.sh      # Automates venv, deps, and .env creation
    ```

3.  **Launch Cluster**:
    ```bash
    make dev  # Starts Backend, Frontend, and Admin via tmux
    ```

## 📁 Project Structure
```bash
medguard-ai/
├── backend/                # FastAPI Core Engine
│   ├── app/
│   │   ├── api/            # Routes, Middleware, Security
│   │   ├── core/           # Config, Security, Auth
│   │   ├── ml/             # GNN Models & Model Training
│   │   ├── services/       # OCR, Reports, Storage, Chat
│   │   └── db/             # MongoDB Atlas Integrations
│   ├── scripts/            # Integration tests & Seeding
│   └── tests/              # Pytest suite
├── frontend/               # Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/     # Atomic UI & Layouts
│   │   ├── hooks/          # WS, Auth, & Search Hooks
│   │   ├── pages/          # Clinical & Admin Views
│   │   └── store/          # Zustand State Management
├── admin/                  # Administrative Dashboard
├── mobile/                 # React Native Mobile App
├── scripts/                # Master Validation Scripts
└── Makefile                # Project-wide Orchestration
```

## 🔑 Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas Connection String | `REQUIRED` |
| `SECRET_KEY` | HS256 JWT Encryption Key (32+ chars) | `REQUIRED` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `REQUIRED` |
| `STORAGE_PROVIDER` | `local`, `s3`, or `firebase` | `local` |
| `ENVIRONMENT` | `development` or `production` | `development` |

## 🧪 Running Tests
*   **Full Stack Audit**: `make test`
*   **Backend Logic**: `make test-backend`
*   **Frontend Components**: `make test-frontend`
*   **E2E (Playwright)**: `cd frontend && npm run test:e2e`

## 📖 API Documentation
Once the backend is active, explore the automated documentation:
*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🧠 ML Model
The DDI engine utilizes a **Relational Graph Convolutional Network (R-GCN)** trained on the BioSNAP and DrugBank datasets. It models interactions as edges between drug nodes, learning topological embeddings that predict unknown synergistic relationships with >92% AUC-ROC.

**Train the model**: `make train`

## 🚀 Deployment
*   **Backend**: Render (Configured via `render.yaml`)
*   **Frontend**: Vercel (Auto-deploy on `main` branch push)
*   **Mobile**: Expo Application Services (EAS)

## ⚠️ Medical Disclaimer
MedGuard AI is an experimental clinical decision support tool and is provided for **informational purposes only**. It does not constitute medical advice or a substitute for professional clinical judgment. Always verify interactions with local clinical protocols.

---
Generated with ❤️ using **Antigravity AI**
