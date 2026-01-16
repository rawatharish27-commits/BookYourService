# BookYourService: Enterprise Service Fulfillment Platform

Professional-grade monorepo for a high-frequency home service marketplace.

## 🏗️ Project Structure

```text
bookyourservice/
├── frontend/           # Vite + React (UI Layer)
├── backend/            # Node.js + Enterprise Services (Logic Layer)
├── cloud/              # GCP Cloud Build & Deployment Configs
└── database/           # Schema & Migration scripts
```

## 🚀 Deployment (Cloud Run)

### Frontend
1. `cd frontend`
2. `gcloud builds submit --config ../cloud/cloudbuild.frontend.yaml`

### Backend
1. `cd backend`
2. `gcloud builds submit --config ../cloud/cloudbuild.backend.yaml`

## 🛡️ Core Modules
- **Service Ontology**: 2,000+ system-locked problem nodes.
- **AI Intelligence**: Predictive demand, fraud scoring, and provider ranking.
- **Financial Gateway**: Atomic ledger with transaction-level auditing.
- **Visual Diagnostics**: Gemini-powered technical fault analysis.
