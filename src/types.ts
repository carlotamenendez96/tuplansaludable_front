export enum UserRole {
  USER = 'USER',
  TRAINER = 'TRAINER',
}

export interface User {
  id?: string;
  _id?: string;
  name?: string; // Para compatibilidad con datos mock
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role: UserRole;
  trainerId?: string;
  clients?: string[]; // Only for trainers
}

export interface Food {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Meal {
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foods: {
    food: Food;
    quantity: number;
  }[];
  totalCalories: number;
  notes?: string;
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
  actualMacros?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  totals?: {
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
  description?: string;
  instructions?: string[];
  targetMuscles?: string[];
  equipment?: string[];
  difficulty?: string;
  reps?: number;
  duration?: number;
  notes?: string;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export enum WorkoutCategory {
  CARDIO = 'CARDIO',
  STRENGTH_UPPER_1 = 'STRENGTH_UPPER_1',
  STRENGTH_UPPER_2 = 'STRENGTH_UPPER_2',
  STRENGTH_LOWER_1 = 'STRENGTH_LOWER_1',
  STRENGTH_LOWER_2 = 'STRENGTH_LOWER_2',
  FLEXIBILITY = 'FLEXIBILITY'
}

export interface Workout {
  _id?: string;
  name: string;
  category: WorkoutCategory;
  exercises: WorkoutExercise[];
  estimatedDuration?: number;
  difficulty?: string;
  notes?: string;
}

export interface ScheduleItem {
  dayOfWeek: number;
  workoutIndex: number;
}

export interface WorkoutPlan {
  _id?: string;
  userId: string;
  trainerId: string;
  title: string;
  description?: string;
  workouts: Workout[];
  schedule: ScheduleItem[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
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