# BookYourService

This project is a full-stack application for a service booking platform, featuring a Node.js/Express backend and a React/Vite frontend.

This repository has been professionally refactored to incorporate production-grade best practices, security hardening, and a robust, maintainable project structure.

---

## ✅ Features & Key Improvements

This codebase has been significantly upgraded. Key improvements include:

### Backend
- **Production-Grade Structure:** The Express application is now cleanly separated. `server.ts` acts as the lean server entry point, while `src/app.ts` contains all application logic, middleware, and route configuration.
- **Security Hardening:**
    - **CORS:** Implemented a strict, environment-aware CORS policy to prevent unauthorized cross-origin requests.
    - **Rate Limiting:** Integrated `express-rate-limit` to protect all API endpoints from abuse and brute-force attacks.
    - **Security Headers:** Added `helmet` to apply 11 key security-related HTTP headers as a first line of defense.
- **API Documentation:**
    - Integrated **Swagger/OpenAPI** for automated, interactive API documentation.
    - Documentation is generated from code comments and is available at the `/api-docs` endpoint.
- **Centralized Configuration:** All keys and secrets are managed through a `.env` file, with a comprehensive `.env.example` provided for easy setup.

### Frontend
- **Centralized & Data-Driven Routing:** Migrated from hardcoded routes to a centralized `src/routes/routeConfig.ts`. This makes adding or protecting routes simple and maintainable.
- **Application Resilience:** Implemented a global **React Error Boundary** that wraps the entire application, preventing a UI crash in one component from taking down the whole page.
- **Maintainable Auth Logic:** Refactored the `ProtectedRoute` component to use a `useAuth` hook, decoupling it from direct `localStorage` access and improving testability.
- **API Type Safety:** Created a central `src/api/types.ts` file to serve as a contract for API request and response shapes, improving developer experience and reducing bugs.

### DevOps
- **Continuous Integration:** A **GitHub Actions CI pipeline** (`.github/workflows/ci.yml`) is configured to automatically build and validate both the frontend and backend on every push and pull request, ensuring code integrity and preventing broken builds.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later)
- `npm`

### Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Fill in the required variables in the `.env` file (e.g., `DATABASE_URL`).
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Run the development server:
    ```bash
    npm run dev
    ```
The API will be available at `http://localhost:4000` (or the `PORT` specified in your `.env`).

### Frontend Setup
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Fill in the required variables in the `.env` file (e.g., `VITE_API_BASE_URL`).
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Run the development server:
    ```bash
    npm run dev
    ```
The application will be available at `http://localhost:5173`.
