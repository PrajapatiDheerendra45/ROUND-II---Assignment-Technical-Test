import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../types';

interface TaskBarProps {
  task: Task;
  style: React.CSSProperties;
  onSelect: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onResizeStart: (task: Task, edge: 'left' | 'right') => void;
  isDragging?: boolean;
  isResizing?: boolean;
}

const TaskBar: React.FC<TaskBarProps> = ({
  task,
  style,
  onSelect,
  onDelete,
  onResizeStart,
  isDragging = false,
  isResizing = false
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: task
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleResizeStart = (e: React.MouseEvent, edge: 'left' | 'right') => {
    e.stopPropagation();
    onResizeStart(task, edge);
  };

  const taskClasses = [
    'task-bar',
    isDragging ? 'dragging' : '',
    isResizing ? 'resizing' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...dragStyle,
        backgroundColor: task.color,
        position: 'absolute'
      }}
      className={taskClasses}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="task-bar-content">
        {task.name}
      </div>
      
      {/* Resize handles */}
      <div
        className="task-resize-handle left"
        onMouseDown={(e) => handleResizeStart(e, 'left')}
      />
      <div
        className="task-resize-handle right"
        onMouseDown={(e) => handleResizeStart(e, 'right')}
      />
      
      {/* Delete button */}
      <button
        className="task-delete"
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '2px',
          color: 'white',
          fontSize: '10px',
          cursor: 'pointer',
          padding: '1px 3px',
          display: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.display = 'block';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default TaskBar; 