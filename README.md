<<<<<<< HEAD
# ��� Skill Setu
=======
# Skill Setu
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e

> **Bridging the gap between student potential and live industry requirements.**

Built for the **SerpApi India Hackathon 2026**.

<<<<<<< HEAD
## ��� Overview
Skill Setu uses live web intelligence via **SerpApi (Google Jobs)** and **Google Gemini** to analyze real-time job market requirements, evaluate student skill levels, and deliver personalized learning roadmaps.

## ���️ Tech Stack
=======
##  Overview
Skill Setu uses live web intelligence via **SerpApi (Google Jobs)** and **Google Gemini** to analyze real-time job market requirements, evaluate student skill levels, and deliver personalized learning roadmaps.

## Tech Stack
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database & Auth:** Firebase Firestore & Authentication
- **Search Engine:** SerpApi (`google_jobs` engine)
- **AI Engine:** Google Gemini API

<<<<<<< HEAD
## ��� Team
=======
## Team
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e
- **Member 1 (Lead & Integration):** Repository, Architecture, Deployment
- **Member 2 (Frontend):** React UI/UX, Dashboard, Visualizations
- **Member 3 (Backend):** Express APIs, Database, Business Logic
- **Member 4 (SerpApi):** Live Job Search & Requirement Extraction
- **Member 5 (AI Engine):** Skill Gap Analysis & Roadmap Generation
---

<<<<<<< HEAD
## 📡 API Endpoints & Contract
=======
##  API Endpoints & Contract
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e

### 1. Health Check
* **Endpoint:** `GET /health`
* **Response:** `{ status: "online", message: "..." }`

### 2. Live Job Search (SerpApi)
* **Endpoint:** `GET /api/jobs/search?role={role}&location={location}`
* **Response:** Returns an array of live scraped jobs.

### 3. Full Skill Setu Audit (Pipeline Orchestrator)
* **Endpoint:** `POST /api/analyze/full-audit`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "studentSkills": ["React", "JavaScript", "HTML", "CSS"],
    "targetRole": "Frontend Developer",
    "location": "India"
<<<<<<< HEAD
  }
=======
  }
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e
