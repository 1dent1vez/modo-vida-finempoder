// src/types/lesson.ts

export type LessonStatus = 'locked' | 'active' | 'completed';

export interface LessonProgress {
  id?: number;      // ID autogenerado por la base de datos (Dexie)
  moduleId: string; // Ej: 'presupuesto'
  lessonId: string; // Ej: 'L01'
  completed: boolean;
  score?: number;   // Calificación opcional (0-100)
  updatedAt: string;// Fecha en formato ISO
  
  // Opcional: para compatibilidad si antes usabas completedAt
  completedAt?: string; 
}

// Definición general de una lección (para listas y menús)
export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  description?: string;
  status?: LessonStatus;
  completed?: boolean;
  score?: number;
}