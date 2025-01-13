// utils/auth.js

import apiClient from './apiClient';

/**
 * Authenticate the user by logging them in.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The response data from the API.
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    // Check if response contains the token
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    // Handle API error response
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

/**
 * Logout the user by clearing the token from localStorage.
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is logged in by checking if the token exists in localStorage.
 * @returns {boolean} True if the token exists, false otherwise.
 */
export const isLoggedIn = () => {
  return Boolean(localStorage.getItem('token'));
};

/**
 * Fetch the current user's session data (e.g., profile information).
 * @returns {Promise<object>} The session data.
 */
export const getSession = async () => {
  try {
    const response = await apiClient.get('/api/auth/session');
    return response.data;  // Return the session data from the response
  } catch (error) {
    // Handle API error response
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get session';
    throw new Error(errorMessage);
  }
};
