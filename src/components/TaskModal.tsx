import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types';
import { getCategoryColor } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  task: Partial<Task> | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  mode,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'To Do' as TaskCategory
  });

  const categories: TaskCategory[] = ['To Do', 'In Progress', 'Review', 'Completed'];

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        category: task.category || 'To Do'
      });
    } else {
      setFormData({
        name: '',
        category: 'To Do'
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a task name');
      return;
    }

    const taskData: Partial<Task> = {
      ...task,
      name: formData.name.trim(),
      category: formData.category,
      color: getCategoryColor(formData.category)
    };

    onSubmit(taskData);
  };

  const handleClose = () => {
    setFormData({ name: '', category: 'To Do' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {mode === 'edit' && task && (
            <div className="form-group">
              <label className="form-label">Task Details</label>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f8fafc', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                <div>Start Date: {task.startDate?.toLocaleDateString()}</div>
                <div>End Date: {task.endDate?.toLocaleDateString()}</div>
                <div>Duration: {task.startDate && task.endDate 
                  ? Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                  : 0} days</div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 