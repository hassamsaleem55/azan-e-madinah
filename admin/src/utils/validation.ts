// Validation utility functions for admin panel forms

// Email validation
export const validateEmail = (email: string): string => {
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
export const validatePassword = (password: string): string => {
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
export const validateName = (name: string, fieldName: string = 'Name'): string => {
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
export const validatePhone = (phone: string): string => {
  if (!phone || phone.trim() === '') {
    return ''; // Optional field
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

// Required field validation
export const validateRequired = (value: any, fieldName: string): string => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

// Number validation
export const validateNumber = (
  value: number | string,
  fieldName: string,
  min: number = 0,
  max: number = Number.MAX_VALUE
): string => {
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
export const validateDate = (date: string | Date, fieldName: string = 'Date'): string => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  return '';
};

// Amount validation
export const validateAmount = (amount: number | string, fieldName: string = 'Amount'): string => {
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
export const validateTextLength = (
  text: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 500
): string => {
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
export const validateAirlineCode = (code: string): string => {
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
export const validateAirportCode = (code: string, fieldName: string = 'Airport code'): string => {
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
export const validateAccountNumber = (accountNumber: string): string => {
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
export const validateIBAN = (iban: string): string => {
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
export const validateSWIFT = (swiftCode: string): string => {
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
export const validateFile = (
  file: File | null,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg'],
  maxSizeMB: number = 5
): string => {
  if (!file) {
    return ''; // Optional in most cases
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const types = allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ');
    return `Only ${types} files are allowed`;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must not exceed ${maxSizeMB}MB`;
  }

  return '';
};

// Role name validation
export const validateRoleName = (roleName: string): string => {
  if (!roleName || roleName.trim() === '') {
    return 'Role name is required';
  }
  if (roleName.length < 2 || roleName.length > 50) {
    return 'Role name must be between 2 and 50 characters';
  }
  const roleRegex = /^[a-zA-Z\s]+$/;
  if (!roleRegex.test(roleName)) {
    return 'Role name can only contain letters and spaces';
  }
  return '';
};

// Permission name validation
export const validatePermissionName = (permissionName: string): string => {
  if (!permissionName || permissionName.trim() === '') {
    return 'Permission name is required';
  }
  if (permissionName.length < 2 || permissionName.length > 100) {
    return 'Permission name must be between 2 and 100 characters';
  }
  return '';
};

// Status validation
export const validateStatus = (status: string, validStatuses: string[]): string => {
  if (!status) {
    return 'Status is required';
  }
  if (!validStatuses.includes(status)) {
    return `Status must be one of: ${validStatuses.join(', ')}`;
  }
  return '';
};

// Credit amount validation
export const validateCreditAmount = (amount: number | string): string => {
  if (amount === '' || amount === null || amount === undefined) {
    return 'Credit amount is required';
  }
  const num = Number(amount);
  if (isNaN(num) || num < 0) {
    return 'Credit amount must be a non-negative number';
  }
  return '';
};

// Form validation helper
export const validateForm = (
  formData: Record<string, any>,
  validationRules: Record<string, Array<(value: any) => string>>
): Record<string, string> => {
  const errors: Record<string, string> = {};

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

// Display first validation error
export const getFirstError = (errors: Record<string, string>): string => {
  const errorValues = Object.values(errors);
  return errorValues.length > 0 ? errorValues[0] : '';
};

// Check if form has errors
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRequired,
  validateNumber,
  validateDate,
  validateAmount,
  validateTextLength,
  validateAirlineCode,
  validateAirportCode,
  validateAccountNumber,
  validateIBAN,
  validateSWIFT,
  validateFile,
  validateRoleName,
  validatePermissionName,
  validateStatus,
  validateCreditAmount,
  validateForm,
  getFirstError,
  hasErrors,
};
