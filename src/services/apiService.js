const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  // Use 'authToken' to match login component
  const token = localStorage.getItem('authToken');
  console.log('Getting auth token:', token ? 'Token exists' : 'No token found');
  return token;
};

// Helper function to create request headers
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Authorization header');
    } else {
      console.warn('Auth required but no token available');
      throw new Error('Authentication required. Please login again.');
    }
  }
  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Making API request:', {
    url,
    method: options.method || 'GET',
    includeAuth: options.includeAuth,
    hasToken: !!getAuthToken()
  });

  try {
    const requestOptions = {
      ...options,
      headers: {
        ...createHeaders(options.includeAuth),
        ...options.headers,
      },
    };

    console.log('Request options:', {
      method: requestOptions.method || 'GET',
      hasAuth: !!requestOptions.headers['Authorization']
    });

    const response = await fetch(url, requestOptions);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('API response:', {
      status: response.status,
      ok: response.ok,
      url: endpoint
    });

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data.message 
        ? data.message 
        : `HTTP error! status: ${response.status}`;
      
      console.error(`API Error [${response.status}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// Quiz-related API calls
export const quizService = {
  // Get quizzes for a specific subject
  getQuizzesBySubject: async (subjectId, filters = {}) => {
    console.log('Getting quizzes for subject:', subjectId);
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

  // Get all quizzes with filters
  getAllQuizzes: async (filters = {}) => {
    console.log('Getting all quizzes with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/user-quizzes${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint, { includeAuth: true });
  },

  // Get specific quiz by ID (basic info without questions)
  getQuizInfo: async (id) => {
    console.log('Getting quiz info for ID:', id);
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    return await apiRequest(`/quizzes/${id}/info`, { includeAuth: true });
  },

  // Get quiz for attempting (with questions but without answers)
  getQuizForAttempt: async (id) => {
    console.log('Getting quiz for attempt, ID:', id);
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    return await apiRequest(`/user-quizzes/${id}/attempt`, { includeAuth: true });
  },

  // Submit quiz attempt
  submitQuizAttempt: async (id, answers, timeSpent = 0) => {
    console.log('Submitting quiz attempt:', { id, answersCount: answers?.length, timeSpent });
    
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    if (!answers || !Array.isArray(answers)) {
      throw new Error('Answers array is required');
    }

    const payload = {
      answers,
      timeSpent: Math.max(0, timeSpent) // Ensure non-negative
    };

    console.log('Submitting payload:', payload);

    const response = await apiRequest(`/user-quizzes/${id}/submit`, {
      method: 'POST',
      includeAuth: true,
      body: JSON.stringify(payload),
    });

    console.log('Submit response received:', response);
    return response;
  },

  // Get quiz statistics (public endpoint)
  getQuizStats: async () => {
    console.log('Getting quiz statistics');
    return await apiRequest('/quizzes/stats');
  },
};

// Subject-related API calls
export const subjectService = {
  // Get all subjects with optional filters
  getAllSubjects: async (filters = {}) => {
    console.log('Getting all subjects with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters.level) params.append('level', filters.level);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    
    const queryString = params.toString();
    const endpoint = `/subjects${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint);
  },

  // Get subjects by specific level
  getSubjectsByLevel: async (level) => {
    console.log('Getting subjects by level:', level);
    if (!level) {
      throw new Error('Level is required');
    }
    return await apiRequest(`/subjects/level/${encodeURIComponent(level)}`);
  },

  // Get specific subject by ID
  getSubjectById: async (id) => {
    console.log('Getting subject by ID:', id);
    if (!id) {
      throw new Error('Subject ID is required');
    }
    return await apiRequest(`/subjects/${id}`);
  },
};

// User authentication API calls
export const authService = {
  // User registration
  register: async (userData) => {
    console.log('Attempting user registration');
    if (!userData) {
      throw new Error('User data is required');
    }
    
    return await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (credentials) => {
    console.log('Attempting user login');
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    const result = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (result.token) {
      console.log('Login successful, storing token');
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    } else {
      throw new Error('Login failed: No token received');
    }
    
    return result;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    if (!token) {
      console.log('No token found - user not authenticated');
      return false;
    }
    
    try {
      // Basic token validation
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Date.now() / 1000;
      
      console.log('Token validation:', { 
        isValid, 
        exp: new Date(payload.exp * 1000).toISOString(),
        now: new Date().toISOString()
      });
      
      if (!isValid) {
        console.log('Token expired - removing from storage');
        authService.logout();
      }
      
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      authService.logout(); // Remove invalid token
      return false;
    }
  },

  // Get current user info from token
  getCurrentUser: () => {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error('Error parsing user token:', error);
      return null;
    }
  },

  // Logout user
  logout: () => {
    console.log('Logging out user - clearing storage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // Remove legacy token key if exists
    localStorage.removeItem('user');
  },
};

// User attempt related API calls
export const attemptService = {
  // Get user's quiz attempts
  getUserAttempts: async (filters = {}) => {
    console.log('Getting user attempts with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters.quizId) params.append('quizId', filters.quizId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    
    const queryString = params.toString();
    const endpoint = `/user-attempts${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint, { includeAuth: true });
  },

  // Get specific attempt details
  getAttemptById: async (attemptId) => {
    console.log('Getting attempt by ID:', attemptId);
    if (!attemptId) {
      throw new Error('Attempt ID is required');
    }
    return await apiRequest(`/user-attempts/${attemptId}`, { includeAuth: true });
  },
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('Handling API error:', error);
  
  if (!error) {
    return 'An unknown error occurred.';
  }
  
  const errorMessage = error.message || error.toString();
  
  // Handle specific HTTP status codes
  if (errorMessage.includes('401') || errorMessage.includes('Authentication required')) {
    console.log('Authentication error - redirecting to login');
    authService.logout();
    
    // Only redirect if we're not already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    
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

// Export default object with all services
export default {
  subjectService,
  authService,
  quizService,
  attemptService,
  handleApiError,
};