import React, { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import FilterPanel from './components/FilterPanel';
import TaskModal from './components/TaskModal';
import { Task, TaskCategory, FilterState, TaskModalState, DragSelection } from './types';
import { getCategoryColor } from './utils/dateUtils';
import { generateTaskId, filterTasks } from './utils/taskUtils';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // August 2024
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    timeFilter: null,
    searchTerm: ''
  });
  const [modalState, setModalState] = useState<TaskModalState>({
    isOpen: false,
    task: null,
    mode: 'create'
  });
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    startDate: null,
    endDate: null,
    isSelecting: false
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate)
      }));
      setTasks(parsedTasks);
    } else {
      // Add sample tasks to match the image exactly
      const sampleTasks: Task[] = [
        {
          id: 'task5',
          name: 'TASK 5',
          category: 'To Do',
          startDate: new Date(2024, 7, 7),  // Aug 7
          endDate: new Date(2024, 7, 8),    // Aug 8 (2 days)
          color: getCategoryColor('To Do')
        },
        {
          id: 'task1',
          name: 'Task 1',
          category: 'In Progress',
          startDate: new Date(2024, 7, 12), // Aug 12
          endDate: new Date(2024, 7, 15),   // Aug 15 (4 days)
          color: getCategoryColor('In Progress')
        },
        {
          id: 'task4',
          name: 'TASK 4',
          category: 'Review',
          startDate: new Date(2024, 7, 13), // Aug 13
          endDate: new Date(2024, 7, 15),   // Aug 15 (3 days)
          color: getCategoryColor('Review')
        },
        {
          id: 'task3',
          name: 'TASK 3',
          category: 'Completed',
          startDate: new Date(2024, 7, 14), // Aug 14
          endDate: new Date(2024, 7, 15),   // Aug 15 (2 days)
          color: getCategoryColor('Completed')
        },
        {
          id: 'task2',
          name: 'TASK 2',
          category: 'To Do',
          startDate: new Date(2024, 7, 18), // Aug 18
          endDate: new Date(2024, 7, 20),   // Aug 20 (3 days)
          color: getCategoryColor('To Do')
        },
        {
          id: 'task6',
          name: 'TASK 6',
          category: 'In Progress',
          startDate: new Date(2024, 7, 28), // Aug 28
          endDate: new Date(2024, 7, 29),   // Aug 29 (2 days)
          color: getCategoryColor('In Progress')
        }
      ];
      setTasks(sampleTasks);
      localStorage.setItem('tasks', JSON.stringify(sampleTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = filterTasks(tasks, filters);

  const handleCreateTask = (taskData: Partial<Task>) => {
    if (dragSelection.startDate && dragSelection.endDate && taskData.name && taskData.category) {
      const newTask: Task = {
        id: generateTaskId(),
        name: taskData.name,
        category: taskData.category as TaskCategory,
        startDate: dragSelection.startDate,
        endDate: dragSelection.endDate,
        color: getCategoryColor(taskData.category)
      };
      
      setTasks(prev => [...prev, newTask]);
      setDragSelection({ startDate: null, endDate: null, isSelecting: false });
      setModalState({ isOpen: false, task: null, mode: 'create' });
    }
  };

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (taskData.id && taskData.name && taskData.category) {
      setTasks(prev => prev.map(task => 
        task.id === taskData.id 
          ? { ...task, ...taskData, color: getCategoryColor(taskData.category!) }
          : task
      ));
      setModalState({ isOpen: false, task: null, mode: 'create' });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleMoveTask = (taskId: string, newStartDate: Date) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const duration = task.endDate.getTime() - task.startDate.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);
        return { ...task, startDate: newStartDate, endDate: newEndDate };
      }
      return task;
    }));
  };

  const handleResizeTask = (taskId: string, newStartDate: Date, newEndDate: Date) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, startDate: newStartDate, endDate: newEndDate }
        : task
    ));
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Month View Task Planner</h1>
      </header>
      
      <main className="App-main">
        <FilterPanel 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />
        
        <Calendar
          currentDate={currentDate}
          tasks={filteredTasks}
          dragSelection={dragSelection}
          onDragSelectionChange={setDragSelection}
          onTaskSelect={(task) => setModalState({ isOpen: true, task, mode: 'edit' })}
          onTaskMove={handleMoveTask}
          onTaskResize={handleResizeTask}
          onTaskDelete={handleDeleteTask}
          onSelectionComplete={() => setModalState({ isOpen: true, task: null, mode: 'create' })}
        />
        
        <TaskModal
          isOpen={modalState.isOpen}
          task={modalState.task}
          mode={modalState.mode}
          onClose={() => setModalState({ isOpen: false, task: null, mode: 'create' })}
          onSubmit={modalState.mode === 'create' ? handleCreateTask : handleUpdateTask}
        />
      </main>
    </div>
  );
}

export default App; 