import React, { useState, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Task, DragSelection } from '../types';
import { getCalendarDays, formatMonthYear, isCurrentMonth, isTodayDate } from '../utils/dateUtils';
import { getTasksForDay } from '../utils/taskUtils';
import CalendarDay from './CalendarDay';
import TaskBar from './TaskBar';

interface CalendarProps {
  currentDate: Date;
  tasks: Task[];
  dragSelection: DragSelection;
  onDragSelectionChange: (selection: DragSelection) => void;
  onTaskSelect: (task: Task) => void;
  onTaskMove: (taskId: string, newStartDate: Date) => void;
  onTaskResize: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  onTaskDelete: (taskId: string) => void;
  onSelectionComplete: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  tasks,
  dragSelection,
  onDragSelectionChange,
  onTaskSelect,
  onTaskMove,
  onTaskResize,
  onTaskDelete,
  onSelectionComplete
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<{ task: Task; edge: 'left' | 'right' } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const calendarDays = getCalendarDays(currentDate);
  const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handleMouseDown = (e: React.MouseEvent, date: Date) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const rect = calendarRef.current?.getBoundingClientRect();
    if (!rect) return;

    onDragSelectionChange({
      startDate: date,
      endDate: date,
      isSelecting: true
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragSelection.isSelecting || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which day cell the mouse is over
    const cellWidth = rect.width / 7;
    const cellHeight = (rect.height - 60) / 6; // Subtract header height
    const col = Math.floor(x / cellWidth);
    const row = Math.floor((y - 60) / cellHeight);

    const dayIndex = row * 7 + col;
    if (dayIndex >= 0 && dayIndex < calendarDays.length) {
      const currentDate = calendarDays[dayIndex];
      
      if (dragSelection.startDate) {
        const start = new Date(Math.min(dragSelection.startDate.getTime(), currentDate.getTime()));
        const end = new Date(Math.max(dragSelection.startDate.getTime(), currentDate.getTime()));
        
        onDragSelectionChange({
          ...dragSelection,
          endDate: end
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (dragSelection.isSelecting && dragSelection.startDate && dragSelection.endDate) {
      onDragSelectionChange({
        ...dragSelection,
        isSelecting: false
      });
      onSelectionComplete();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDraggedTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!draggedTask) return;

    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('day-')) {
      const dateStr = overId.replace('day-', '');
      const targetDate = new Date(dateStr);
      
      // Update the dragged task position for visual feedback
      const duration = draggedTask.endDate.getTime() - draggedTask.startDate.getTime();
      const newStartDate = new Date(targetDate);
      const newEndDate = new Date(targetDate.getTime() + duration);
      
      setDraggedTask({
        ...draggedTask,
        startDate: newStartDate,
        endDate: newEndDate
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!draggedTask) return;

    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('day-')) {
      const dateStr = overId.replace('day-', '');
      const targetDate = new Date(dateStr);
      onTaskMove(draggedTask.id, targetDate);
    }

    setDraggedTask(null);
  };

  const handleResizeStart = (task: Task, edge: 'left' | 'right') => {
    setResizingTask({ task, edge });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingTask || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cellWidth = rect.width / 7;
    const col = Math.floor(x / cellWidth);
    
    const dayIndex = Math.max(0, Math.min(col, calendarDays.length - 1));
    const newDate = calendarDays[dayIndex];

    if (resizingTask.edge === 'left') {
      if (newDate < resizingTask.task.endDate) {
        setResizingTask({
          task: { ...resizingTask.task, startDate: newDate },
          edge: 'left'
        });
      }
    } else {
      if (newDate > resizingTask.task.startDate) {
        setResizingTask({
          task: { ...resizingTask.task, endDate: newDate },
          edge: 'right'
        });
      }
    }
  };

  const handleResizeEnd = () => {
    if (resizingTask) {
      onTaskResize(resizingTask.task.id, resizingTask.task.startDate, resizingTask.task.endDate);
      setResizingTask(null);
    }
  };

  const isDateInSelection = (date: Date): boolean => {
    if (!dragSelection.startDate || !dragSelection.endDate) return false;
    const start = new Date(Math.min(dragSelection.startDate.getTime(), dragSelection.endDate.getTime()));
    const end = new Date(Math.max(dragSelection.startDate.getTime(), dragSelection.endDate.getTime()));
    return date >= start && date <= end;
  };

  // Calculate task positions with proper stacking
  const getTaskPositions = () => {
    const taskPositions: Array<{
      task: Task;
      left: number;
      width: number;
      top: number;
      zIndex: number;
    }> = [];

    // Group tasks by their week and calculate positions
    tasks.forEach((task, taskIndex) => {
      const taskStartDay = Math.floor((task.startDate.getTime() - calendarDays[0].getTime()) / (1000 * 60 * 60 * 24));
      const taskEndDay = Math.floor((task.endDate.getTime() - calendarDays[0].getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate which week this task starts in
      const startWeek = Math.floor(taskStartDay / 7);
      const endWeek = Math.floor(taskEndDay / 7);
      
      // For each week the task spans, create a position entry
      for (let week = startWeek; week <= endWeek; week++) {
        const weekStartDay = week * 7;
        const weekEndDay = weekStartDay + 6;
        
        // Calculate the portion of the task that falls in this week
        const weekTaskStart = Math.max(taskStartDay, weekStartDay);
        const weekTaskEnd = Math.min(taskEndDay, weekEndDay);
        
        if (weekTaskStart <= weekTaskEnd) {
          const left = ((weekTaskStart - weekStartDay) / 7) * 100;
          const width = ((weekTaskEnd - weekTaskStart + 1) / 7) * 100;
          
          // Calculate stacking position based on overlapping tasks
          let stackIndex = 0;
          const overlappingTasks = tasks.filter(otherTask => {
            if (otherTask.id === task.id) return false;
            const otherStart = Math.floor((otherTask.startDate.getTime() - calendarDays[0].getTime()) / (1000 * 60 * 60 * 24));
            const otherEnd = Math.floor((otherTask.endDate.getTime() - calendarDays[0].getTime()) / (1000 * 60 * 60 * 24));
            return !(weekTaskEnd < otherStart || weekTaskStart > otherEnd);
          });
          
          // Find available stack position
          for (let i = 0; i < overlappingTasks.length + 1; i++) {
            const isPositionAvailable = !overlappingTasks.some(otherTask => {
              const otherTaskIndex = tasks.findIndex(t => t.id === otherTask.id);
              return otherTaskIndex < taskIndex && i === 0; // Simple stacking logic
            });
            if (isPositionAvailable) {
              stackIndex = i;
              break;
            }
          }
          
          const top = week * 120 + 60 + (stackIndex * 25); // 120px per day, 60px header, 25px per task
          
          taskPositions.push({
            task,
            left,
            width,
            top,
            zIndex: 10 + stackIndex
          });
        }
      }
    });
    
    return taskPositions;
  };

  const taskPositions = getTaskPositions();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2 className="calendar-title">{formatMonthYear(currentDate)}</h2>
      </div>
      
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="calendar-grid"
          ref={calendarRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {dayHeaders.map(header => (
            <div key={header} className="calendar-day-header">
              {header}
            </div>
          ))}
          
          {/* Render calendar days */}
          {calendarDays.map((date, index) => {
            const isOtherMonth = !isCurrentMonth(date, currentDate);
            const isToday = isTodayDate(date);
            const isSelected = isDateInSelection(date);
            
            return (
              <CalendarDay
                key={`${date.getTime()}-${index}`}
                date={date}
                isOtherMonth={isOtherMonth}
                isToday={isToday}
                isSelected={isSelected}
                isSelecting={dragSelection.isSelecting}
                onMouseDown={(e) => handleMouseDown(e, date)}
                onResizeMove={handleResizeMove}
                onResizeEnd={handleResizeEnd}
              />
            );
          })}
          
          {/* Render task bars spanning across days */}
          {taskPositions.map((position, index) => (
            <TaskBar
              key={`${position.task.id}-${index}`}
              task={position.task}
              style={{
                position: 'absolute',
                left: `${position.left}%`,
                top: `${position.top}px`,
                width: `${position.width}%`,
                height: '20px',
                zIndex: position.zIndex
              }}
              onSelect={onTaskSelect}
              onDelete={onTaskDelete}
              onResizeStart={handleResizeStart}
              isDragging={draggedTask?.id === position.task.id}
              isResizing={resizingTask?.task.id === position.task.id}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default Calendar; 