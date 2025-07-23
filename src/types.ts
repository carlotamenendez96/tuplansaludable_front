export enum UserRole {
  USER = 'USER',
  TRAINER = 'TRAINER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trainerId?: string;
  clients?: string[]; // Only for trainers
}

export interface Meal {
  name: string;
  time: string;
  foods: string[];
}

export interface Supplement {
  name: string;
  dose: string;
}

export interface DietPlan {
  userId: string;
  name: string;
  dailyActivity: string;
  supplementation: Supplement[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: Meal[];
  startDate?: string;
  endDate?: string;
  notes?: string;
  description?: string;
}


export interface Exercise {
  name: string;
  type: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
}

export interface Workout {
  _id?: string;
  userId: string;
  day: string;
  name: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface WorkoutPlan {
  userId: string;
  trainerId: string;
  title: string;
  schedule: string[];
  startDate: string;
  isActive: boolean;
  workouts: Workout[];
}

export interface ProgressPhotos {
  front: string;
  side: string;
  back: string;
}

export interface ProgressLog {
  date: string;
  weight?: number;
  measurements?: { [key: string]: number };
  sensations: string;
  photos?: ProgressPhotos; // URL to the uploaded photo
  dietCompliance: number; // 1-10
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    isAIMessage?: boolean;
}

export interface Recipe {
  recipeName: string;
  description: string;
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients: string[];
  instructions: string[];
}