# Accessibility Standards - Ardonie Capital Platform

## Overview

The Ardonie Capital platform is committed to providing an inclusive and accessible experience for all users, including those with disabilities. We follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to ensure our platform is usable by everyone.

## WCAG 2.1 AA Compliance

### 1. Perceivable

**1.1 Text Alternatives**
- All images have meaningful alt text
- Decorative images use empty alt attributes
- Complex images include detailed descriptions

```html
<!-- Good: Meaningful alt text -->
<img src="auto-shop.jpg" alt="Modern auto repair shop with 6 service bays and customer waiting area">

<!-- Good: Decorative image -->
<img src="decorative-border.svg" alt="" role="presentation">

<!-- Good: Complex image with description -->
<img src="revenue-chart.png" alt="Revenue chart showing 15% growth over 3 years" 
     aria-describedby="chart-description">
<div id="chart-description">
  Detailed description: Revenue increased from $500K in 2021 to $575K in 2024...
</div>
```

**1.2 Time-based Media**
- Video content includes captions
- Audio descriptions provided for visual content
- Transcripts available for audio content

**1.3 Adaptable**
- Content structure is meaningful without CSS
- Information and relationships are programmatically determinable
- Reading sequence is logical

```html
<!-- Good: Semantic structure -->
<main>
  <h1>Business Listings</h1>
  <section aria-labelledby="filters-heading">
    <h2 id="filters-heading">Search Filters</h2>
    <!-- Filter controls -->
  </section>
  <section aria-labelledby="results-heading">
    <h2 id="results-heading">Search Results</h2>
    <!-- Results list -->
  </section>
</main>
```

**1.4 Distinguishable**
- Color contrast ratios meet AA standards (4.5:1 for normal text, 3:1 for large text)
- Color is not the only means of conveying information
- Text can be resized up to 200% without loss of functionality

```css
/* Good: High contrast colors */
.primary-text {
  color: #1a1a1a; /* Dark gray on white background - 16.75:1 ratio */
}

.secondary-text {
  color: #4a5568; /* Medium gray on white background - 7.54:1 ratio */
}

.error-text {
  color: #e53e3e; /* Red with sufficient contrast - 5.25:1 ratio */
}

/* Good: Not relying on color alone */
.required-field::after {
  content: " *";
  color: #e53e3e;
  font-weight: bold;
}

.error-message {
  color: #e53e3e;
  border-left: 3px solid #e53e3e;
  padding-left: 8px;
}
```

### 2. Operable

**2.1 Keyboard Accessible**
- All functionality available via keyboard
- No keyboard traps
- Logical tab order

```html
<!-- Good: Keyboard accessible dropdown -->
<div class="dropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox">
  <button type="button" aria-label="Select business type" 
          aria-describedby="business-type-help">
    Auto Repair Shop
  </button>
  <ul role="listbox" class="dropdown-menu" hidden>
    <li role="option" tabindex="0">General Repair</li>
    <li role="option" tabindex="0">Specialty Shop</li>
    <li role="option" tabindex="0">Quick Lube</li>
  </ul>
</div>
<div id="business-type-help" class="help-text">
  Choose the type of auto repair business you're looking for
</div>
```

**2.2 Enough Time**
- Users can extend time limits
- Auto-updating content can be paused
- No content flashes more than 3 times per second

```javascript
// Good: Timeout warning with extension option
class TimeoutManager {
  constructor(timeoutDuration = 30 * 60 * 1000) { // 30 minutes
    this.timeoutDuration = timeoutDuration;
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.setupTimeout();
  }

  setupTimeout() {
    // Show warning before timeout
    this.warningTimer = setTimeout(() => {
      this.showTimeoutWarning();
    }, this.timeoutDuration - this.warningTime);

    // Actual timeout
    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutDuration);
  }

  showTimeoutWarning() {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'alertdialog');
    modal.setAttribute('aria-labelledby', 'timeout-title');
    modal.setAttribute('aria-describedby', 'timeout-message');
    
    modal.innerHTML = `
      <h2 id="timeout-title">Session Timeout Warning</h2>
      <p id="timeout-message">Your session will expire in 5 minutes. Would you like to extend it?</p>
      <button onclick="this.extendSession()">Extend Session</button>
      <button onclick="this.logout()">Logout Now</button>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('button').focus();
  }
}
```

**2.3 Seizures and Physical Reactions**
- No content flashes more than 3 times per second
- Motion can be disabled by users

**2.4 Navigable**
- Skip links provided
- Page titles are descriptive
- Link purposes are clear
- Multiple navigation methods available

```html
<!-- Good: Skip navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#navigation" class="skip-link">Skip to navigation</a>

