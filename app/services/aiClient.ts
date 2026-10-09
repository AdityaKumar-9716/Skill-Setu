// app/services/aiClient.ts
/**
 * Skill Setu Frontend AI Service Client
 *
 * Provides a clean, typed interface for the frontend to consume
 * the backend AI analysis endpoints:
 * - Skill Analysis
 * - Skill Gap Analysis
 * - Career Recommendation
 * - Opportunity / Company Matching
 * - Profile / Resume Analysis
 * - Personalized Learning Roadmap
 * - Full Audit Pipeline
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/analyze';

export interface StudentProfilePayload {
  studentName?: string;
  name?: string;
  studentSkills?: string[] | Record<string, number>;
  skills?: string[] | Record<string, number>;
  targetRole?: string;
  careerGoal?: string;
  projects?: Array<{
    title: string;
    description?: string;
    techStack?: string[] | string;
    link?: string;
  }>;
  experience?: Array<{
    role: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  certifications?: string[];
  education?: {
    degree?: string;
    college?: string;
    branch?: string;
    year?: string | number;
  };
  interests?: string[] | string;
  location?: string;
}

async function postAI(endpoint: string, payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch from AI service`);
    }

    return await res.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.warn(`[Skill Setu AI Client] Error connecting to ${endpoint}:`, error);
    throw error;
  }
}

export const aiClient = {
  // 1. AI Skill Analysis
  async analyzeSkills(profile: StudentProfilePayload) {
    return postAI('/skills', profile as Record<string, unknown>);
  },

  // 2. AI Skill Gap Analysis
  async analyzeSkillGap(profile: StudentProfilePayload, targetRole?: string) {
    return postAI('/skill-gap', { ...profile, targetRole } as Record<string, unknown>);
  },

  // 3. AI Career Recommendation
  async recommendCareers(profile: StudentProfilePayload) {
    return postAI('/career-recommendation', profile as Record<string, unknown>);
  },

  // 4. AI Opportunity / Company Matching
  async matchOpportunities(profile: StudentProfilePayload, options?: { minMatchScore?: number }) {
    return postAI('/opportunity-match', { ...profile, ...options } as Record<string, unknown>);
  },

  // 5. AI Profile / Resume Analysis
  async analyzeProfile(profile: StudentProfilePayload) {
    return postAI('/profile', profile as Record<string, unknown>);
  },

  // 6. AI Personalized Learning Roadmap
  async generateLearningRoadmap(profile: StudentProfilePayload, targetRole?: string) {
    return postAI('/roadmap', { ...profile, targetRole } as Record<string, unknown>);
  },

  // 7. Full Audit Pipeline
  async runFullAudit(profile: StudentProfilePayload, targetRole?: string, location?: string, userId?: string) {
    return postAI('/full-audit', {
      studentSkills: Array.isArray(profile.studentSkills)
        ? profile.studentSkills
        : Object.keys(profile.skills || {}),
      targetRole: targetRole || profile.targetRole || 'Software Developer',
      location: location || profile.location || 'India',
      userId: userId || profile.studentName || profile.name,
    });
  },

  // 8. Firebase Firestore Data Services
  async getFirebaseStatus() {
    const res = await fetch(`${API_BASE}/firebase-status`);
    return await res.json();
  },

  async getSavedRoadmap(docId: string) {
    const res = await fetch(`${API_BASE}/roadmap/${encodeURIComponent(docId.trim())}`);
    return await res.json();
  },

  async saveRoadmap(userId: string, roadmapData: Record<string, unknown>) {
    return postAI('/save-roadmap', { userId, roadmapData });
  },

  async saveUserProfile(userId: string, profile: Record<string, unknown>) {
    return postAI('/user-profile', { userId, profile });
  },

  async getUserProfile(userId: string) {
    const res = await fetch(`${API_BASE}/user-profile/${encodeURIComponent(userId)}`);
    return await res.json();
  },
};
