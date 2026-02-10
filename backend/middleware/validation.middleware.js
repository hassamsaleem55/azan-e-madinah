import { body, param, query, validationResult } from 'express-validator';

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const emailValidation = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Please provide a valid email address')
  .normalizeEmail();

const passwordValidation = body('password')
  .trim()
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

const nameValidation = body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces');

const phoneValidation = body('phone')
  .optional()
  .trim()
  .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number')
  .isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 digits');

const mongoIdValidation = (field = 'id') => param(field)
  .trim()
  .notEmpty().withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
  .isMongoId().withMessage(`Invalid ${field} format`);

// Auth validations
export const validateRegister = [
  emailValidation,
  passwordValidation,
  nameValidation,
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  phoneValidation,
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
  body('consultant').optional().trim().isLength({ max: 100 }).withMessage('Consultant name must not exceed 100 characters'),
  handleValidationErrors
];

export const validateLogin = [
  emailValidation,
  body('password').trim().notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateOTP = [
  emailValidation,
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  handleValidationErrors
];

export const validateSendOTP = [
  emailValidation,
  handleValidationErrors
];

export const validateResetPassword = [
  emailValidation,
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  passwordValidation,
  handleValidationErrors
];

export const validateGoogleAuth = [
  body('credential').trim().notEmpty().withMessage('Google credential is required'),
  handleValidationErrors
];

export const validateAssignRoles = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('roleNames')
    .isArray({ min: 1 }).withMessage('At least one role is required')
    .custom((roles) => {
      if (!roles.every(role => typeof role === 'string' && role.trim().length > 0)) {
        throw new Error('Each role must be a non-empty string');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateUpdateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  body('companyName').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
  body('consultant').optional().trim().isLength({ max: 100 }).withMessage('Consultant must not exceed 100 characters'),
  handleValidationErrors
];

// Booking validations
export const validateCreateBooking = [
  body('bookingType')
    .trim()
    .notEmpty().withMessage('Booking type is required')
    .isIn(['oneway', 'return', 'multicity']).withMessage('Invalid booking type'),
  body('passengers.adults')
    .notEmpty().withMessage('Number of adults is required')
    .isInt({ min: 1, max: 9 }).withMessage('Adults must be between 1 and 9'),
  body('passengers.children')
    .optional()
    .isInt({ min: 0, max: 9 }).withMessage('Children must be between 0 and 9'),
  body('passengers.infants')
    .optional()
    .isInt({ min: 0, max: 9 }).withMessage('Infants must be between 0 and 9'),
  body('totalAmount')
    .notEmpty().withMessage('Total amount is required')
    .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('flightDetails')
    .isArray({ min: 1 }).withMessage('At least one flight detail is required'),
  body('flightDetails.*.airline')
    .trim()
    .notEmpty().withMessage('Airline is required for each flight'),
  body('flightDetails.*.departure')
    .trim()
    .notEmpty().withMessage('Departure location is required'),
  body('flightDetails.*.arrival')
    .trim()
    .notEmpty().withMessage('Arrival location is required'),
  body('flightDetails.*.departureDate')
    .trim()
    .notEmpty().withMessage('Departure date is required')
    .isISO8601().withMessage('Invalid departure date format'),
  handleValidationErrors
];

export const validateUpdateBooking = [
  mongoIdValidation('id'),
  body('passengers.adults').optional().isInt({ min: 1, max: 9 }).withMessage('Adults must be between 1 and 9'),
  body('passengers.children').optional().isInt({ min: 0, max: 9 }).withMessage('Children must be between 0 and 9'),
  body('passengers.infants').optional().isInt({ min: 0, max: 9 }).withMessage('Infants must be between 0 and 9'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'expired'])
    .withMessage('Invalid booking status'),
  handleValidationErrors
];

export const validateBookingId = [
  mongoIdValidation('id'),
  handleValidationErrors
];

// Airline validations
export const validateCreateAirline = [
  body('airlineName')
    .trim()
    .notEmpty().withMessage('Airline name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Airline name must be between 2 and 100 characters'),
  body('shortCode')
    .trim()
    .notEmpty().withMessage('Short code is required')
    .isLength({ min: 2, max: 3 }).withMessage('Short code must be 2-3 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('Short code must contain only uppercase letters and numbers'),
  body('airlineCode')
    .trim()
    .notEmpty().withMessage('Airline code (country) is required')
    .isLength({ min: 2, max: 100 }).withMessage('Airline code must be between 2 and 100 characters'),
  handleValidationErrors
];

export const validateUpdateAirline = [
  mongoIdValidation('id'),
  body('airlineName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Airline name must be between 2 and 100 characters'),
  body('shortCode').optional().trim().matches(/^[A-Z0-9]{2,3}$/).withMessage('Short code must be 2-3 uppercase letters/numbers'),
  body('airlineCode').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Airline code must be between 2 and 100 characters'),
  handleValidationErrors
];

// Bank validations
export const validateCreateBank = [
  body('bankName')
    .trim()
    .notEmpty().withMessage('Bank name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Bank name must be between 2 and 200 characters'),
  body('accountTitle')
    .trim()
    .notEmpty().withMessage('Account title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Account title must be between 2 and 200 characters'),
  body('accountNumber')
    .trim()
    .notEmpty().withMessage('Account number is required')
    .matches(/^[0-9A-Z\-]+$/).withMessage('Account number can only contain numbers, uppercase letters, and hyphens')
    .isLength({ min: 5, max: 30 }).withMessage('Account number must be between 5 and 30 characters'),
  body('iban')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/).withMessage('Invalid IBAN format')
    .isLength({ min: 15, max: 34 }).withMessage('IBAN must be between 15 and 34 characters'),
  body('swiftCode')
    .optional()
    .trim()
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).withMessage('Invalid SWIFT/BIC code format'),
  body('branchCode')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Branch code must not exceed 20 characters'),
  handleValidationErrors
];

export const validateUpdateBank = [
  mongoIdValidation('id'),
  body('bankName').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Bank name must be between 2 and 200 characters'),
  body('accountTitle').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Account title must be between 2 and 200 characters'),
  body('accountNumber').optional().trim().matches(/^[0-9A-Z\-]+$/).withMessage('Invalid account number format'),
  body('iban').optional().trim().matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/).withMessage('Invalid IBAN format'),
  body('swiftCode').optional().trim().matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).withMessage('Invalid SWIFT code format'),
  handleValidationErrors
];

