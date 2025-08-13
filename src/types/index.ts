export type TaskCategory = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: Date;
  endDate: Date;
  color: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export interface DragSelection {
  startDate: Date | null;
  endDate: Date | null;
  isSelecting: boolean;
}

export interface FilterState {
  categories: TaskCategory[];
  timeFilter: '1week' | '2weeks' | '3weeks' | null;
  searchTerm: string;
}

export interface TaskModalState {
  isOpen: boolean;
  task: Partial<Task> | null;
  mode: 'create' | 'edit';
} 