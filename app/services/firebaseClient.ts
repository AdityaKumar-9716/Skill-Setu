// app/services/firebaseClient.ts
/**
 * Skill Setu Firebase Client Integration
 * 
 * Provides web client methods to interface with the Skill Setu
 * Firebase Firestore infrastructure (Project: skill-setu3993).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/analyze';
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skill-setu3993';

export interface FirebaseStatus {
  connected: boolean;
  isConfigured?: boolean;
  projectId: string;
  provider: string;
  testedAt?: string;
  error?: string;
}

export interface SavedRoadmapResponse {
  success: boolean;
  source?: string;
  databaseId?: string;
  roadmap?: any;
  error?: string;
}

/**
 * Check connectivity to Firebase Firestore
 */
export async function checkFirebaseHealth(): Promise<FirebaseStatus> {
  try {
    const res = await fetch(`${API_BASE}/firebase-status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.database || {
      connected: true,
      projectId: FIREBASE_PROJECT_ID,
      provider: 'Firebase Firestore',
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: FIREBASE_PROJECT_ID,
      provider: 'Firebase Firestore',
      error: err.message || 'Offline',
    };
  }
}

/**
 * Load a saved roadmap from Firebase Firestore by Document ID
 */
export async function loadRoadmapFromFirestore(docId: string): Promise<SavedRoadmapResponse> {
  try {
    const res = await fetch(`${API_BASE}/roadmap/${encodeURIComponent(docId.trim())}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch roadmap from Firestore',
    };
  }
}

/**
 * Save / Bookmark an existing roadmap or audit state to Firestore
 */
export async function saveRoadmapToFirestore(userId: string, roadmapData: any): Promise<{ success: boolean; databaseId?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/save-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roadmapData }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to save roadmap to Firestore',
    };
  }
}

/**
 * Save user profile to Firestore
 */
export async function syncUserProfileToFirestore(userId: string, profile: any): Promise<{ success: boolean; userId?: string }> {
  try {
    const res = await fetch(`${API_BASE}/user-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profile }),
    });
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}
