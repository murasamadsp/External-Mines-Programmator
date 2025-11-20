import { animate } from 'animejs';


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
 * Creates a button with standard styling and animations.
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
    className: `btn ${className}`.trim(),
    style: 'will-change: transform;'
  }, [
    icon ? createElement('span', { className: 'btn-icon' }, icon) : null,
    createElement('span', { className: 'btn-text' }, text)
  ]);

  if (onClick) {
    button.addEventListener('click', (e) => {
      // Click animation
      animate(button, {
        scale: [0.95, 1],
        duration: 100,
        ease: 'inOutQuad'
      });
      onClick(e);
    });
  }

  // Hover animations
  button.addEventListener('mouseenter', () => {
    animate(button, {
      scale: 1.05,
      duration: 200,
      ease: 'outQuad'
    });
  });

  button.addEventListener('mouseleave', () => {
    animate(button, {
      scale: 1,
      duration: 200,
      ease: 'outQuad'
    });
  });

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
 * Creates an input element with standard styling.
 * @param {Object} options - Input options.
 * @param {string} options.id - Input ID.
 * @param {string} [options.type='text'] - Input type.
 * @param {string} [options.value=''] - Initial value.
 * @param {string} [options.placeholder=''] - Placeholder text.
 * @param {string} [options.className=''] - Additional classes.
 * @param {Function} [options.onInput] - Input handler.
 * @param {Function} [options.onKeyDown] - Keydown handler.
 * @returns {HTMLInputElement} The created input.
 */
export function createInput({ id, type = 'text', value = '', placeholder = '', className = '', onInput, onKeyDown }) {
  const input = createElement('input', {
    id,
    type,
    value,
    placeholder,
    className: `form-input ${className}`.trim(),
    name: id || 'field',
    autocomplete: 'off'
  });

  if (onInput) {
    input.addEventListener('input', onInput);
  }

  if (onKeyDown) {
    input.addEventListener('keydown', onKeyDown);
  }

  // Focus animation
  input.addEventListener('focus', () => {
    animate(input, {
      borderColor: '#3b82f6', // Blue-500
      duration: 300,
      ease: 'outQuad'
    });
  });

  input.addEventListener('blur', () => {
    animate(input, {
      borderColor: '#374151', // Gray-700
      duration: 300,
      ease: 'outQuad'
    });
  });

  return input;
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

  // Animate in
  animate(feedback, {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 300,
    ease: 'outQuad'
  });

  setTimeout(() => {
    // Animate out
    animate(feedback, {
      opacity: 0,
      translateY: -10,
      duration: 300,
      ease: 'inQuad',
      onComplete: () => feedback.remove()
    });
  }, duration);
}
