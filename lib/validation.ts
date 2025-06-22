// Comprehensive form validation system for enhanced profile management

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  email?: boolean
  url?: boolean
  phone?: boolean
  date?: boolean
  number?: boolean
  min?: number
  max?: number
  array?: {
    minItems?: number
    maxItems?: number
    itemType?: 'string' | 'number' | 'object'
  }
  object?: {
    requiredFields?: string[]
    fieldValidators?: Record<string, ValidationRule>
  }
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class FormValidator {
  private rules: Record<string, ValidationRule>

  constructor(rules: Record<string, ValidationRule>) {
    this.rules = rules
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = []

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field]
      const error = this.validateField(field, value, rule)
      if (error) {
        errors.push(error)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private validateField(field: string, value: any, rule: ValidationRule): ValidationError | null {
    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return {
        field,
        message: `${this.formatFieldName(field)} is required`,
        value
      }
    }

    // Skip other validations if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return null
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rule.minLength && value.length < rule.minLength) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be at least ${rule.minLength} characters`,
          value
        }
      }

      // Max length
      if (rule.maxLength && value.length > rule.maxLength) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be no more than ${rule.maxLength} characters`,
          value
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          field,
          message: `${this.formatFieldName(field)} format is invalid`,
          value
        }
      }

      // Email validation
      if (rule.email && !this.isValidEmail(value)) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be a valid email address`,
          value
        }
      }

      // URL validation
      if (rule.url && !this.isValidUrl(value)) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be a valid URL`,
          value
        }
      }

      // Phone validation
      if (rule.phone && !this.isValidPhone(value)) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be a valid phone number`,
          value
        }
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = typeof value === 'number' ? value : Number(value)
      
      if (rule.min !== undefined && numValue < rule.min) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be at least ${rule.min}`,
          value
        }
      }

      if (rule.max !== undefined && numValue > rule.max) {
        return {
          field,
          message: `${this.formatFieldName(field)} must be no more than ${rule.max}`,
          value
        }
      }
    }

    // Date validation
    if (rule.date && !this.isValidDate(value)) {
      return {
        field,
        message: `${this.formatFieldName(field)} must be a valid date`,
        value
      }
    }

    // Array validations
    if (Array.isArray(value) && rule.array) {
      const arrayRule = rule.array
      
      if (arrayRule.minItems && value.length < arrayRule.minItems) {
        return {
          field,
          message: `${this.formatFieldName(field)} must have at least ${arrayRule.minItems} items`,
          value
        }
      }

      if (arrayRule.maxItems && value.length > arrayRule.maxItems) {
        return {
          field,
          message: `${this.formatFieldName(field)} must have no more than ${arrayRule.maxItems} items`,
          value
        }
      }

      // Validate array items
      if (arrayRule.itemType) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i]
          if (arrayRule.itemType === 'string' && typeof item !== 'string') {
            return {
              field: `${field}[${i}]`,
              message: `Item ${i + 1} must be a string`,
              value: item
            }
          }
          if (arrayRule.itemType === 'number' && typeof item !== 'number') {
            return {
              field: `${field}[${i}]`,
              message: `Item ${i + 1} must be a number`,
              value: item
            }
          }
        }
      }
    }

    // Object validations
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && rule.object) {
      const objectRule = rule.object
      
      if (objectRule.requiredFields) {
        for (const requiredField of objectRule.requiredFields) {
          if (!(requiredField in value) || value[requiredField] === null || value[requiredField] === undefined) {
            return {
              field: `${field}.${requiredField}`,
              message: `${this.formatFieldName(requiredField)} is required`,
              value: value[requiredField]
            }
          }
        }
      }

      if (objectRule.fieldValidators) {
        for (const [subField, subRule] of Object.entries(objectRule.fieldValidators)) {
          if (subField in value) {
            const subError = this.validateField(`${field}.${subField}`, value[subField], subRule)
            if (subError) {
              return subError
            }
          }
        }
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) {
        return {
          field,
          message: customError,
          value
        }
      }
    }

    return null
  }

  private formatFieldName(field: string): string {
    return field
      .split('.')
      .map(part => part.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
      .join(' ')
      .replace(/_/g, ' ')
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  private isValidDate(date: string): boolean {
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }
}

// Predefined validation rules for profile fields
export const profileValidationRules: Record<string, ValidationRule> = {
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  headline: {
    maxLength: 200
  },
  bio: {
    maxLength: 1000
  },
  location: {
    required: true,
    maxLength: 100
  },
  job_title: {
    maxLength: 100
  },
  experience_level: {
    required: true,
    custom: (value) => {
      const validLevels = ['entry', 'mid', 'senior', 'lead', 'executive']
      return validLevels.includes(value) ? null : 'Invalid experience level'
    }
  },
  experience_years: {
    number: true,
    min: 0,
    max: 50
  },
  skills: {
    array: {
      minItems: 1,
      maxItems: 20,
      itemType: 'string'
    }
  },
  education: {
    array: {
      maxItems: 10,
      itemType: 'object'
    },
    object: {
      requiredFields: ['institution', 'degree', 'field'],
      fieldValidators: {
        institution: { required: true, maxLength: 200 },
        degree: { required: true, maxLength: 100 },
        field: { required: true, maxLength: 100 },
        start_date: { date: true },
        end_date: { date: true },
        description: { maxLength: 500 },
        gpa: { number: true, min: 0, max: 4 }
      }
    }
  },
  preferred_job_types: {
    array: {
      maxItems: 10,
      itemType: 'string'
    }
  },
  preferred_locations: {
    array: {
      maxItems: 10,
      itemType: 'string'
    }
  },
  preferred_salary_range: {
    object: {
      requiredFields: ['min', 'max'],
      fieldValidators: {
        min: { number: true, min: 0 },
        max: { number: true, min: 0 },
        currency: { maxLength: 3 }
      }
    },
    custom: (value) => {
      if (value.min > value.max) {
        return 'Minimum salary cannot be greater than maximum salary'
      }
      return null
    }
  },
  website: {
    url: true
  },
  linkedin_url: {
    url: true,
    custom: (value) => {
      if (value && !value.includes('linkedin.com')) {
        return 'Must be a valid LinkedIn URL'
      }
      return null
    }
  },
  github_url: {
    url: true,
    custom: (value) => {
      if (value && !value.includes('github.com')) {
        return 'Must be a valid GitHub URL'
      }
      return null
    }
  },
  portfolio_url: {
    url: true
  },
  phone: {
    phone: true
  },
  date_of_birth: {
    date: true,
    custom: (value) => {
      if (value) {
        const birthDate = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 16 || age > 100) {
          return 'Age must be between 16 and 100 years'
        }
      }
      return null
    }
  },
  availability_status: {
    custom: (value) => {
      const validStatuses = ['Available', 'Open to opportunities', 'Not looking', 'Employed']
      return validStatuses.includes(value) ? null : 'Invalid availability status'
    }
  },
  work_authorization: {
    custom: (value) => {
      const validAuths = ['US Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa', 'Other']
      return validAuths.includes(value) ? null : 'Invalid work authorization'
    }
  },
  remote_preference: {
    custom: (value) => {
      const validPreferences = ['On-site', 'Hybrid', 'Remote', 'Flexible']
      return validPreferences.includes(value) ? null : 'Invalid remote preference'
    }
  },
  relocation_willingness: {
    custom: (value) => {
      const validWillingness = ['Willing to relocate', 'Open to discussion', 'Not willing to relocate']
      return validWillingness.includes(value) ? null : 'Invalid relocation willingness'
    }
  }
}

