# 🌉 Skill Setu

> **Bridging the gap between student potential and live industry requirements.**

Built for the **SerpApi India Hackathon 2026**.

## 📌 Overview
Skill Setu uses live web intelligence via **SerpApi (Google Jobs)**, **Google Gemini 2.5 Flash**, and **Google Firebase Firestore** to analyze real-time job market requirements, evaluate student skill levels, and deliver personalized, cloud-saved learning roadmaps.

## 🛠️ Tech Stack
- **Frontend / Website:** Next.js 15, React 19, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend / Server:** Node.js, Express.js 5, Helmet, CORS, Rate Limiting
- **Database & Cloud Storage:** Google Firebase Firestore (`firebase-admin`, Project ID: `skill-setu3993`)
- **Search Engine:** SerpApi (`google_jobs` engine)
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`)

## 👥 Team
- **Member 1 (Lead & Integration):** Repository, Architecture, Deployment
- **Member 2 (Frontend):** React UI/UX, Dashboard, Visualizations
- **Member 3 (Backend):** Express APIs, Database (Firebase Firestore), Business Logic
- **Member 4 (SerpApi):** Live Job Search & Requirement Extraction
- **Member 5 (AI Engine):** Skill Gap Analysis & Roadmap Generation

---

## 🔑 Firebase Integration

The project is integrated with Google Firebase Firestore (Project: `skill-setu3993`):

1. **Service Account Key Placement**:
   Place your private service account key at:
   ```
   server/firebase-key.json
   ```
   *(This file is automatically protected by `.gitignore` and never committed).*

2. **Environment Configuration**:
   - `server/.env`:
     ```env
     PORT=5000
     FIREBASE_KEY_PATH=./firebase-key.json
     FIREBASE_PROJECT_ID=skill-setu3993
     ```
   - `.env.local` (Root Website):
     ```env
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=skill-setu3993
     NEXT_PUBLIC_API_URL=http://localhost:5000/api/analyze
     ```

3. **Firestore Collections**:
   - `roadmaps`: Stores generated audit roadmaps, gap breakdowns, and metadata indexed by user/document ID.
   - `users`: Stores persistent student profiles and calibration states.
   - `health_check`: Automated ping tests verifying read/write latency.

---

## 📡 API Endpoints & Contract

### 1. Health & Database Connectivity
* **`GET /health`** — Server status and uptime
* **`GET /test-db`** — Live Firestore read/write verification
* **`GET /api/analyze/firebase-status`** — Firestore connectivity & active Project ID

### 2. Live Job Search (SerpApi)
* **`GET /api/jobs/search?role={role}&location={location}`**
* Response: Array of live scraped jobs from Google Jobs via SerpApi.

### 3. Master Pipeline Route (SerpApi + Gemini + Firestore)
* **`POST /api/analyze/full-audit`**
* **Request Body:**
  ```json
  {
    "studentSkills": ["React", "JavaScript", "HTML", "CSS"],
    "targetRole": "Frontend Developer",
    "location": "India",
    "userId": "student@example.com"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "source": "Skill Setu Live Engine (Gemini + SerpApi)",
    "databaseId": "student_example_com_1791564214",
    "auditResult": { ... }
  }
  ```

### 4. Firestore Document Retrieval & Bookmarking
* **`GET /api/analyze/roadmap/:id`** — Retrieve a saved roadmap by document ID
* **`POST /api/analyze/save-roadmap`** — Manually bookmark/save roadmap snapshot
* **`POST /api/analyze/user-profile`** — Save student profile to Firestore
* **`GET /api/analyze/user-profile/:id`** — Get student profile from Firestore

---

## 🚀 Running the Project

### Start the Backend Server:
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:5000`.

### Start the Website (Next.js):
```bash
npm install
npm run dev
```
Website opens at `http://localhost:3000`.
