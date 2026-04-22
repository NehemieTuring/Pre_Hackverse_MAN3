export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Task {
  id: number;
  title: string;
  description?: string;
  importance: number;
  urgency: number;
  estimatedTimeMinutes: number;   // matches backend field
  dueDate: string;
  status: TaskStatus;
  eisenhowerQuadrant: EisenhowerQuadrant;
  priorityScore: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualTimeSpentMinutes?: number;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageFocusMinutes: number;
  tasksByQuadrant: Record<string, number>;
  byQuadrant?: Record<EisenhowerQuadrant, number>;
  totalTimeSpent?: number;
}

export interface Unavailability {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

export interface ScheduledTaskDTO {
  taskId: number;
  title: string;
  quadrant: EisenhowerQuadrant;
  priorityScore: number;
  dueDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  reason?: string;
}
