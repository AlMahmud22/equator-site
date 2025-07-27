export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
    return { isValid: false, errors }
  }
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' })
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' })
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' })
  }
  
  if (!/\d/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFullName(fullName: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!fullName) {
    errors.push({ field: 'fullName', message: 'Full name is required' })
  } else if (fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters long' })
  } else if (fullName.length > 100) {
    errors.push({ field: 'fullName', message: 'Full name cannot exceed 100 characters' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRegistrationData(data: {
  fullName: string
  email: string
  password: string
  confirmPassword?: string
}): ValidationResult {
  const allErrors: ValidationError[] = []
  
  // Validate individual fields
  const nameValidation = validateFullName(data.fullName)
  const emailValidation = validateEmail(data.email)
  const passwordValidation = validatePassword(data.password)
  
  allErrors.push(...nameValidation.errors)
  allErrors.push(...emailValidation.errors)
  allErrors.push(...passwordValidation.errors)
  
  // Validate password confirmation if provided
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    allErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

export function validateLoginData(data: {
  email: string
  password: string
}): ValidationResult {
  const allErrors: ValidationError[] = []
  
  const emailValidation = validateEmail(data.email)
  allErrors.push(...emailValidation.errors)
  
  if (!data.password) {
    allErrors.push({ field: 'password', message: 'Password is required' })
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}