// Sector validations
export const validateCreateSector = [
  body('sectorTitle')
    .trim()
    .notEmpty().withMessage('Sector title is required')
    .isLength({ min: 5, max: 10 }).withMessage('Sector title must be between 5 and 10 characters (e.g., DXB-JED)'),
  body('fullSector')
    .trim()
    .notEmpty().withMessage('Full sector name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Full sector must be between 2 and 200 characters'),
  handleValidationErrors
];

export const validateUpdateSector = [
  mongoIdValidation('id'),
  body('sectorTitle').optional().trim().isLength({ min: 5, max: 10 }).withMessage('Sector title must be between 5 and 10 characters'),
  body('fullSector').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Full sector must be between 2 and 200 characters'),
  handleValidationErrors
];

// Payment validations
export const validateCreatePayment = [
  body('bookingId')
    .trim()
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID format'),
  body('amount')
    .notEmpty().withMessage('Payment amount is required')
    .isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('paymentMethod')
    .trim()
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'online'])
    .withMessage('Invalid payment method'),
  body('bankId')
    .optional()
    .trim()
    .isMongoId().withMessage('Invalid bank ID format'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID must not exceed 100 characters'),
  handleValidationErrors
];

// Group Ticketing validations
export const validateCreateGroupTicketing = [
  body('groupName')
    .trim()
    .notEmpty().withMessage('Group name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Group name must be between 2 and 200 characters'),
  body('numberOfPassengers')
    .notEmpty().withMessage('Number of passengers is required')
    .isInt({ min: 10, max: 1000 }).withMessage('Group must have between 10 and 1000 passengers'),
  body('departure')
    .trim()
    .notEmpty().withMessage('Departure location is required'),
  body('arrival')
    .trim()
    .notEmpty().withMessage('Arrival location is required'),
  body('departureDate')
    .trim()
    .notEmpty().withMessage('Departure date is required')
    .isISO8601().withMessage('Invalid departure date format'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  handleValidationErrors
];

export const validateUpdateGroupTicketing = [
  mongoIdValidation('id'),
  body('groupName').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Group name must be between 2 and 200 characters'),
  body('numberOfPassengers').optional().isInt({ min: 10, max: 1000 }).withMessage('Group must have between 10 and 1000 passengers'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid group booking status'),
  handleValidationErrors
];

// Role validations
export const validateCreateRole = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Role name can only contain letters and spaces'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .trim()
    .isMongoId().withMessage('Each permission must be a valid ID'),
  handleValidationErrors
];

export const validateUpdateRole = [
  mongoIdValidation('id'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Role name must be between 2 and 50 characters'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('permissions.*').optional().trim().isMongoId().withMessage('Each permission must be a valid ID'),
  handleValidationErrors
];

// Query validations
export const validatePaginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search query must not exceed 200 characters'),
  query('sortBy').optional().trim().isIn(['createdAt', 'updatedAt', 'name', 'email', 'totalAmount', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().trim().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// Generic ID validation
export const validateId = [
  mongoIdValidation('id'),
  handleValidationErrors
];

export const validateUserId = [
  mongoIdValidation('userId'),
  handleValidationErrors
];
