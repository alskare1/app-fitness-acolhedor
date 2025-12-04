// Tipos do aplicativo fitness

export type Gender = 'female' | 'male';

export type FemaleFeeling = 
  | 'cramps'
  | 'bloated'
  | 'no-energy'
  | 'stable'
  | 'energized'
  | 'max-energy';

export type MaleFeeling = 
  | 'mentally-tired'
  | 'physically-tired'
  | 'stressed'
  | 'unmotivated'
  | 'stable'
  | 'max-motivation';

export type Feeling = FemaleFeeling | MaleFeeling;

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  gender: Gender;
  goal: string;
  trainingLocation: string;
  equipment: string[];
  trainingTime: number;
  lastPeriodDate?: string;
  createdAt: string;
}

export interface DailyCheckIn {
  date: string;
  feeling: Feeling;
  menstrualPhase?: MenstrualPhase;
}

export interface Exercise {
  name: string;
  description: string;
  duration: number;
  sets?: number;
  reps?: number;
  videoUrl?: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
  totalDuration: number;
  feeling: Feeling;
  completed: boolean;
  completedAt?: string;
  emotionalMessage?: string;
  mealSuggestion?: string;
}

export interface Progress {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  weeklyWorkouts: number[];
  monthlyWorkouts: number[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface QuestionnaireData {
  goal: string;
  trainingLocation: string;
  equipment: string[];
  trainingTime: number;
  gender: Gender;
  lastPeriodDate?: string;
}
