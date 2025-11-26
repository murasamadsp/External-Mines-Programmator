/**

 * Creates a DOM element with specified tag, attributes, and content.
 * @param {string} tag - The HTML tag name.
 * @param {Object} [attributes={}] - Key-value pairs of attributes.
 * @param {string|HTMLElement|Array} [content=null] - Text content or child elements.
 * @returns {HTMLElement} The created element.
 */
export function createElement(tag, attributes = {}, content = null) {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  if (content) {
    if (Array.isArray(content)) {
      content.forEach(child => {
        if (child) element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
      });
    } else if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }
  }

  return element;
}

/**
 * Creates a button with standard styling.
 * @param {Object} options - Button options.
 * @param {string} options.id - Button ID.
 * @param {string} options.text - Button text.
 * @param {string} [options.className=''] - Additional classes.
 * @param {Function} [options.onClick] - Click handler.
 * @param {string} [options.icon] - Optional icon (emoji or HTML).
 * @returns {HTMLButtonElement} The created button.
 */
export function createButton({ id, text, className = '', onClick, icon = '' }) {
  const button = createElement('button', {
    id,
    className: `btn ${className}`.trim()
  }, [
    icon ? createElement('span', { className: 'btn-icon' }, icon) : null,
    text ? createElement('span', { className: 'btn-text' }, text) : null
  ].filter(Boolean));

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Creates a section with a title and content.
 * @param {string} title - Section title.
 * @param {HTMLElement} content - Section content.
 * @param {string} [className=''] - Additional classes.
 * @returns {HTMLElement} The created section.
 */
export function createSection(title, content, className = '') {
  return createElement('div', { className: `controls-section ${className}`.trim() }, [
    createElement('h4', {}, title),
    content
  ]);
}

/**
 * Creates an input element with standard styling and protection from browser extensions.
 * @param {Object} options - Input options.
 * @param {string} options.id - Input ID.
 * @param {string} [options.type='text'] - Input type.
 * @param {string} [options.value=''] - Initial value.
 * @param {string} [options.placeholder=''] - Placeholder text.
 * @param {string} [options.className=''] - Additional classes.
 * @param {Function} [options.onInput] - Input handler.
 * @param {Function} [options.onKeyDown] - Keydown handler.
 * @returns {HTMLElement} The created input (may be contentEditable div for text inputs).
 */
export function createInput({ id, type = 'text', value = '', placeholder = '', className = '', onInput, onKeyDown }) {
  let input;

  // Use contentEditable div for text inputs to completely avoid extension interference
  if (type === 'text') {
    input = createElement('div', {
      id,
      className: `form-input form-input-editable ${className}`.trim(),
      contentEditable: 'true',
      'data-placeholder': placeholder,
      'data-type': 'text',
      style: 'outline: none; cursor: text; min-height: 2.5rem; padding: 0.5rem 0.75rem; border: 1px solid #374151; border-radius: 0.375rem; background: white; color: #111827; font-size: 0.875rem; line-height: 1.25rem;'
    }, value);

    // Handle placeholder for contentEditable
    const updatePlaceholder = () => {
      if (!input.textContent.trim() && placeholder) {
        input.setAttribute('data-placeholder-visible', 'true');
        input.style.color = '#9ca3af';
        if (!input.textContent) input.textContent = placeholder;
      } else {
        input.removeAttribute('data-placeholder-visible');
        input.style.color = '#111827';
      }
    };

    updatePlaceholder();

    input.addEventListener('focus', () => {
      if (input.getAttribute('data-placeholder-visible') === 'true') {
        input.textContent = '';
        input.style.color = '#111827';
        input.removeAttribute('data-placeholder-visible');
      }
    });

    input.addEventListener('blur', updatePlaceholder);

    // Override input handler for contentEditable
    if (onInput) {
      input.addEventListener('input', (e) => {
        if (e.isTrusted) onInput(e);
      });
    }

  } else {
    // Use regular input for number types and others
    input = createElement('input', {
      id,
      type,
      value,
      placeholder,
      className: `form-input ${className}`.trim(),
      name: id || 'field',
      autocomplete: 'new-password',
      'data-form-type': 'other',
      spellcheck: 'false',
      autocorrect: 'off',
      autocapitalize: 'off'
    });

    if (onInput) {
      input.addEventListener('input', onInput);
    }
  }

  if (onInput) {
    input.addEventListener('input', onInput);
  }

  if (onKeyDown) {
    input.addEventListener('keydown', onKeyDown);
  }

  input.addEventListener('focus', (e) => {
    // Prevent browser extensions from interfering
    e.stopPropagation();
  });

  // Prevent browser extensions from auto-filling
  input.addEventListener('beforeinput', (e) => {
    // Allow only user-initiated input, block extension interference
    if (!e.isTrusted) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Additional protection against iCloud and other password managers
  input.addEventListener('focus', (e) => {
    // Force attributes after focus to override extension interference
    setTimeout(() => {
      input.setAttribute('autocomplete', 'new-password');
      input.setAttribute('data-form-type', 'other');
      input.setAttribute('aria-autocomplete', 'none');
      input.style.setProperty('-webkit-user-modify', 'read-write-plaintext-only', 'important');
      // Additional aggressive protection
      input.setAttribute('data-lpignore', 'true'); // LastPass
      input.setAttribute('data-1p-ignore', 'true'); // 1Password
      input.setAttribute('data-bw-ignore', 'true'); // Bitwarden
    }, 0);
  });

  // Block form submission attempts from extensions
  input.addEventListener('input', (e) => {
    if (!e.isTrusted) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  });

  // Aggressive protection - override extension methods
  let originalValue = input.value;
  Object.defineProperty(input, 'value', {
    get: function() { return originalValue; },
    set: function(val) {
      if (this._isTrustedSet !== true) {
        // Block untrusted value changes
        console.warn('Blocked untrusted input change from browser extension');
        return;
      }
      originalValue = val;
      // Update the actual DOM value only for trusted changes
      this.setAttribute('value', val);
      this._updateDisplay(val);
    }
  });

  // Method to safely set value
  input._setTrustedValue = function(val) {
    this._isTrustedSet = true;
    this.value = val;
    this._isTrustedSet = false;
  };

  // Safe display update
  input._updateDisplay = function(val) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.setAttribute('value', val);
    this.value = val;
    if (start !== null && end !== null) {
      this.setSelectionRange(start, end);
    }
  };

  input.addEventListener('blur', () => {
    // Blur handling
  });

  return input;
}

/**
 * Global protection against browser extensions interfering with form inputs
 */
export function setupGlobalInputProtection() {
  // Function to check if an element is protected
  const isProtected = (element) => {
    return element && (
      element.classList?.contains('form-input') ||
      element.classList?.contains('form-input-editable') ||
      element.hasAttribute?.('data-form-type') ||
      element.getAttribute?.('autocomplete') === 'new-password'
    );
  };

  // Track recent user interactions to distinguish legitimate from malicious focus
  let lastUserInteraction = 0;

  // Track user interactions
  ['click', 'mousedown', 'keydown', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      lastUserInteraction = performance.now();
    }, true);
  });

  // Global event listener to detect and block extension interference
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (isProtected(target)) {
      // Allow focus if it happened shortly after user interaction
      const timeSinceInteraction = performance.now() - lastUserInteraction;

      // Only block if focus happens more than 100ms after last user interaction
      // and event is not trusted
      const isFromExtension = !e.isTrusted && timeSinceInteraction > 100;

      if (isFromExtension) {
        console.warn('🚫 Blocked suspected extension focus on protected input');
        e.preventDefault();
        e.stopImmediatePropagation();
        target.blur();
        return false;
      }

      target._lastTrustedFocus = performance.now();
    }
  }, true);

  // Setup MutationObserver to detect and revert extension modifications
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const element = mutation.target;
        if (isProtected(element)) {
          const attrName = mutation.attributeName;

          // Revert changes to critical attributes
          if (attrName === 'autocomplete' && element.getAttribute('autocomplete') !== 'new-password') {
            console.warn('🔄 Extension tried to change autocomplete, reverting');
            element.setAttribute('autocomplete', 'new-password');
          }
        }
      }
    });
  });

  // Start observing protected elements
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['autocomplete', 'data-form-type'],
    subtree: true
  });

  console.log('🛡️ Smart input protection activated - tracks user interactions to allow legitimate operations');
}

/**
 * Shows a feedback message.
 * @param {HTMLElement} container - Container to append feedback to.
 * @param {string} message - Message text.
 * @param {string} [type='info'] - Message type (info, success, error).
 * @param {number} [duration=3000] - Duration in ms.
 */
export function showFeedback(container, message, type = 'info', duration = 3000) {
  const feedback = createElement('div', {
    className: `control-feedback control-feedback-${type}`
  }, message);

  container.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, duration);
}
