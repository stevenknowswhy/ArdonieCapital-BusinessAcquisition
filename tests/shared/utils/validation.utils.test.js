/**
 * Validation Utils Tests
 * Comprehensive tests for the validation utility functions
 */

import { validationUtils } from '../../../src/shared/utils/validation.utils.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('ValidationUtils', () => {
    beforeEach(() => {
        TestUtils.resetMocks();
    });

    describe('Email Validation', () => {
        test('should validate correct email addresses', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                'user123@test-domain.com',
                'a@b.co'
            ];

            validEmails.forEach(email => {
                const result = validationUtils.validateEmail(email);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject invalid email addresses', () => {
            const invalidEmails = [
                'invalid-email',
                '@example.com',
                'user@',
                'user..name@example.com',
                'user@.com',
                'user@domain.',
                '',
                null,
                undefined
            ];

            invalidEmails.forEach(email => {
                const result = validationUtils.validateEmail(email);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });

        test('should handle edge cases', () => {
            // Very long email
            const longEmail = 'a'.repeat(250) + '@example.com';
            const result = validationUtils.validateEmail(longEmail);
            expect(result.isValid).toBe(false);

            // Email with special characters
            const specialEmail = 'user+tag@example.com';
            const specialResult = validationUtils.validateEmail(specialEmail);
            expect(specialResult.isValid).toBe(true);
        });
    });

    describe('Phone Validation', () => {
        test('should validate US phone numbers', () => {
            const validPhones = [
                '(555) 123-4567',
                '555-123-4567',
                '555.123.4567',
                '5551234567',
                '+1 555 123 4567',
                '+15551234567'
            ];

            validPhones.forEach(phone => {
                const result = validationUtils.validatePhone(phone);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject invalid phone numbers', () => {
            const invalidPhones = [
                '123',
                '555-123',
                'abc-def-ghij',
                '555-123-456789',
                '',
                null,
                undefined
            ];

            invalidPhones.forEach(phone => {
                const result = validationUtils.validatePhone(phone);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });

        test('should format phone numbers', () => {
            const phone = '5551234567';
            const result = validationUtils.validatePhone(phone);
            expect(result.formatted).toBe('(555) 123-4567');
        });
    });

    describe('Credit Card Validation', () => {
        test('should validate credit card numbers using Luhn algorithm', () => {
            const validCards = [
                '4532015112830366', // Visa
                '5555555555554444', // Mastercard
                '378282246310005',  // American Express
                '6011111111111117'  // Discover
            ];

            validCards.forEach(card => {
                const result = validationUtils.validateCreditCard(card);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject invalid credit card numbers', () => {
            const invalidCards = [
                '1234567890123456',
                '4532015112830367', // Invalid Luhn
                '123',
                '',
                null,
                undefined
            ];

            invalidCards.forEach(card => {
                const result = validationUtils.validateCreditCard(card);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });

        test('should detect card types', () => {
            const cardTests = [
                { number: '4532015112830366', type: 'visa' },
                { number: '5555555555554444', type: 'mastercard' },
                { number: '378282246310005', type: 'amex' },
                { number: '6011111111111117', type: 'discover' }
            ];

            cardTests.forEach(({ number, type }) => {
                const result = validationUtils.validateCreditCard(number);
                expect(result.type).toBe(type);
            });
        });
    });

    describe('URL Validation', () => {
        test('should validate correct URLs', () => {
            const validUrls = [
                'https://example.com',
                'http://test.org',
                'https://sub.domain.com/path',
                'https://example.com:8080',
                'https://example.com/path?query=value#fragment'
            ];

            validUrls.forEach(url => {
                const result = validationUtils.validateUrl(url);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject invalid URLs', () => {
            const invalidUrls = [
                'not-a-url',
                'ftp://example.com', // Invalid protocol
                'https://',
                'https://.',
                '',
                null,
                undefined
            ];

            invalidUrls.forEach(url => {
                const result = validationUtils.validateUrl(url);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });
    });

    describe('Required Field Validation', () => {
        test('should validate required fields', () => {
            const validValues = [
                'text',
                123,
                true,
                ['item'],
                { key: 'value' }
            ];

            validValues.forEach(value => {
                const result = validationUtils.validateRequired(value, 'Test Field');
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject empty required fields', () => {
            const invalidValues = [
                '',
                null,
                undefined,
                [],
                {},
                '   ' // whitespace only
            ];

            invalidValues.forEach(value => {
                const result = validationUtils.validateRequired(value, 'Test Field');
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
                expect(result.error).toContain('Test Field');
            });
        });
    });

    describe('Date Validation', () => {
        test('should validate correct dates', () => {
            const validDates = [
                '2023-12-25',
                '01/15/2023',
                '2023-01-01T00:00:00Z',
                new Date(),
                new Date('2023-01-01')
            ];

            validDates.forEach(date => {
                const result = validationUtils.validateDate(date);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('should reject invalid dates', () => {
            const invalidDates = [
                'invalid-date',
                '2023-13-01', // Invalid month
                '2023-02-30', // Invalid day
                '',
                null,
                undefined
            ];

            invalidDates.forEach(date => {
                const result = validationUtils.validateDate(date);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });

        test('should validate date ranges', () => {
            const today = new Date();
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

            // Future date validation
            const futureResult = validationUtils.validateDate(tomorrow, { future: true });
            expect(futureResult.isValid).toBe(true);

            const pastResult = validationUtils.validateDate(yesterday, { future: true });
            expect(pastResult.isValid).toBe(false);

            // Past date validation
            const pastValidResult = validationUtils.validateDate(yesterday, { past: true });
            expect(pastValidResult.isValid).toBe(true);

            const futureInvalidResult = validationUtils.validateDate(tomorrow, { past: true });
            expect(futureInvalidResult.isValid).toBe(false);
        });
    });

    describe('Age Validation', () => {
        test('should validate age from birthdate', () => {
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

            const result = validationUtils.validateAge(eighteenYearsAgo, { minAge: 18 });
            expect(result.isValid).toBe(true);
            expect(result.age).toBe(18);
        });

        test('should reject underage', () => {
            const sixteenYearsAgo = new Date();
            sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

            const result = validationUtils.validateAge(sixteenYearsAgo, { minAge: 18 });
            expect(result.isValid).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('should validate maximum age', () => {
            const hundredYearsAgo = new Date();
            hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

            const result = validationUtils.validateAge(hundredYearsAgo, { maxAge: 99 });
            expect(result.isValid).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('Multi-field Validation', () => {
        test('should validate multiple fields', () => {
            const fields = {
                email: 'test@example.com',
                phone: '555-123-4567',
                name: 'John Doe'
            };

            const rules = {
                email: { type: 'email', required: true },
                phone: { type: 'phone', required: true },
                name: { type: 'required', required: true }
            };

            const result = validationUtils.validateMultipleFields(fields, rules);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual({});
        });

        test('should return errors for invalid fields', () => {
            const fields = {
                email: 'invalid-email',
                phone: '123',
                name: ''
            };

            const rules = {
                email: { type: 'email', required: true },
                phone: { type: 'phone', required: true },
                name: { type: 'required', required: true }
            };

            const result = validationUtils.validateMultipleFields(fields, rules);
            expect(result.isValid).toBe(false);
            expect(Object.keys(result.errors)).toHaveLength(3);
            expect(result.errors.email).toBeTruthy();
            expect(result.errors.phone).toBeTruthy();
            expect(result.errors.name).toBeTruthy();
        });
    });

    describe('Custom Validation', () => {
        test('should support custom validation rules', () => {
            const customRule = (value) => {
                if (value && value.length >= 8) {
                    return { isValid: true, error: null };
                }
                return { isValid: false, error: 'Must be at least 8 characters' };
            };

            const result = validationUtils.validateCustom('password123', customRule);
            expect(result.isValid).toBe(true);

            const shortResult = validationUtils.validateCustom('pass', customRule);
            expect(shortResult.isValid).toBe(false);
            expect(shortResult.error).toBe('Must be at least 8 characters');
        });
    });

    describe('Error Handling', () => {
        test('should handle null and undefined inputs gracefully', () => {
            expect(() => validationUtils.validateEmail(null)).not.toThrow();
            expect(() => validationUtils.validatePhone(undefined)).not.toThrow();
            expect(() => validationUtils.validateRequired(null, 'field')).not.toThrow();
        });

        test('should provide meaningful error messages', () => {
            const emailResult = validationUtils.validateEmail('invalid');
            expect(emailResult.error).toContain('email');

            const phoneResult = validationUtils.validatePhone('123');
            expect(phoneResult.error).toContain('phone');

            const requiredResult = validationUtils.validateRequired('', 'Username');
            expect(requiredResult.error).toContain('Username');
        });
    });
});
