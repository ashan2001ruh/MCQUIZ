const API_BASE_URL = '/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `/api=${endpoint}`;
  
  try {
    const requestOptions = {
      ...options,
      headers: {
        ...createHeaders(options.includeAuth !== false),
        ...options.headers,
      },
    };

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Quiz service
export const quizService = {
  // Get quizzes for a specific subject
  getQuizzesBySubject: async (subjectId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    
    const queryString = params.toString();
    const endpoint = `/user-quizzes/subject/${subjectId}${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint, { includeAuth: true });
  },

  // Get quiz for attempting
  getQuizForAttempt: async (id) => {
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    return await apiRequest(`/user-quizzes/${id}/attempt`, { includeAuth: true });
  },

  // Submit quiz attempt
  submitQuizAttempt: async (id, answers, timeSpent = 0) => {
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    if (!answers || !Array.isArray(answers)) {
      throw new Error('Answers array is required');
    }

    const payload = {
      answers,
      timeSpent: Math.max(0, timeSpent)
    };

    return await apiRequest(`/user-quizzes/${id}/submit`, {
      method: 'POST',
      includeAuth: true,
      body: JSON.stringify(payload),
    });
  },

  // Get quiz statistics
  getQuizStats: async () => {
    return await apiRequest('/quizzes/stats');
  },
};

// Auth service
export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    if (!token) {
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Date.now() / 1000;
      
      if (!isValid) {
        authService.logout();
      }
      
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      authService.logout();
      return false;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// Error handling utility
export const handleApiError = (error) => {
  if (!error) {
    return 'An unknown error occurred.';
  }
  
  const errorMessage = error.message || error.toString();
  
  if (errorMessage.includes('401') || errorMessage.includes('Authentication required')) {
    authService.logout();
    return 'Session expired. Please login again.';
  } else if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
    return 'Access denied. This content requires a subscription.';
  } else if (errorMessage.includes('404')) {
    return 'The requested resource was not found.';
  } else if (errorMessage.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (errorMessage.includes('Network error')) {
    return 'Connection problem. Please check your internet connection.';
  } else {
    return errorMessage || 'An unexpected error occurred.';
  }
};

export default {
  quizService,
  authService,
  handleApiError,
};
