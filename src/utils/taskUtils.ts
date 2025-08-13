import { Task, TaskCategory, FilterState } from '../types';
import { addWeeks, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const filterTasks = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
      return false;
    }

    // Time filter
    if (filters.timeFilter) {
      const now = new Date();
      const weeks = parseInt(filters.timeFilter.replace('weeks', ''));
      const futureDate = addWeeks(now, weeks);
      
      const taskInterval = {
        start: startOfDay(task.startDate),
        end: endOfDay(task.endDate)
      };
      
      const filterInterval = {
        start: startOfDay(now),
        end: endOfDay(futureDate)
      };
      
      if (!isWithinInterval(task.startDate, filterInterval) && 
          !isWithinInterval(task.endDate, filterInterval)) {
        return false;
      }
    }

    // Search filter
    if (filters.searchTerm && !task.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });
};

export const getTasksForDay = (tasks: Task[], date: Date): Task[] => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return tasks.filter(task => {
    return task.startDate <= dayEnd && task.endDate >= dayStart;
  });
};

export const generateTaskId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTaskPosition = (task: Task, dayDate: Date): { left: number; width: number } => {
  const dayStart = startOfDay(dayDate);
  const taskStart = startOfDay(task.startDate);
  const taskEnd = endOfDay(task.endDate);
  
  if (taskStart <= dayStart && taskEnd >= dayStart) {
    // Task starts before or on this day
    const daysFromStart = Math.max(0, (dayStart.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.min(7, (taskEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60 * 24) + 1);
    
    return {
      left: (daysFromStart / 7) * 100,
      width: (remainingDays / 7) * 100
    };
  }
  
  return { left: 0, width: 100 };
}; 