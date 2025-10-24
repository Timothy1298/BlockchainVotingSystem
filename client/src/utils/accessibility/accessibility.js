// Accessibility utilities for keyboard navigation and ARIA attributes

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle Enter key for buttons and interactive elements
  handleEnterKey: (callback) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },

  // Handle Escape key for modals and dropdowns
  handleEscapeKey: (callback) => (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },

  // Handle arrow keys for navigation
  handleArrowKeys: (onUp, onDown, onLeft, onRight) => (event) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onRight?.();
        break;
    }
  },

  // Handle Tab key for focus management
  handleTabKey: (onTab, onShiftTab) => (event) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        onShiftTab?.();
      } else {
        onTab?.();
      }
    }
  }
};

// ARIA attribute helpers
export const ariaAttributes = {
  // Generate unique IDs for form elements
  generateId: (prefix = 'element') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Create ARIA describedby attribute
  createDescribedBy: (...ids) => ids.filter(Boolean).join(' '),

  // Create ARIA labelledby attribute
  createLabelledBy: (...ids) => ids.filter(Boolean).join(' '),

  // Form field ARIA attributes
  getFormFieldAria: (fieldName, hasError, hasDescription) => {
    const baseId = ariaAttributes.generateId(fieldName);
    const errorId = hasError ? `${baseId}-error` : null;
    const descriptionId = hasDescription ? `${baseId}-description` : null;
    
    return {
      id: baseId,
      'aria-invalid': hasError,
      'aria-describedby': ariaAttributes.createDescribedBy(errorId, descriptionId),
      'aria-required': true
    };
  },

  // Button ARIA attributes
  getButtonAria: (label, pressed = null, expanded = null) => {
    const attrs = {
      'aria-label': label
    };
    
    if (pressed !== null) {
      attrs['aria-pressed'] = pressed;
    }
    
    if (expanded !== null) {
      attrs['aria-expanded'] = expanded;
    }
    
    return attrs;
  },

  // Modal ARIA attributes
  getModalAria: (title, description) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': title,
    'aria-describedby': description
  }),

  // List ARIA attributes
  getListAria: (label, orientation = 'vertical') => ({
    role: 'list',
    'aria-label': label,
    'aria-orientation': orientation
  }),

  // List item ARIA attributes
  getListItemAria: (label) => ({
    role: 'listitem',
    'aria-label': label
  })
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Focus first focusable element
  focusFirst: (element) => {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElement?.focus();
  },

  // Focus last focusable element
  focusLast: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1];
    lastElement?.focus();
  },

  // Restore focus to previously focused element
  restoreFocus: (element) => {
    element?.focus();
  }
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = ''sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Create visually hidden text for screen readers
  createScreenReaderText: (text) => {
    const element = document.createElement('span');
    element.className = ''sr-only';
    element.textContent = text;
    return element;
  }
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Create field error message
  createErrorMessage: (fieldName, error) => {
    const errorId = ariaAttributes.generateId(`${fieldName}-error`);
    return {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite',
      className: 'text-red-400 text-sm mt-1'
    };
  },

  // Create field description
  createDescription: (fieldName, description) => {
    const descId = ariaAttributes.generateId(`${fieldName}-description`);
    return {
      id: descId,
      className: 'text-gray-400 text-sm mt-1'
    };
  },

  // Validate form accessibility
  validateFormAccessibility: (formElement) => {
    const issues = [];
    
    // Check for missing labels
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      const label = formElement.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push(`Input with id "${id}" is missing a label`);
      }
    });
    
    // Check for missing error associations
    const errorElements = formElement.querySelectorAll('[role="alert"]');
    errorElements.forEach(error => {
      const id = error.id;
      const associatedInput = formElement.querySelector(`[aria-describedby*="${id}"]`);
      
      if (!associatedInput) {
        issues.push(`Error message with id "${id}" is not associated with any input`);
      }
    });
    
    return issues;
  }
};

// Animation accessibility
export const animationAccessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get animation settings based on user preference
  getAnimationSettings: (defaultSettings) => {
    if (animationAccessibility.prefersReducedMotion()) {
      return {
        ...defaultSettings,
        duration: 0,
        delay: 0
      };
    }
    return defaultSettings;
  }
};

export default {
  keyboardNavigation,
  ariaAttributes,
  focusManagement,
  screenReader,
  colorContrast,
  formAccessibility,
  animationAccessibility
};