// Create validator instance
export const profileValidator = new FormValidator(profileValidationRules)

// Utility functions for common validations
export const validationUtils = {
  // Validate a single field
  validateField: (field: string, value: any, rule: ValidationRule): string | null => {
    const validator = new FormValidator({ [field]: rule })
    const result = validator.validate({ [field]: value })
    return result.errors.length > 0 ? result.errors[0].message : null
  },

  // Validate email
  validateEmail: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : 'Invalid email address'
  },

  // Validate URL
  validateUrl: (url: string): string | null => {
    try {
      new URL(url)
      return null
    } catch {
      return 'Invalid URL'
    }
  },

  // Validate phone number
  validatePhone: (phone: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleaned = phone.replace(/[\s\-\(\)]/g, '')
    return phoneRegex.test(cleaned) ? null : 'Invalid phone number'
  },

  // Validate date
  validateDate: (date: string): string | null => {
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime()) ? null : 'Invalid date'
  },

  // Validate required field
  validateRequired: (value: any, fieldName: string): string | null => {
    return value === null || value === undefined || value === '' 
      ? `${fieldName} is required` 
      : null
  },

  // Validate minimum length
  validateMinLength: (value: string, minLength: number, fieldName: string): string | null => {
    return value.length < minLength 
      ? `${fieldName} must be at least ${minLength} characters` 
      : null
  },

  // Validate maximum length
  validateMaxLength: (value: string, maxLength: number, fieldName: string): string | null => {
    return value.length > maxLength 
      ? `${fieldName} must be no more than ${maxLength} characters` 
      : null
  }
} 