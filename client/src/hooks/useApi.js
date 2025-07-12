import { useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './useToast';

/**
 * Custom hook for API calls with loading and error handling
 * @param {object} options - Configuration options
 * @returns {object} API methods and state
 */
export const useApi = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const toast = useToast();

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError
  } = options;

  /**
   * Execute API request
   * @param {function} apiCall - API function to execute
   * @param {object} config - Additional configuration
   * @returns {Promise} API response
   */
  const execute = useCallback(async (apiCall, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      setData(response);

      if (showSuccessToast) {
        toast.success(config.successMessage || successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      const errorMessage = err.error || err.message || 'An error occurred';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(config.errorMessage || errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage, onSuccess, onError, toast]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * GET request wrapper
   */
  const get = useCallback((url, config = {}) => {
    return execute(() => api.get(url, config), config);
  }, [execute]);

  /**
   * POST request wrapper
   */
  const post = useCallback((url, data, config = {}) => {
    return execute(() => api.post(url, data, config), config);
  }, [execute]);

  /**
   * PUT request wrapper
   */
  const put = useCallback((url, data, config = {}) => {
    return execute(() => api.put(url, data, config), config);
  }, [execute]);

  /**
   * DELETE request wrapper
   */
  const del = useCallback((url, config = {}) => {
    return execute(() => api.delete(url, config), config);
  }, [execute]);

  /**
   * PATCH request wrapper
   */
  const patch = useCallback((url, data, config = {}) => {
    return execute(() => api.patch(url, data, config), config);
  }, [execute]);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    get,
    post,
    put,
    delete: del,
    patch
  };
};

/**
 * Hook for paginated API calls
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} Pagination methods and state
 */
export const usePaginatedApi = (endpoint, options = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({});
  
  const { execute, loading, error } = useApi(options);

  /**
   * Fetch data with pagination
   */
  const fetchData = useCallback(async (page = 1, newFilters = {}) => {
    try {
      const params = {
        page,
        limit: options.limit || 10,
        ...filters,
        ...newFilters
      };

      const response = await execute(() => api.get(endpoint, { params }));
      
      if (page === 1) {
        setItems(response.data || response.items || []);
      } else {
        setItems(prev => [...prev, ...(response.data || response.items || [])]);
      }

      setPagination({
        currentPage: response.currentPage || page,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
        hasMore: (response.currentPage || page) < (response.totalPages || 1)
      });

      return response;
    } catch (err) {
      throw err;
    }
  }, [endpoint, execute, filters, options.limit]);

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchData(pagination.currentPage + 1);
    }
  }, [fetchData, loading, pagination]);

  /**
   * Refresh data
   */
  const refresh = useCallback((newFilters = {}) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    return fetchData(1, newFilters);
  }, [fetchData]);

  /**
   * Reset pagination
   */
  const reset = useCallback(() => {
    setItems([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      total: 0,
      hasMore: false
    });
    setFilters({});
  }, []);

  return {
    items,
    pagination,
    loading,
    error,
    fetchData,
    loadMore,
    refresh,
    reset,
    setFilters
  };
};

export default useApi;
