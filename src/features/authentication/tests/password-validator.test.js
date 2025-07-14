
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};


// Password strength requirements
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Password Validator Service Tests
 * Unit tests for password validation and strength calculation
 */

import { PasswordValidatorService } from '../services/password-validator.service.js';

describe('PasswordValidatorService', () => {
    let passwordValidator;

    beforeEach(() => {
        passwordValidator = new PasswordValidatorService();
    });

    describe('Password Validation', () => {
        test('should validate strong password', () => {
            const result = passwordValidator.validatePassword('SecurePass123!@#');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.strength).toBeGreaterThan(70);
            expect(result.strengthLabel).toBe('Strong');
        });

        test('should reject password that is too short', () => {
            const result = passwordValidator.validatePassword('Short1!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 12 characters long');
        });

        test('should reject password without uppercase letter', () => {
            const result = passwordValidator.validatePassword('lowercase123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });

        test('should reject password without lowercase letter', () => {
            const result = passwordValidator.validatePassword('UPPERCASE123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });

        test('should reject password without number', () => {
            const result = passwordValidator.validatePassword('NoNumbersHere!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });

        test('should reject password without special character', () => {
            const result = passwordValidator.validatePassword('NoSpecialChars123');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character');
        });

        test('should reject password with repeated characters', () => {
            const result = passwordValidator.validatePassword('Passwordaaa123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password contains common weak patterns');
        });

        test('should reject password with common weak patterns', () => {
            const weakPasswords = ['Password123456!', 'Qwerty123!@#', 'Admin123!@#'];

            weakPasswords.forEach(password => {
                const result = passwordValidator.validatePassword(password);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password contains common weak patterns');
            });
        });

        test('should handle empty password', () => {
            const result = passwordValidator.validatePassword('');

            expect(result.isValid).toBe(false);
            expect(result.strength).toBe(0);
            expect(result.strengthLabel).toBe('No Password');
        });

        test('should handle null password', () => {
            const result = passwordValidator.validatePassword(null);

            expect(result.isValid).toBe(false);
            expect(result.strength).toBe(0);
            expect(result.strengthLabel).toBe('No Password');
        });
    });

    describe('Password Strength Calculation', () => {
        test('should calculate strength for very weak password', () => {
            const strength = passwordValidator.calculatePasswordStrength('weak');
            expect(strength).toBeLessThan(30);
        });

        test('should calculate strength for weak password', () => {
            const strength = passwordValidator.calculatePasswordStrength('weakpass123');
            expect(strength).toBeGreaterThanOrEqual(30);
            expect(strength).toBeLessThan(50);
        });

        test('should calculate strength for fair password', () => {
            const strength = passwordValidator.calculatePasswordStrength('FairPassword123');
            expect(strength).toBeGreaterThanOrEqual(50);
            expect(strength).toBeLessThan(70);
        });

        test('should calculate strength for good password', () => {
            const strength = passwordValidator.calculatePasswordStrength('GoodPassword123!');
            expect(strength).toBeGreaterThanOrEqual(70);
            expect(strength).toBeLessThan(85);
        });

        test('should calculate strength for strong password', () => {
            const strength = passwordValidator.calculatePasswordStrength('StrongPassword123!@#');
            expect(strength).toBeGreaterThanOrEqual(85);
        });

        test('should give bonus for long passwords', () => {
            const shortpassword: process.env.PASSWORD || '';
            const longpassword: process.env.PASSWORD || '';

            const shortStrength = passwordValidator.calculatePasswordStrength(shortPassword);
            const longStrength = passwordValidator.calculatePasswordStrength(longPassword);

            expect(longStrength).toBeGreaterThan(shortStrength);
        });

        test('should give bonus for character variety', () => {
            const simplepassword: process.env.PASSWORD || '';
            const complexpassword: process.env.PASSWORD || '';

            const simpleStrength = passwordValidator.calculatePasswordStrength(simplePassword);
            const complexStrength = passwordValidator.calculatePasswordStrength(complexPassword);

            expect(complexStrength).toBeGreaterThan(simpleStrength);
        });
    });

    describe('Strength Labels', () => {
        test('should return correct strength labels', () => {
            expect(passwordValidator.getStrengthLabel(20)).toBe('Very Weak');
            expect(passwordValidator.getStrengthLabel(40)).toBe('Weak');
            expect(passwordValidator.getStrengthLabel(60)).toBe('Fair');
            expect(passwordValidator.getStrengthLabel(80)).toBe('Good');
            expect(passwordValidator.getStrengthLabel(90)).toBe('Strong');
            expect(passwordValidator.getStrengthLabel(100)).toBe('Very Strong');
        });
    });

    describe('Strength Colors', () => {
        test('should return correct CSS color classes', () => {
            expect(passwordValidator.getStrengthColor(20)).toBe('text-red-500');
            expect(passwordValidator.getStrengthColor(40)).toBe('text-orange-500');
            expect(passwordValidator.getStrengthColor(60)).toBe('text-yellow-500');
            expect(passwordValidator.getStrengthColor(80)).toBe('text-blue-500');
            expect(passwordValidator.getStrengthColor(90)).toBe('text-green-500');
            expect(passwordValidator.getStrengthColor(100)).toBe('text-emerald-500');
        });
    });

    describe('Password Confirmation', () => {
        test('should validate matching passwords', () => {
            const result = passwordValidator.validatePasswordConfirmation('password123', 'password123');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject non-matching passwords', () => {
            const result = passwordValidator.validatePasswordConfirmation('password123', 'different123');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Passwords do not match');
        });

        test('should reject empty confirmation', () => {
            const result = passwordValidator.validatePasswordConfirmation('password123', '');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password confirmation is required');
        });
    });

    describe('Minimum Requirements', () => {
        test('should check if password meets minimum requirements', () => {
            const strongpassword: process.env.PASSWORD || '';
            const weakpassword: process.env.PASSWORD || '';

            expect(passwordValidator.meetsMinimumRequirements(strongPassword)).toBe(true);
            expect(passwordValidator.meetsMinimumRequirements(weakPassword)).toBe(false);
        });
    });

    describe('Password Requirements', () => {
        test('should return list of password requirements', () => {
            const requirements = passwordValidator.getPasswordRequirements();

            expect(requirements).toBeInstanceOf(Array);
            expect(requirements.length).toBeGreaterThan(0);
            expect(requirements[0]).toContain('12 characters');
        });
    });

    describe('Secure Password Generation', () => {
        test('should generate secure password with default length', () => {
            const password = passwordValidator.generateSecurePassword();

            expect(password).toHaveLength(16);
            expect(/[A-Z]/.test(password)).toBe(true);
            expect(/[a-z]/.test(password)).toBe(true);
            expect(/\d/.test(password)).toBe(true);
            expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
        });

        test('should generate secure password with custom length', () => {
            const password = passwordValidator.generateSecurePassword(20);

            expect(password).toHaveLength(20);
            expect(/[A-Z]/.test(password)).toBe(true);
            expect(/[a-z]/.test(password)).toBe(true);
            expect(/\d/.test(password)).toBe(true);
            expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
        });

        test('should generate different passwords each time', () => {
            const password1 = passwordValidator.generateSecurePassword();
            const password2 = passwordValidator.generateSecurePassword();

            expect(password1).not.toBe(password2);
        });

        test('should generate passwords that meet validation requirements', () => {
            const password = passwordValidator.generateSecurePassword();
            const validation = passwordValidator.validatePassword(password);

            expect(validation.isValid).toBe(true);
            expect(validation.strength).toBeGreaterThan(70);
        });
    });

    describe('Utility Methods', () => {
        test('should get random character from string', () => {
            const chars = 'abcdef';
            const randomChar = passwordValidator.getRandomChar(chars);

            expect(chars).toContain(randomChar);
            expect(randomChar).toHaveLength(1);
        });

        test('should shuffle string characters', () => {
            const original = 'abcdefghijklmnop';
            const shuffled = passwordValidator.shuffleString(original);

            expect(shuffled).toHaveLength(original.length);
            expect(shuffled.split('').sort().join('')).toBe(original.split('').sort().join(''));
            // Note: There's a very small chance this could fail if shuffle returns original order
        });
    });
});
