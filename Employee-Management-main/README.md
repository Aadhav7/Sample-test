# Teceze Employee Management System

A full-stack Employee Management System built with React + Vite (frontend) and Express 5 + MongoDB Atlas (backend).

## 🚀 Features

- **Dashboard** — Live stat cards: Total Employees, Total Payroll, Average Salary, Top Designation
- **Employee Management** — Add, Edit, Delete, Search employees (with auto-generated employee numbers)
- **Reports & Analytics** — Salary charts and role distribution
- **Neumorphic UI** — Soft blue-gray design system with smooth animations

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TailwindCSS v4 + Shadcn/UI |
| Backend | Express 5 + Mongoose + MongoDB Atlas |
| Validation | Zod |
| State | TanStack Query (React Query) |
| Routing | Wouter |

## 📦 Prerequisites

- **Node.js** v20+ ([download](https://nodejs.org))
- **pnpm** v9+ — install with `npm install -g pnpm`

## 🔧 Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

The `.env` files are already pre-configured in:
- `backend/.env` — API server settings
- `frontend/.env` — Frontend settings

> ⚠️ Make sure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (Network Access settings).

### 3. Start the API Server (Terminal 1)

```bash
pnpm --filter @workspace/api-server run dev
```

API will be available at: `http://localhost:8080`

### 4. Start the Frontend (Terminal 2)

```bash
pnpm --filter @workspace/teceze-ems run dev
```

Frontend will be available at: `http://localhost:5173`

## 🏗️ Build for Production

```bash
# Build both frontend and backend
pnpm run build

# Or build individually:
pnpm --filter @workspace/teceze-ems run build      # → frontend/dist/public/
pnpm --filter @workspace/api-server run build       # → backend/dist/
```

## 🌐 Deployment

This project is optimized for deployment to free cloud hosting platforms:
- **Frontend** → Vercel (free static hosting)
- **Backend** → Render (100% free tier for Web Services, no credit card required) or Railway (pay-as-you-go)

---

### 1. Backend Deployment

#### Option A: Render.com (100% Free, Recommended)
1. Sign up/log in to [Render.com](https://render.com).
2. Click **New** → **Web Service**.
3. Connect your public GitHub repository.
4. Set the following configuration options:
   - **Name**: `teceze-ems-api` (or any custom name)
   - **Language/Runtime**: `Node`
   - **Build Command**: `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server run build`
   - **Start Command**: `node --enable-source-maps backend/dist/index.mjs`
5. Under **Environment Variables**, add:
   - `PORT`: `8080`
   - `MONGODB_URI`: `mongodb+srv://digee12_db_user:jt5FsY800AqYvRgS@cluster0.ci04zrn.mongodb.net`
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: `<any-secure-random-string>`
6. Click **Deploy Web Service**. Once deployed, copy your service URL (e.g., `https://teceze-ems-api.onrender.com`).

#### Option B: Railway.app
1. Go to [railway.app](https://railway.app) → Deploy from GitHub.
2. Under **Variables**, add:
   - `PORT`: `8080`
   - `MONGODB_URI`: `mongodb+srv://digee12_db_user:jt5FsY800AqYvRgS@cluster0.ci04zrn.mongodb.net`
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: `<any-secure-random-string>`
3. Railway will automatically build and start the server using the `railway.toml` at the root. Copy your public service domain URL.

---

### 2. Frontend Deployment (Vercel)

1. Open your local `vercel.json` file in the root directory.
2. In the `rewrites` section, replace `YOUR_BACKEND_URL` with your actual live backend URL from Render or Railway (e.g. `teceze-ems-api.onrender.com`).
   *Note: Do not include `https://` in `YOUR_BACKEND_URL` because it's already in the template, e.g. `https://teceze-ems-api.onrender.com/api/$1`.*
3. Commit and push this change to GitHub.
4. Go to [Vercel.com](https://vercel.com) and import your GitHub repository.
5. Keep **Root Directory** as the root `/`.
6. Add one **Environment Variable** (Optional, for API direct requests):
   - `VITE_API_URL`: `https://YOUR_BACKEND_URL` (replace with your backend domain URL)
7. Click **Deploy**. Vercel will automatically build the monorepo and serve the frontend at a `.vercel.app` URL.

## 📁 Project Structure

```
Teceze-UI/
+-- frontend/              # React + Vite frontend
�   +-- src/
�       +-- pages/         # Dashboard, Employees, Reports
�       +-- components/    # Layout, Employee modals
+-- backend/               # Express 5 backend
�   +-- src/
�       +-- routes/        # /api/employees CRUD
�       +-- models/        # Mongoose Employee model
�       +-- lib/           # MongoDB connection, logger
+-- lib/
�   +-- api-client-react/  # Generated React Query hooks
�   +-- api-zod/           # Zod validation schemas
+-- vercel.json            # Vercel deployment config
+-- railway.toml           # Railway deployment config
+-- pnpm-workspace.yaml    # pnpm monorepo config
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/stats` | Get dashboard stats |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/health` | Health check |
