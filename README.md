# 🌉 Skill Setu

> **Bridging the gap between student potential and live industry requirements.**

**https://youtu.be/73-TE42NF2s?si=EX0WzFjnJVjoJe3R**

---

## 📌 Project Overview
**Skill Setu** is an intelligent career navigation platform designed specifically for engineering students in India. The traditional college curriculum often lags behind the fast-paced tech industry. Skill Setu solves this by ingesting live market data and generating highly personalized, week-by-week learning roadmaps. 

Instead of generic advice, our platform tells students exactly what skills employers are demanding *today*, evaluates their current skill gap, and gives them a structured path to become market-ready.

* **Target Audience:** Engineering students and early-career professionals in India.
* **Core Value Proposition:** Real-time job market alignment via AI-curated, actionable roadmaps.
* **Hackathon Track:** [Insert Selected Track Here]

---

## 🛠️ Tech Stack
* **Frontend:** Next.js 15, React 19, Tailwind CSS v4, Recharts
* **Backend:** Node.js, Express.js 5
* **Database:** Google Firebase Firestore
* **Live Search:** SerpApi (`google_jobs` engine)
* **AI Engine:** Google Gemini API (`gemini-2.5-flash`)

---

## 🔍 SerpApi Integration 
Skill Setu heavily relies on **SerpApi** as its primary live data ingestion engine. 
* We utilize the official `serpapi` npm SDK in our backend Node.js pipeline.
* When a student selects a target role, our server instantly queries the **Google Jobs API engine** via SerpApi to scrape live job postings, requirements, and geographic market trends.
* This live context is then fed into our AI layer to ensure the generated roadmaps are based on actual, real-time employer demands rather than outdated static assumptions.

---

## 🤖 AI & Tooling Disclosure 
* **Generative AI Logic:** We utilized **Google Gemini 2.5 Flash** (via `@google/generative-ai` SDK). The LLM processes the live job descriptions scraped by SerpApi alongside the user's current skill profile to intelligently generate the JSON-structured learning roadmaps and skill-gap charts.
* **Development Accelerator:** We utilized **Antigravity (AI IDE)** as a pair-programming assistant to accelerate UI component generation, debug complex React state, and audit our Git merge conflicts and code quality during the hackathon.

---

## 🚀 Setup & Usage Instructions 

We have architected this project to be incredibly easy to run locally. If you do not have certain API keys, our backend features a robust "Circuit Breaker" that will automatically fall back to high-quality mock data so the app will never crash during your evaluation.

### 1. Clone & Install Dependencies
First, clone the repository and install dependencies for both the frontend and backend.
```bash
git clone https://github.com/AdityaKumar-9716/Skill-Setu.git
cd Skill-Setu

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd server
npm install
```

### 2. Configure Environment Variables
You will need to configure the `.env` files for the backend. We have provided an example file for you.

Navigate to the `server/` directory and duplicate `.env.example` into a new `.env` file:
```bash
# In the server/ directory
cp .env.example .env
```

Open the new `server/.env` file and insert your keys:
```env
PORT=5000
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here
FIREBASE_KEY_PATH=./firebase-key.json # (Optional)
```
*(Note: If you do not have a Firebase service account key, leave it as-is. The backend will automatically boot Firestore in mock mode!)*

### 3. Run the Project Locally
You will need two terminal windows to run both servers concurrently.

**Terminal 1: Start the Backend**
```bash
cd server
npm run dev
```
*The Express server will start on `http://localhost:5000`*

**Terminal 2: Start the Frontend**
```bash
# From the root Skill-Setu directory
npm run dev
```
*The Next.js website will start on `http://localhost:3000`*

Open `http://localhost:3000` in your browser and experience Skill Setu!

---

## 👥 Team Roster
| Name | Role / Focus |
| :--- | :--- |
| **Aditya** | Project Lead, Backend Architecture, SerpApi Integration |
| **Paarth** | Frontend Lead, React/Next.js UI, Tailwind Styling |
| **Alisha** | AI Integration (Gemini), Prompt Engineering |
| **Rohit** | Database (Firebase) & State Management |
| **Prabha** | Presentation, Video Demo, & QA |


