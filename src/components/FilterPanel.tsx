import React from 'react';
import { FilterState, TaskCategory } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const categories: TaskCategory[] = ['To Do', 'In Progress', 'Review', 'Completed'];
  const timeFilters = [
    { value: '1week', label: 'Tasks within 1 week' },
    { value: '2weeks', label: 'Tasks within 2 weeks' },
    { value: '3weeks', label: 'Tasks within 3 weeks' }
  ];

  const handleCategoryChange = (category: TaskCategory, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleTimeFilterChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      timeFilter: value as '1week' | '2weeks' | '3weeks' | null
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      timeFilter: null,
      searchTerm: ''
    });
  };

  return (
    <div className="filter-panel">
      {/* Search Section */}
      <div className="filter-section">
        <div className="filter-title">Search Tasks</div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by task name..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="filter-section">
        <div className="filter-title">Categories</div>
        <div className="filter-options">
          {categories.map(category => (
            <label key={category} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time-based Filters */}
      <div className="filter-section">
        <div className="filter-title">Time Range</div>
        <div className="filter-options">
          {timeFilters.map(filter => (
            <label key={filter.value} className="filter-checkbox">
              <input
                type="radio"
                name="timeFilter"
                value={filter.value}
                checked={filters.timeFilter === filter.value}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
              />
              <span>{filter.label}</span>
            </label>
          ))}
          <label className="filter-checkbox">
            <input
              type="radio"
              name="timeFilter"
              checked={filters.timeFilter === null}
              onChange={() => handleTimeFilterChange(null)}
            />
            <span>All tasks</span>
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.categories.length > 0 || filters.timeFilter || filters.searchTerm) && (
        <div className="filter-section">
          <button
            className="btn btn-secondary"
            onClick={clearAllFilters}
            style={{ width: '100%' }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 