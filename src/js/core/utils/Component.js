import { createElement } from "./dom-utils.js";

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
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.textContent = null;
    this.eventListeners = [];
  }

  /**
   * Creates a new Component instance.
   * @param {string} tagName - The HTML tag name for the component
   * @returns {Component} A new Component instance
   */
  static create(tagName) {
    return new Component(tagName);
  }

  /**
   * Sets the ID of the element.
   * @param {string} id - The ID to set
   * @returns {Component} This component instance for chaining
   */
  id(id) {
    this.attributes.id = id;
    return this;
  }

  /**
   * Adds a class to the element.
   * @param {string} className - The CSS class name to add
   * @returns {Component} This component instance for chaining
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
   * @param {string} key - The attribute name
   * @param {string} value - The attribute value
   * @returns {Component} This component instance for chaining
   */
  attr(key, value) {
    this.attributes[key] = value;
    return this;
  }

  /**
   * Sets inline styles.
   * @param {string | object} styles - CSS string or object.
   * @returns {Component}
   */
  style(styles) {
    if (typeof styles === "object") {
      const styleString = Object.entries(styles)
        .map(
          ([k, v]) =>
            `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${v}`,
        )
        .join("; ");
      this.attributes.style = styleString;
    } else {
      this.attributes.style = styles;
    }
    return this;
  }

  /**
   * Sets the text content.
   * @param {string} text - The text content to set
   * @returns {Component} This component instance for chaining
   */
  text(text) {
    this.textContent = text;
    return this;
  }

  /**
   * Adds an event listener.
   * @param {string} event - The event name
   * @param {Function} handler - The event handler function
   * @returns {Component} This component instance for chaining
   */
  on(event, handler) {
    this.eventListeners.push({ event, handler });
    return this;
  }

  /**
   * Adds a child component or element.
   * @param {Component|HTMLElement|string} child - The child to add
   * @returns {Component} This component instance for chaining
   */
  child(child) {
    if (child) {
      this.children.push(child);
    }
    return this;
  }

  /**
   * Renders the component to an HTMLElement.
   * @returns {HTMLElement} The rendered HTML element
   */
  render() {
    const content =
      this.children.length > 0
        ? this.children.map(c => (c instanceof Component ? c.render() : c))
        : this.textContent;

    const element = createElement(this.tagName, this.attributes, content);

    this.eventListeners.forEach(({ event, handler }) => {
      element.addEventListener(event, handler);
    });

    return element;
  }
}
