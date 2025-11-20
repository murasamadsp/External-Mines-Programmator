import { createElement } from './dom-utils.js';

/**
 * A fluent API builder for creating DOM elements.
 * Example:
 * new Component('div')
 *   .class('my-class')
 *   .text('Hello')
 *   .on('click', () => console.log('Clicked'))
 *   .render();
 */
export class Component {
  /**
   * @param {string} tagName - The HTML tag name.
   */
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.textContent = null;
    this.eventListeners = [];
  }

  /**
   * Creates a new Component instance.
   * @param {string} tagName 
   * @returns {Component}
   */
  static create(tagName) {
    return new Component(tagName);
  }

  /**
   * Sets the ID of the element.
   * @param {string} id 
   * @returns {Component}
   */
  id(id) {
    this.attributes.id = id;
    return this;
  }

  /**
   * Adds a class to the element.
   * @param {string} className 
   * @returns {Component}
   */
  class(className) {
    if (this.attributes.className) {
      this.attributes.className += ` ${className}`;
    } else {
      this.attributes.className = className;
    }
    return this;
  }

  /**
   * Sets an attribute.
   * @param {string} key 
   * @param {string} value 
   * @returns {Component}
   */
  attr(key, value) {
    this.attributes[key] = value;
    return this;
  }

  /**
   * Sets inline styles.
   * @param {string|Object} styles - CSS string or object.
   * @returns {Component}
   */
  style(styles) {
    if (typeof styles === 'object') {
      const styleString = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${v}`)
        .join('; ');
      this.attributes.style = styleString;
    } else {
      this.attributes.style = styles;
    }
    return this;
  }

  /**
   * Sets the text content.
   * @param {string} text 
   * @returns {Component}
   */
  text(text) {
    this.textContent = text;
    return this;
  }

  /**
   * Adds an event listener.
   * @param {string} event 
   * @param {Function} handler 
   * @returns {Component}
   */
  on(event, handler) {
    this.eventListeners.push({ event, handler });
    return this;
  }

  /**
   * Adds a child component or element.
   * @param {Component|HTMLElement|string} child 
   * @returns {Component}
   */
  child(child) {
    if (child) {
      this.children.push(child);
    }
    return this;
  }

  /**
   * Renders the component to an HTMLElement.
   * @returns {HTMLElement}
   */
  render() {
    const content = this.children.length > 0 
      ? this.children.map(c => c instanceof Component ? c.render() : c)
      : this.textContent;

    const element = createElement(this.tagName, this.attributes, content);

    this.eventListeners.forEach(({ event, handler }) => {
      element.addEventListener(event, handler);
    });

    return element;
  }
}