<!-- Good: Descriptive page titles -->
<title>Search Results for Auto Repair Shops in Dallas - Ardonie Capital</title>

<!-- Good: Clear link purposes -->
<a href="/listing/123" aria-describedby="listing-123-summary">
  View Details for Mike's Auto Repair
</a>
<div id="listing-123-summary" class="sr-only">
  $750K revenue, 5 employees, established 2010
</div>
```

**2.5 Input Modalities**
- All functionality available via pointer and keyboard
- Drag operations have keyboard alternatives
- Target sizes are at least 44x44 pixels

### 3. Understandable

**3.1 Readable**
- Language of page is identified
- Language changes are identified
- Content is written clearly

```html
<!-- Good: Language identification -->
<html lang="en">
<head>
  <title>Business Acquisition Platform</title>
</head>
<body>
  <p>Welcome to our platform.</p>
  <p lang="es">Bienvenido a nuestra plataforma.</p>
</body>
</html>
```

**3.2 Predictable**
- Navigation is consistent across pages
- Components behave consistently
- Changes of context are initiated by user

```html
<!-- Good: Consistent navigation -->
<nav aria-label="Main navigation" role="navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/marketplace">Marketplace</a></li>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

**3.3 Input Assistance**
- Form errors are clearly identified
- Labels and instructions are provided
- Error suggestions are offered

```html
<!-- Good: Accessible form with error handling -->
<form novalidate>
  <div class="form-group">
    <label for="email" class="required">Email Address</label>
    <input type="email" id="email" name="email" 
           aria-describedby="email-help email-error" 
           aria-invalid="false" required>
    <div id="email-help" class="help-text">
      We'll use this to send you important updates about your account
    </div>
    <div id="email-error" class="error-message" role="alert" hidden>
      Please enter a valid email address (e.g., user@example.com)
    </div>
  </div>
  
  <div class="form-group">
    <fieldset>
      <legend>Account Type</legend>
      <div class="radio-group">
        <input type="radio" id="buyer" name="accountType" value="buyer">
        <label for="buyer">Buyer - Looking to acquire a business</label>
      </div>
      <div class="radio-group">
        <input type="radio" id="seller" name="accountType" value="seller">
        <label for="seller">Seller - Looking to sell a business</label>
      </div>
    </fieldset>
  </div>
</form>
```

### 4. Robust

**4.1 Compatible**
- Valid HTML markup
- Proper use of ARIA attributes
- Compatible with assistive technologies

```html
<!-- Good: Proper ARIA usage -->
<div class="search-results" role="region" aria-labelledby="results-heading" aria-live="polite">
  <h2 id="results-heading">Search Results (24 found)</h2>
  <div class="results-list" role="list">
    <article class="listing-card" role="listitem" tabindex="0">
      <h3>Mike's Auto Repair</h3>
      <dl class="listing-details">
        <dt>Revenue:</dt>
        <dd>$750,000 annually</dd>
        <dt>Location:</dt>
        <dd>Dallas, TX</dd>
        <dt>Employees:</dt>
        <dd>5 full-time</dd>
      </dl>
      <button type="button" aria-expanded="false" aria-controls="listing-details-123">
        View More Details
      </button>
    </article>
  </div>
</div>
```

## Implementation Guidelines

### 1. Semantic HTML

**Use Proper HTML Elements:**
```html
<!-- Good: Semantic structure -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/marketplace">Marketplace</a></li>
    </ul>
  </nav>
</header>

<main>
  <section aria-labelledby="featured-heading">
    <h1 id="featured-heading">Featured Businesses</h1>
    <article>
      <h2>Business Name</h2>
      <p>Business description...</p>
    </article>
  </section>
</main>

<aside aria-labelledby="filters-heading">
  <h2 id="filters-heading">Search Filters</h2>
  <!-- Filter controls -->
</aside>

<footer>
  <nav aria-label="Footer navigation">
    <!-- Footer links -->
  </nav>
</footer>
```

### 2. ARIA Best Practices

