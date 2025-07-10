/**
 * Shadcn-Inspired Component Interactions
 * LEGACY FILE: This file is maintained for backward compatibility.
 * New development should use the modular component system in src/shared/components/
 * Import from: import { ButtonComponent, ModalComponent } from './src/shared/components/index.js'
 * JavaScript functionality for static HTML shadcn components
 */

class ShadcnComponents {
  constructor() {
    this.init();
  }

  init() {
    this.initProgressBars();
    this.initButtons();
    this.initCards();
    this.initAvatars();
  }

  /**
   * Initialize progress bar animations
   */
  initProgressBars() {
    const progressBars = document.querySelectorAll('.shadcn-progress');
    
    progressBars.forEach(progress => {
      const indicator = progress.querySelector('.shadcn-progress-indicator');
      const value = progress.getAttribute('data-value') || 0;
      
      if (indicator) {
        // Animate progress bar
        setTimeout(() => {
          indicator.style.transform = `scaleX(${value / 100})`;
        }, 100);
      }
    });
  }

  /**
   * Initialize button interactions
   */
  initButtons() {
    const buttons = document.querySelectorAll('.shadcn-btn');
    
    buttons.forEach(button => {
      // Add ripple effect
      button.addEventListener('click', this.createRippleEffect.bind(this));
      
      // Handle loading states
      if (button.hasAttribute('data-loading')) {
        this.setButtonLoading(button, true);
      }
    });
  }

  /**
   * Initialize card interactions
   */
  initCards() {
    const cards = document.querySelectorAll('.shadcn-card[data-clickable]');
    
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const href = card.getAttribute('data-href');
        if (href) {
          window.location.href = href;
        }
      });
      
      // Add hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 10px 25px 0 rgb(0 0 0 / 0.1)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
      });
    });
  }

  /**
   * Initialize avatar fallbacks
   */
  initAvatars() {
    const avatars = document.querySelectorAll('.shadcn-avatar');
    
    avatars.forEach(avatar => {
      const img = avatar.querySelector('.shadcn-avatar-image');
      const fallback = avatar.querySelector('.shadcn-avatar-fallback');
      
      if (img && fallback) {
        img.addEventListener('error', () => {
          img.style.display = 'none';
          fallback.style.display = 'flex';
        });
        
        img.addEventListener('load', () => {
          fallback.style.display = 'none';
          img.style.display = 'block';
        });
      }
    });
  }

  /**
   * Create ripple effect for buttons
   */
  createRippleEffect(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    // Add ripple animation keyframes if not already added
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Set button loading state
   */
  setButtonLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.setAttribute('data-original-text', button.textContent);
      
      const spinner = document.createElement('span');
      spinner.className = 'shadcn-spinner';
      spinner.innerHTML = `
        <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
      
      button.innerHTML = '';
      button.appendChild(spinner);
      button.appendChild(document.createTextNode('Loading...'));
    } else {
      button.disabled = false;
      const originalText = button.getAttribute('data-original-text');
      if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
      }
    }
  }

  /**
   * Update progress bar value
   */
  updateProgress(progressElement, value) {
    const indicator = progressElement.querySelector('.shadcn-progress-indicator');
    if (indicator) {
      indicator.style.transform = `scaleX(${Math.min(Math.max(value, 0), 100) / 100})`;
      progressElement.setAttribute('data-value', value);
    }
  }

  /**
   * Create a toast notification (simple implementation)
   */
  createToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `shadcn-toast shadcn-toast--${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      padding: 1rem;
      border-radius: calc(var(--radius));
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      max-width: 20rem;
      animation: slideIn 0.3s ease-out;
    `;
    
    toast.textContent = message;
    
    // Add animation styles if not already added
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
    
    return toast;
  }

  /**
   * Utility method to create shadcn components programmatically
   */
  createElement(type, options = {}) {
    const element = document.createElement(options.tag || 'div');
    
    switch (type) {
      case 'card':
        element.className = `shadcn-card ${options.variant ? `shadcn-card--${options.variant}` : ''}`;
        if (options.clickable) {
          element.setAttribute('data-clickable', 'true');
          if (options.href) {
            element.setAttribute('data-href', options.href);
          }
        }
        break;
        
      case 'button':
        element.className = `shadcn-btn shadcn-btn--${options.variant || 'primary'} shadcn-btn--${options.size || 'default'}`;
        element.textContent = options.text || 'Button';
        if (options.disabled) {
          element.disabled = true;
        }
        break;
        
      case 'badge':
        element.className = `shadcn-badge shadcn-badge--${options.variant || 'default'}`;
        element.textContent = options.text || 'Badge';
        break;
        
      case 'progress':
        element.className = 'shadcn-progress';
        element.setAttribute('data-value', options.value || 0);
        const indicator = document.createElement('div');
        indicator.className = 'shadcn-progress-indicator';
        element.appendChild(indicator);
        break;
        
      case 'avatar':
        element.className = `shadcn-avatar ${options.size ? `shadcn-avatar--${options.size}` : ''}`;
        if (options.src) {
          const img = document.createElement('img');
          img.className = 'shadcn-avatar-image';
          img.src = options.src;
          img.alt = options.alt || '';
          element.appendChild(img);
        }
        if (options.fallback) {
          const fallback = document.createElement('div');
          fallback.className = 'shadcn-avatar-fallback';
          fallback.textContent = options.fallback;
          element.appendChild(fallback);
        }
        break;
    }
    
    if (options.className) {
      element.className += ` ${options.className}`;
    }
    
    return element;
  }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.shadcnComponents = new ShadcnComponents();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadcnComponents;
}
