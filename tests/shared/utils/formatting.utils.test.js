/**
 * Formatting Utils Tests
 * Comprehensive tests for the formatting utility functions
 */

import { formattingUtils } from '../../../src/shared/utils/formatting.utils.js';
import { TestUtils } from '../../setup.js';

describe('FormattingUtils', () => {
    beforeEach(() => {
        TestUtils.resetMocks();
    });

    describe('Currency Formatting', () => {
        test('should format USD currency correctly', () => {
            expect(formattingUtils.formatCurrency(1000)).toBe('$1,000.00');
            expect(formattingUtils.formatCurrency(1000.50)).toBe('$1,000.50');
            expect(formattingUtils.formatCurrency(1000000)).toBe('$1,000,000.00');
        });

        test('should format different currencies', () => {
            expect(formattingUtils.formatCurrency(1000, 'EUR')).toBe('€1,000.00');
            expect(formattingUtils.formatCurrency(1000, 'GBP')).toBe('£1,000.00');
            expect(formattingUtils.formatCurrency(1000, 'JPY')).toBe('¥1,000');
        });

        test('should format with different locales', () => {
            expect(formattingUtils.formatCurrency(1000, 'USD', 'de-DE')).toContain('1.000');
            expect(formattingUtils.formatCurrency(1000, 'USD', 'fr-FR')).toContain('1 000');
        });

        test('should handle decimal places', () => {
            const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
            expect(formattingUtils.formatCurrency(1000, 'USD', 'en-US', options)).toBe('$1,000.00');
        });

        test('should format compact currency', () => {
            expect(formattingUtils.formatCurrencyCompact(1000)).toBe('$1K');
            expect(formattingUtils.formatCurrencyCompact(1000000)).toBe('$1M');
            expect(formattingUtils.formatCurrencyCompact(1000000000)).toBe('$1B');
            expect(formattingUtils.formatCurrencyCompact(1500000)).toBe('$1.5M');
        });

        test('should handle edge cases', () => {
            expect(formattingUtils.formatCurrency(0)).toBe('$0.00');
            expect(formattingUtils.formatCurrency(-1000)).toBe('-$1,000.00');
            expect(formattingUtils.formatCurrency(null)).toBe('$0.00');
            expect(formattingUtils.formatCurrency(undefined)).toBe('$0.00');
        });
    });

    describe('Number Formatting', () => {
        test('should format numbers with separators', () => {
            expect(formattingUtils.formatNumber(1000)).toBe('1,000');
            expect(formattingUtils.formatNumber(1000000)).toBe('1,000,000');
            expect(formattingUtils.formatNumber(1000.5)).toBe('1,000.5');
        });

        test('should format percentages', () => {
            expect(formattingUtils.formatPercentage(0.5)).toBe('50%');
            expect(formattingUtils.formatPercentage(0.1234)).toBe('12.34%');
            expect(formattingUtils.formatPercentage(1.5)).toBe('150%');
        });

        test('should format with custom decimal places', () => {
            expect(formattingUtils.formatNumber(1000.123, { maximumFractionDigits: 2 })).toBe('1,000.12');
            expect(formattingUtils.formatPercentage(0.1234, { maximumFractionDigits: 1 })).toBe('12.3%');
        });

        test('should handle different locales', () => {
            expect(formattingUtils.formatNumber(1000.5, { locale: 'de-DE' })).toContain('1.000');
            expect(formattingUtils.formatNumber(1000.5, { locale: 'fr-FR' })).toContain('1 000');
        });
    });

    describe('Date Formatting', () => {
        test('should format dates correctly', () => {
            const date = new Date('2023-12-25T10:30:00Z');
            
            expect(formattingUtils.formatDate(date)).toMatch(/December 25, 2023/);
            expect(formattingUtils.formatDate(date, { dateStyle: 'short' })).toMatch(/12\/25\/2023/);
            expect(formattingUtils.formatDate(date, { dateStyle: 'medium' })).toMatch(/Dec 25, 2023/);
        });

        test('should format time correctly', () => {
            const date = new Date('2023-12-25T10:30:00Z');
            
            expect(formattingUtils.formatTime(date)).toMatch(/10:30/);
            expect(formattingUtils.formatTime(date, { timeStyle: 'short' })).toMatch(/10:30/);
            expect(formattingUtils.formatTime(date, { timeStyle: 'medium' })).toMatch(/10:30:00/);
        });

        test('should format relative time', () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            expect(formattingUtils.formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
            expect(formattingUtils.formatRelativeTime(oneDayAgo)).toBe('1 day ago');
            expect(formattingUtils.formatRelativeTime(oneWeekAgo)).toBe('1 week ago');
        });

        test('should handle different locales for dates', () => {
            const date = new Date('2023-12-25T10:30:00Z');
            
            expect(formattingUtils.formatDate(date, {}, 'de-DE')).toContain('25');
            expect(formattingUtils.formatDate(date, {}, 'fr-FR')).toContain('25');
        });

        test('should handle string dates', () => {
            const dateString = '2023-12-25';
            expect(formattingUtils.formatDate(dateString)).toMatch(/December 25, 2023/);
        });

        test('should handle invalid dates', () => {
            expect(formattingUtils.formatDate('invalid-date')).toBe('Invalid Date');
            expect(formattingUtils.formatDate(null)).toBe('Invalid Date');
            expect(formattingUtils.formatDate(undefined)).toBe('Invalid Date');
        });
    });

    describe('Phone Formatting', () => {
        test('should format US phone numbers', () => {
            expect(formattingUtils.formatPhone('5551234567')).toBe('(555) 123-4567');
            expect(formattingUtils.formatPhone('15551234567')).toBe('+1 (555) 123-4567');
            expect(formattingUtils.formatPhone('+15551234567')).toBe('+1 (555) 123-4567');
        });

        test('should handle different input formats', () => {
            expect(formattingUtils.formatPhone('555-123-4567')).toBe('(555) 123-4567');
            expect(formattingUtils.formatPhone('555.123.4567')).toBe('(555) 123-4567');
            expect(formattingUtils.formatPhone('(555) 123-4567')).toBe('(555) 123-4567');
        });

        test('should handle international numbers', () => {
            expect(formattingUtils.formatPhone('447700900123', 'GB')).toMatch(/\+44/);
            expect(formattingUtils.formatPhone('33123456789', 'FR')).toMatch(/\+33/);
        });

        test('should handle invalid phone numbers', () => {
            expect(formattingUtils.formatPhone('123')).toBe('123');
            expect(formattingUtils.formatPhone('')).toBe('');
            expect(formattingUtils.formatPhone(null)).toBe('');
        });
    });

    describe('Text Formatting', () => {
        test('should capitalize text correctly', () => {
            expect(formattingUtils.capitalize('hello world')).toBe('Hello world');
            expect(formattingUtils.capitalize('HELLO WORLD')).toBe('Hello world');
            expect(formattingUtils.capitalize('')).toBe('');
        });

        test('should format title case', () => {
            expect(formattingUtils.titleCase('hello world')).toBe('Hello World');
            expect(formattingUtils.titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
        });

        test('should truncate text', () => {
            const longText = 'This is a very long text that should be truncated';
            expect(formattingUtils.truncate(longText, 20)).toBe('This is a very long...');
            expect(formattingUtils.truncate(longText, 50)).toBe(longText);
            expect(formattingUtils.truncate('short', 20)).toBe('short');
        });

        test('should format camelCase', () => {
            expect(formattingUtils.camelCase('hello world')).toBe('helloWorld');
            expect(formattingUtils.camelCase('hello-world')).toBe('helloWorld');
            expect(formattingUtils.camelCase('hello_world')).toBe('helloWorld');
        });

        test('should format kebab-case', () => {
            expect(formattingUtils.kebabCase('Hello World')).toBe('hello-world');
            expect(formattingUtils.kebabCase('helloWorld')).toBe('hello-world');
            expect(formattingUtils.kebabCase('hello_world')).toBe('hello-world');
        });
    });

    describe('File Size Formatting', () => {
        test('should format file sizes correctly', () => {
            expect(formattingUtils.formatFileSize(1024)).toBe('1 KB');
            expect(formattingUtils.formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formattingUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
            expect(formattingUtils.formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
        });

        test('should handle decimal places', () => {
            expect(formattingUtils.formatFileSize(1536)).toBe('1.5 KB');
            expect(formattingUtils.formatFileSize(1536 * 1024)).toBe('1.5 MB');
        });

        test('should handle edge cases', () => {
            expect(formattingUtils.formatFileSize(0)).toBe('0 Bytes');
            expect(formattingUtils.formatFileSize(1)).toBe('1 Byte');
            expect(formattingUtils.formatFileSize(512)).toBe('512 Bytes');
        });
    });

    describe('Business Hours Formatting', () => {
        test('should format business hours', () => {
            const hours = {
                monday: { open: '09:00', close: '17:00' },
                tuesday: { open: '09:00', close: '17:00' },
                wednesday: { open: '09:00', close: '17:00' },
                thursday: { open: '09:00', close: '17:00' },
                friday: { open: '09:00', close: '17:00' },
                saturday: { closed: true },
                sunday: { closed: true }
            };

            const formatted = formattingUtils.formatBusinessHours(hours);
            expect(formatted).toContain('Monday');
            expect(formatted).toContain('9:00 AM');
            expect(formatted).toContain('5:00 PM');
            expect(formatted).toContain('Closed');
        });

        test('should handle 24-hour format', () => {
            const hours = {
                monday: { open: '09:00', close: '17:00' }
            };

            const formatted = formattingUtils.formatBusinessHours(hours, { format24: true });
            expect(formatted).toContain('09:00');
            expect(formatted).toContain('17:00');
        });
    });

    describe('Error Handling', () => {
        test('should handle null and undefined inputs gracefully', () => {
            expect(() => formattingUtils.formatCurrency(null)).not.toThrow();
            expect(() => formattingUtils.formatDate(null)).not.toThrow();
            expect(() => formattingUtils.formatPhone(null)).not.toThrow();
            expect(() => formattingUtils.capitalize(null)).not.toThrow();
        });

        test('should provide fallback values for invalid inputs', () => {
            expect(formattingUtils.formatCurrency(null)).toBe('$0.00');
            expect(formattingUtils.formatDate(null)).toBe('');
            expect(formattingUtils.formatPhone(null)).toBe('');
            expect(formattingUtils.capitalize(null)).toBe('');
        });
    });
});
