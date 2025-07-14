/**
 * Button Component Tests
 * Comprehensive tests for the button component
 */

import { ButtonComponent } from '../../../src/shared/components/button.component.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('ButtonComponent', () => {
    let button;
    let mockElement;

    beforeEach(() => {
        TestUtils.resetMocks();
        button = new ButtonComponent();
        mockElement = TestUtils.createElement('button');
        
        // Mock document.createElement
        global.document.createElement = jest.fn(() => mockElement);
    });

    describe('Initialization', () => {
        test('should initialize with default options', () => {
            expect(button.options.variant).toBe('primary');
            expect(button.options.size).toBe('medium');
            expect(button.options.disabled).toBe(false);
            expect(button.options.loading).toBe(false);
        });

        test('should initialize with custom options', () => {
            const customButton = new ButtonComponent({
                variant: 'secondary',
                size: 'large',
                disabled: true,
                icon: '<svg>icon</svg>'
            });

            expect(customButton.options.variant).toBe('secondary');
            expect(customButton.options.size).toBe('large');
            expect(customButton.options.disabled).toBe(true);
            expect(customButton.options.icon).toBe('<svg>icon</svg>');
        });
    });

    describe('Element Creation', () => {
        test('should create button element with text', () => {
            const element = button.create('Click Me');

            expect(global.document.createElement).toHaveBeenCalledWith('button');
            expect(mockElement.type).toBe('button');
            expect(mockElement.disabled).toBe(false);
        });

        test('should apply custom attributes', () => {
            const attributes = {
                id: 'test-button',
                className: 'custom-class',
                'data-testid': 'button'
            };

            button.create('Test', attributes);

            expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'test-button');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('data-testid', 'button');
        });

        test('should apply dataset attributes', () => {
            const attributes = {
                dataset: {
                    action: 'submit',
                    target: 'form'
                }
            };

            button.create('Test', attributes);

            expect(mockElement.dataset.action).toBe('submit');
            expect(mockElement.dataset.target).toBe('form');
        });
    });

    describe('Styling', () => {
        test('should apply variant classes', () => {
            const primaryButton = new ButtonComponent({ variant: 'primary' });
            primaryButton.create('Primary');

            const secondaryButton = new ButtonComponent({ variant: 'secondary' });
            secondaryButton.create('Secondary');

            const dangerButton = new ButtonComponent({ variant: 'danger' });
            dangerButton.create('Danger');

            // Check that different variants apply different classes
            expect(mockElement.className).toContain('bg-primary');
        });

        test('should apply size classes', () => {
            const smallButton = new ButtonComponent({ size: 'small' });
            smallButton.create('Small');

            const largeButton = new ButtonComponent({ size: 'large' });
            largeButton.create('Large');

            // Verify size classes are applied
            expect(mockElement.className).toContain('px-');
            expect(mockElement.className).toContain('py-');
        });

        test('should apply full width class', () => {
            const fullWidthButton = new ButtonComponent({ fullWidth: true });
            fullWidthButton.create('Full Width');

            expect(mockElement.className).toContain('w-full');
        });

        test('should apply custom classes', () => {
            const customButton = new ButtonComponent({ className: 'custom-class another-class' });
            customButton.create('Custom');

            expect(mockElement.className).toContain('custom-class');
            expect(mockElement.className).toContain('another-class');
        });
    });

    describe('Content Management', () => {
        test('should set text content', () => {
            button.create('Button Text');

            // Verify content was set (mocked implementation)
            expect(mockElement.innerHTML).toBeDefined();
        });

        test('should add icon with text', () => {
            const iconButton = new ButtonComponent({
                icon: '<svg>icon</svg>',
                iconPosition: 'left'
            });

            iconButton.create('With Icon');

            // Verify icon was added
            expect(mockElement.appendChild).toHaveBeenCalled();
        });

        test('should add icon on right side', () => {
            const iconButton = new ButtonComponent({
                icon: '<svg>icon</svg>',
                iconPosition: 'right'
            });

            iconButton.create('Icon Right');

            expect(mockElement.appendChild).toHaveBeenCalled();
        });

        test('should handle icon as DOM element', () => {
            const iconElement = TestUtils.createElement('svg');
            const iconButton = new ButtonComponent({
                icon: iconElement,
                iconPosition: 'left'
            });

            iconButton.create('DOM Icon');

            expect(mockElement.appendChild).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        test('should set loading state', () => {
            const element = button.create('Test');
            button.setLoading(true);

            expect(mockElement.disabled).toBe(true);
            expect(button.options.loading).toBe(true);
        });

        test('should clear loading state', () => {
            const element = button.create('Test');
            button.setLoading(true);
            button.setLoading(false);

            expect(button.options.loading).toBe(false);
        });

        test('should set disabled state', () => {
            const element = button.create('Test');
            button.setDisabled(true);

            expect(mockElement.disabled).toBe(true);
            expect(button.options.disabled).toBe(true);
        });

        test('should handle disabled and loading states together', () => {
            const element = button.create('Test');
            button.setDisabled(true);
            button.setLoading(true);

            expect(mockElement.disabled).toBe(true);

            button.setLoading(false);
            expect(mockElement.disabled).toBe(true); // Still disabled
        });
    });

    describe('Variant and Size Updates', () => {
        test('should update variant', () => {
            const element = button.create('Test');
            button.setVariant('secondary');

            expect(button.options.variant).toBe('secondary');
        });

        test('should update size', () => {
            const element = button.create('Test');
            button.setSize('large');

            expect(button.options.size).toBe('large');
        });
    });

    describe('Event Handling', () => {
        test('should add click event listener', () => {
            const clickHandler = jest.fn();
            const element = button.create('Test');
            
            button.onClick(clickHandler);

            expect(mockElement.addEventListener).toHaveBeenCalledWith('click', clickHandler);
        });

        test('should handle keyboard events', () => {
            const element = button.create('Test');

            // Simulate keyboard event setup
            expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should add ripple effect on click', () => {
            const element = button.create('Test');
            const clickEvent = TestUtils.createEvent('click', {
                clientX: 50,
                clientY: 50
            });

            // Mock getBoundingClientRect
            mockElement.getBoundingClientRect = jest.fn(() => ({
                left: 0,
                top: 0,
                width: 100,
                height: 40
            }));

            // Simulate click event
            const clickHandler = mockElement.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];

            clickHandler(clickEvent);

            expect(mockElement.appendChild).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        test('should be keyboard accessible', () => {
            const element = button.create('Test');

            // Verify keyboard event listener is added
            expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should handle Enter key', () => {
            const element = button.create('Test');
            const keyEvent = TestUtils.createEvent('keydown', { key: 'Enter' });

            const keyHandler = mockElement.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];

            keyHandler(keyEvent);

            expect(keyEvent.preventDefault).toHaveBeenCalled();
        });

        test('should handle Space key', () => {
            const element = button.create('Test');
            const keyEvent = TestUtils.createEvent('keydown', { key: ' ' });

            const keyHandler = mockElement.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];

            keyHandler(keyEvent);

            expect(keyEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        test('should destroy button component', () => {
            const element = button.create('Test');
            mockElement.parentNode = { removeChild: jest.fn() };

            button.destroy();

            expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
            expect(button.element).toBeNull();
        });

        test('should handle destroy when not in DOM', () => {
            const element = button.create('Test');
            mockElement.parentNode = null;

            expect(() => button.destroy()).not.toThrow();
        });
    });

    describe('Utility Functions', () => {
        test('should create primary button', () => {
            const { createPrimaryButton } = require('../../../src/shared/components/button.component.js');
            
            global.document.createElement = jest.fn(() => TestUtils.createElement('button'));
            
            const element = createPrimaryButton('Primary');
            
            expect(global.document.createElement).toHaveBeenCalledWith('button');
        });

        test('should create secondary button', () => {
            const { createSecondaryButton } = require('../../../src/shared/components/button.component.js');
            
            global.document.createElement = jest.fn(() => TestUtils.createElement('button'));
            
            const element = createSecondaryButton('Secondary');
            
            expect(global.document.createElement).toHaveBeenCalledWith('button');
        });

        test('should create outline button', () => {
            const { createOutlineButton } = require('../../../src/shared/components/button.component.js');
            
            global.document.createElement = jest.fn(() => TestUtils.createElement('button'));
            
            const element = createOutlineButton('Outline');
            
            expect(global.document.createElement).toHaveBeenCalledWith('button');
        });

        test('should create danger button', () => {
            const { createDangerButton } = require('../../../src/shared/components/button.component.js');
            
            global.document.createElement = jest.fn(() => TestUtils.createElement('button'));
            
            const element = createDangerButton('Danger');
            
            expect(global.document.createElement).toHaveBeenCalledWith('button');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty text', () => {
            expect(() => button.create('')).not.toThrow();
        });

        test('should handle null text', () => {
            expect(() => button.create(null)).not.toThrow();
        });

        test('should handle undefined text', () => {
            expect(() => button.create(undefined)).not.toThrow();
        });

        test('should handle invalid variant', () => {
            const invalidButton = new ButtonComponent({ variant: 'invalid' });
            expect(() => invalidButton.create('Test')).not.toThrow();
        });

        test('should handle invalid size', () => {
            const invalidButton = new ButtonComponent({ size: 'invalid' });
            expect(() => invalidButton.create('Test')).not.toThrow();
        });
    });
});
