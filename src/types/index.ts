export type Priority = 1 | 2 | 3 | 4; // 4 is highest priority, 1 is lowest

// Define a frequency for recurring tasks
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null;

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 days, every 3 weeks
  endDate?: Date | null;
  count?: number | null; // number of occurrences
  daysOfWeek?: number[]; // for weekly recurrence (0 = Sunday, 6 = Saturday)
  dayOfMonth?: number; // for monthly recurrence
  monthOfYear?: number; // for yearly recurrence
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date | null;
  priority: Priority;
  projectId: string;
  createdAt: Date;
  labelIds: string[];
  order?: number; // Optional order field for sorting
  recurringConfig?: Recurrence | null; // Optional recurrence settings
  parentId?: string | null; // For subtasks, reference to parent task
}

export interface Subtask extends Omit<Task, 'projectId' | 'labelIds'> {
  parentId: string; // Required parent task reference
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  selectedProjectId: string | null;
  selectedLabelId: string | null;
  selectedTask: Task | null;
  view: 'today' | 'upcoming' | 'project' | 'label' | 'all';
}