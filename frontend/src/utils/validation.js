// Validation utility functions for frontend forms

// Email validation
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

// Password validation
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/;
  if (!passwordRegex.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return '';
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim() === '') {
    return `${fieldName} is required`;
  }
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (name.trim().length > 100) {
    return `${fieldName} must not exceed 100 characters`;
  }
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters and spaces`;
  }
  return '';
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 20) {
    return 'Phone number must be between 10 and 20 digits';
  }
  return '';
};

// Company name validation
export const validateCompanyName = (companyName) => {
  if (!companyName || companyName.trim() === '') {
    return 'Company name is required';
  }
  if (companyName.trim().length < 2) {
    return 'Company name must be at least 2 characters long';
  }
  if (companyName.trim().length > 200) {
    return 'Company name must not exceed 200 characters';
  }
  return '';
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

// Number validation
export const validateNumber = (value, fieldName, min = 0, max = Number.MAX_VALUE) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (num > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return '';
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  return '';
};

// Future date validation
export const validateFutureDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return `${fieldName} must be today or a future date`;
  }
  return '';
};

// OTP validation
export const validateOTP = (otp) => {
  if (!otp || otp.trim() === '') {
    return 'OTP is required';
  }
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP must be exactly 6 digits';
  }
  return '';
};

// Passenger validation
export const validatePassengers = (adults, children = 0, infants = 0) => {
  const errors = {};
  
  if (!adults || adults < 1) {
    errors.adults = 'At least 1 adult is required';
  } else if (adults > 9) {
    errors.adults = 'Maximum 9 adults allowed';
  }
  
  if (children < 0) {
    errors.children = 'Children cannot be negative';
  } else if (children > 9) {
    errors.children = 'Maximum 9 children allowed';
  }
  
  if (infants < 0) {
    errors.infants = 'Infants cannot be negative';
  } else if (infants > 9) {
    errors.infants = 'Maximum 9 infants allowed';
  }
  
  if (infants > adults) {
    errors.infants = 'Number of infants cannot exceed number of adults';
  }
  
  return errors;
};

// Amount validation
export const validateAmount = (amount, fieldName = 'Amount') => {
  if (!amount || amount === '') {
    return `${fieldName} is required`;
  }
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return '';
};

// Text length validation
export const validateTextLength = (text, fieldName, minLength = 0, maxLength = 500) => {
  if (!text || text.trim() === '') {
    if (minLength > 0) {
      return `${fieldName} is required`;
    }
    return '';
  }
  if (text.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  if (text.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return '';
};

// Airline code validation (2-3 uppercase letters/numbers)
export const validateAirlineCode = (code) => {
  if (!code || code.trim() === '') {
    return 'Airline code is required';
  }
  const codeRegex = /^[A-Z0-9]{2,3}$/;
  if (!codeRegex.test(code)) {
    return 'Airline code must be 2-3 uppercase letters or numbers';
  }
  return '';
};

// Airport code validation (3 uppercase letters)
export const validateAirportCode = (code, fieldName = 'Airport code') => {
  if (!code || code.trim() === '') {
    return `${fieldName} is required`;
  }
  const codeRegex = /^[A-Z]{3}$/;
  if (!codeRegex.test(code)) {
    return `${fieldName} must be exactly 3 uppercase letters`;
  }
  return '';
};

// Account number validation
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.trim() === '') {
    return 'Account number is required';
  }
  const accountRegex = /^[0-9A-Z\-]+$/;
  if (!accountRegex.test(accountNumber)) {
    return 'Account number can only contain numbers, uppercase letters, and hyphens';
  }
  if (accountNumber.length < 5 || accountNumber.length > 30) {
    return 'Account number must be between 5 and 30 characters';
  }
  return '';
};

// IBAN validation
export const validateIBAN = (iban) => {
  if (!iban || iban.trim() === '') {
    return ''; // Optional field
  }
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(iban)) {
    return 'Invalid IBAN format (e.g., GB82WEST12345698765432)';
  }
  if (iban.length < 15 || iban.length > 34) {
    return 'IBAN must be between 15 and 34 characters';
  }
  return '';
};

// SWIFT code validation
export const validateSWIFT = (swiftCode) => {
  if (!swiftCode || swiftCode.trim() === '') {
    return ''; // Optional field
  }
  const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!swiftRegex.test(swiftCode)) {
    return 'Invalid SWIFT/BIC code format (e.g., BARCGB22 or BARCGB22XXX)';
  }
  return '';
};

// File validation
export const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSizeMB = 5) => {
  if (!file) {
    return ''; // Optional in most cases
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return `Only ${types} files are allowed`;
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  
  return '';
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

// Booking type validation
export const validateBookingType = (bookingType) => {
  const validTypes = ['oneway', 'return', 'multicity'];
  if (!bookingType || !validTypes.includes(bookingType)) {
    return 'Please select a valid booking type';
  }
  return '';
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return errors;
};

// Display all validation errors
export const displayValidationErrors = (errors, toast) => {
  if (Object.keys(errors).length === 0) return false;
  
  // Display first error
  const firstError = Object.values(errors)[0];
  if (toast && firstError) {
    toast.error(firstError);
  }
  
  return true;
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateCompanyName,
  validateRequired,
  validateNumber,
  validateDate,
  validateFutureDate,
  validateOTP,
  validatePassengers,
  validateAmount,
  validateTextLength,
  validateAirlineCode,
  validateAirportCode,
  validateAccountNumber,
  validateIBAN,
  validateSWIFT,
  validateFile,
  validateConfirmPassword,
  validateBookingType,
  validateForm,
  displayValidationErrors
};
