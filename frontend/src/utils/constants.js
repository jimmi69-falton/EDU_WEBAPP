// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    VALIDATE: '/auth/validate',
  },
  EMPLOYEES: {
    BASE: '/employees',
    PROFILE: '/employees/profile',
    SEARCH: '/employees/search',
    DEPARTMENTS: '/employees/departments',
    STATS: '/employees/stats',
  },
  ABSENCES: {
    BASE: '/absences',
    MY_REQUESTS: '/absences/my-requests',
    PENDING: '/absences/pending',
    APPROVE: (id) => `/absences/${id}/approve`,
    REJECT: (id) => `/absences/${id}/reject`,
    CANCEL: (id) => `/absences/${id}/cancel`,
  },
  DOCUMENTS: {
    BASE: '/documents',
    CATEGORIES: '/documents/categories',
    DOWNLOAD: (id) => `/documents/${id}/download`,
    STATS: '/documents/stats',
  },
  EVENTS: {
    BASE: '/events',
    UPCOMING: '/events/upcoming',
    CALENDAR: (year, month) => `/events/calendar/${year}/${month}`,
    STATS: '/events/stats',
  },
  AI: {
    CHAT: '/ai/chat',
    SUGGESTIONS: '/ai/suggestions',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

// Absence Request Status
export const ABSENCE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

// Document Categories
export const DOCUMENT_CATEGORIES = {
  POLICY: 'POLICY',
  HANDBOOK: 'HANDBOOK',
  FORM: 'FORM',
  PROCEDURE: 'PROCEDURE',
  TRAINING: 'TRAINING',
  OTHER: 'OTHER',
};

// Event Types
export const EVENT_TYPES = {
  MEETING: 'MEETING',
  TRAINING: 'TRAINING',
  HOLIDAY: 'HOLIDAY',
  DEADLINE: 'DEADLINE',
  COMPANY_EVENT: 'COMPANY_EVENT',
  OTHER: 'OTHER',
};

// Event Priorities
export const EVENT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
};

// Pagination
export const PAGINATION = {
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
};