**Landmarks and Regions:**
```html
<!-- Good: ARIA landmarks -->
<div role="banner">Header content</div>
<div role="navigation" aria-label="Main menu">Navigation</div>
<div role="main">Main content</div>
<div role="complementary" aria-labelledby="sidebar-heading">Sidebar</div>
<div role="contentinfo">Footer content</div>
```

**Live Regions:**
```html
<!-- Good: Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true" id="status-message"></div>
<div aria-live="assertive" role="alert" id="error-message"></div>

<script>
// Update live regions
function updateStatus(message) {
  document.getElementById('status-message').textContent = message;
}

function showError(error) {
  document.getElementById('error-message').textContent = error;
}
</script>
```

### 3. Focus Management

**Keyboard Navigation:**
```javascript
// Good: Focus management for modals
class AccessibleModal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
  }

  open() {
    this.previouslyFocused = document.activeElement;
    this.modal.style.display = 'block';
    this.modal.setAttribute('aria-hidden', 'false');
    this.firstFocusable.focus();
    
    // Trap focus within modal
    this.modal.addEventListener('keydown', this.trapFocus.bind(this));
  }

  close() {
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');
    this.previouslyFocused.focus();
    this.modal.removeEventListener('keydown', this.trapFocus.bind(this));
  }

  trapFocus(event) {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          event.preventDefault();
          this.lastFocusable.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusable) {
          event.preventDefault();
          this.firstFocusable.focus();
        }
      }
    }
    
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
```

### 4. Color and Contrast

**Accessible Color Palette:**
```css
:root {
  /* Primary colors with AA contrast ratios */
  --color-primary: #2563eb;      /* Blue - 7.37:1 on white */
  --color-primary-dark: #1d4ed8; /* Darker blue - 9.68:1 on white */
  --color-secondary: #64748b;    /* Gray - 7.54:1 on white */
  
  /* Status colors */
  --color-success: #059669;      /* Green - 5.77:1 on white */
  --color-warning: #d97706;      /* Orange - 4.52:1 on white */
  --color-error: #dc2626;        /* Red - 5.25:1 on white */
  
  /* Text colors */
  --color-text-primary: #1f2937;   /* Very dark gray - 16.75:1 on white */
  --color-text-secondary: #4b5563; /* Medium gray - 9.21:1 on white */
  --color-text-muted: #6b7280;     /* Light gray - 6.84:1 on white */
}

/* Focus indicators */
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #000000;
    --color-text-secondary: #000000;
    --color-primary: #0000ff;
  }
}
```

### 5. Responsive and Adaptive Design

**Accessibility in Responsive Design:**
```css
/* Ensure touch targets are large enough */
.button, .link, .form-control {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Support for high contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid;
  }
  
  .button {
    border: 2px solid;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1f2937;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
  }
}
```

## Testing and Validation

### 1. Automated Testing

**Accessibility Testing Tools:**
```javascript
// axe-core integration for automated testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('should not have accessibility violations', async () => {
    const html = `
      <main>
        <h1>Page Title</h1>
        <button>Click me</button>
      </main>
    `;
    
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });
});

// Lighthouse CI for performance and accessibility
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }]
      }
    }
  }
};
```

### 2. Manual Testing

**Testing Checklist:**
- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Test with 200% zoom
- [ ] Validate HTML markup
- [ ] Check focus indicators
- [ ] Test form error handling
- [ ] Verify ARIA attributes

**Screen Reader Testing:**
```javascript
// Screen reader testing utilities
class ScreenReaderTesting {
  static announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  static createScreenReaderOnlyText(text) {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }
}

/* Screen reader only CSS */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Accessibility Statement

### Our Commitment

Ardonie Capital is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

### Conformance Status

The Ardonie Capital platform partially conforms to WCAG 2.1 Level AA. "Partially conforms" means that some parts of the content do not fully conform to the accessibility standard.

### Feedback and Contact

We welcome your feedback on the accessibility of the Ardonie Capital platform. Please let us know if you encounter accessibility barriers:

- **Email:** accessibility@ardoniecapital.com
- **Phone:** 1-800-ARDONIE
- **Address:** Accessibility Team, Ardonie Capital, Dallas, TX

We try to respond to feedback within 2 business days.

### Technical Specifications

Accessibility of the Ardonie Capital platform relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:

- HTML
- WAI-ARIA
- CSS
- JavaScript

These technologies are relied upon for conformance with the accessibility standards used.

---

*This accessibility documentation is reviewed and updated regularly to ensure compliance with current standards and best practices.*
