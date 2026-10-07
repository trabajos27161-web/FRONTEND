// API origin lives in one place. Set window.ELECTROQUIMICA_API_URL before this module to override it.
export const API_URL = (window.ELECTROQUIMICA_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
