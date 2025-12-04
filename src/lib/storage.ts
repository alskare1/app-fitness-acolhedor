// Sistema de persistência local (MVP)
import { UserProfile, Workout, Progress, DailyCheckIn } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'flowfit_user_profile',
  WORKOUTS: 'flowfit_workouts',
  PROGRESS: 'flowfit_progress',
  DAILY_CHECKINS: 'flowfit_checkins',
  ONBOARDING_COMPLETED: 'flowfit_onboarding',
  QUESTIONNAIRE_COMPLETED: 'flowfit_questionnaire',
  HAS_SUBSCRIPTION: 'flowfit_subscription'
};

// User Profile
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }
}

export function getUserProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// Workouts
export function saveWorkout(workout: Workout): void {
  if (typeof window !== 'undefined') {
    const workouts = getWorkouts();
    workouts.push(workout);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  }
}

export function getWorkouts(): Workout[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

export function updateWorkout(workoutId: string, updates: Partial<Workout>): void {
  if (typeof window !== 'undefined') {
    const workouts = getWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    }
  }
}

// Progress
export function saveProgress(progress: Progress): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }
}

export function getProgress(): Progress {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) return JSON.parse(data);
  }
  
  return {
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
    monthlyWorkouts: Array(12).fill(0),
    badges: []
  };
}

// Daily Check-ins
export function saveDailyCheckIn(checkIn: DailyCheckIn): void {
  if (typeof window !== 'undefined') {
    const checkIns = getDailyCheckIns();
    checkIns.push(checkIn);
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKINS, JSON.stringify(checkIns));
  }
}

export function getDailyCheckIns(): DailyCheckIn[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKINS);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

export function getTodayCheckIn(): DailyCheckIn | null {
  const today = new Date().toISOString().split('T')[0];
  const checkIns = getDailyCheckIns();
  return checkIns.find(c => c.date === today) || null;
}

// Onboarding
export function setOnboardingCompleted(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }
}

export function isOnboardingCompleted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }
  return false;
}

// Questionnaire
export function setQuestionnaireCompleted(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRE_COMPLETED, 'true');
  }
}

export function isQuestionnaireCompleted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRE_COMPLETED) === 'true';
  }
  return false;
}

// Subscription
export function setHasSubscription(value: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HAS_SUBSCRIPTION, value.toString());
  }
}

export function hasSubscription(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.HAS_SUBSCRIPTION) === 'true';
  }
  return false;
}
