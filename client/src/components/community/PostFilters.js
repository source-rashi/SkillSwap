import React from 'react';
import { Filter, X, Search, TrendingUp, Tag, Clock } from 'lucide-react';

const PostFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const postTypes = [
    { value: '', label: 'All Types' },
    { value: 'insight', label: 'Insights' },
    { value: 'problem', label: 'Problems' },
    { value: 'question', label: 'Questions' },
    { value: 'tip', label: 'Tips' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'comments', label: 'Most Discussed' },
    { value: 'views', label: 'Most Viewed' }
  ];

  const hasActiveFilters = filters.type || filters.category || filters.search;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filter Posts</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </button>
        )}
      </div>

      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Search className="w-4 h-4 mr-2 text-gray-500" />
            Search Posts
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts, topics, or keywords..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400"
            />
          </div>
        </div>

        {/* Post Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-gray-500" />
            Post Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400"
          >
            {postTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Filter className="w-4 h-4 mr-2 text-gray-500" />
          Category
        </label>
        <input
          type="text"
          placeholder="Filter by category (e.g., programming, design, business)..."
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400"
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                <Search className="w-3 h-3 mr-2" />
                Search: "{filters.search}"
                <button
                  onClick={() => onFilterChange('search', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                <Tag className="w-3 h-3 mr-2" />
                Type: {postTypes.find(t => t.value === filters.type)?.label}
                <button
                  onClick={() => onFilterChange('type', '')}
                  className="ml-2 text-green-600 hover:text-green-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                <Filter className="w-3 h-3 mr-2" />
                Category: "{filters.category}"
                <button
                  onClick={() => onFilterChange('category', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilters;
