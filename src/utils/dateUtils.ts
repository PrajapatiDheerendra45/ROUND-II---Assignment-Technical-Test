import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addDays, differenceInDays } from 'date-fns';

export const getCalendarDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDayNumber = (date: Date): string => {
  return format(date, 'd');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return isSameMonth(date, currentDate);
};

export const isTodayDate = (date: Date): boolean => {
  return isToday(date);
};

export const getDaysBetween = (startDate: Date, endDate: Date): Date[] => {
  const days: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

export const getTaskDuration = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate) + 1;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'To Do': '#3B82F6',
    'In Progress': '#F59E0B',
    'Review': '#8B5CF6',
    'Completed': '#10B981'
  };
  return colors[category] || '#6B7280';
}; 