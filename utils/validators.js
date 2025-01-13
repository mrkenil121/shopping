// utils/validators.js

/**
 * Validates email format
 * @param {string} email - The email string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates if a string is not empty
   * @param {string} value - The string to validate
   * @returns {boolean} - True if not empty, false otherwise
   */
  export const validateNotEmpty = (value) => {
    return value && value.trim() !== '';
  };
  
  /**
   * Validates a password (at least 8 characters, 1 letter, 1 number)
   * @param {string} password - The password to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Validates if a value is a valid positive number
   * @param {string|number} value - The value to validate
   * @returns {boolean} - True if valid number, false otherwise
   */
  export const validatePositiveNumber = (value) => {
    return !isNaN(value) && value > 0;
  };
  
  /**
   * Validates product price format (positive float number)
   * @param {number} price - The price to validate
   * @returns {boolean} - True if valid price, false otherwise
   */
  export const validateProductPrice = (price) => {
    return !isNaN(price) && price > 0 && /^\d+(\.\d{1,2})?$/.test(price);
  };
  
  /**
   * Validates if an array is not empty
   * @param {Array} arr - The array to validate
   * @returns {boolean} - True if array is not empty, false otherwise
   */
  export const validateArrayNotEmpty = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
  };
  
  /**
   * Validates product tags array (should be an array of non-empty strings)
   * @param {Array} tags - The tags array to validate
   * @returns {boolean} - True if valid tags array, false otherwise
   */
  export const validateProductTags = (tags) => {
    return Array.isArray(tags) && tags.every(tag => typeof tag === 'string' && tag.trim() !== '');
  };
  
  /**
   * Validates if an object has required properties
   * @param {Object} obj - The object to validate
   * @param {Array} requiredProps - Array of required property names
   * @returns {boolean} - True if all required properties exist and are not empty
   */
  export const validateRequiredProps = (obj, requiredProps) => {
    return requiredProps.every((prop) => obj.hasOwnProperty(prop) && validateNotEmpty(obj[prop]));
  };
  