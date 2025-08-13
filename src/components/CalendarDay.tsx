import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { formatDayNumber } from '../utils/dateUtils';

interface CalendarDayProps {
  date: Date;
  isOtherMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isSelecting: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMove: (e: React.MouseEvent) => void;
  onResizeEnd: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isOtherMonth,
  isToday,
  isSelected,
  isSelecting,
  onMouseDown,
  onResizeMove,
  onResizeEnd
}) => {
  const { setNodeRef } = useDroppable({
    id: `day-${date.toISOString().split('T')[0]}`
  });

  const dayClasses = [
    'calendar-day',
    isOtherMonth ? 'other-month' : '',
    isToday ? 'today' : '',
    isSelected ? 'selected' : '',
    isSelecting ? 'selecting' : ''
  ].filter(Boolean).join(' ');

  const dayNumberClasses = [
    'day-number',
    isOtherMonth ? 'other-month' : '',
    isToday ? 'today' : ''
  ].filter(Boolean).join(' ');

  const handleMouseMove = (e: React.MouseEvent) => {
    onResizeMove(e);
  };

  const handleMouseUp = () => {
    onResizeEnd();
  };

  return (
    <div
      ref={setNodeRef}
      className={dayClasses}
      onMouseDown={onMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={dayNumberClasses}>
        {formatDayNumber(date)}
      </div>
    </div>
  );
};

export default CalendarDay; 