/**
 * Animation Engine - Centralized wrapper around anime.js v4
 * Provides project-specific animation presets and utilities
 */

import { animate, stagger, createTimeline } from 'animejs';

/**
 * Animation presets for common UI patterns
 */
export const AnimationPresets = {
  // Dialog animations
  dialog: {
    open: (element) => animate(element, {
      scale: [0.9, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 250,
      ease: 'outBack'
    }),
    close: (element, onComplete) => animate(element, {
      scale: 0.9,
      opacity: 0,
      translateY: 20,
      duration: 200,
      ease: 'inQuad',
      onComplete
    })
  },

  // Overlay animations
  overlay: {
    fadeIn: (element) => animate(element, {
      opacity: [0, 1],
      duration: 250,
      ease: 'outQuad'
    }),
    fadeOut: (element, onComplete) => animate(element, {
      opacity: 0,
      duration: 200,
      ease: 'inQuad',
      onComplete
    })
  },

  // Button interactions
  button: {
    click: (element) => animate(element, {
      scale: [0.95, 1],
      duration: 100,
      ease: 'inOutQuad'
    }),
    hoverIn: (element) => animate(element, {
      scale: 1.05,
      duration: 200,
      ease: 'outQuad'
    }),
    hoverOut: (element) => animate(element, {
      scale: 1,
      duration: 200,
      ease: 'outQuad'
    })
  },

  // Grid cell animations
  cell: {
    highlight: (element) => animate(element, {
      backgroundColor: ['transparent', '#3b82f620', 'transparent'],
      duration: 600,
      ease: 'inOutQuad'
    }),
    select: (element) => animate(element, {
      scale: [0.95, 1],
      duration: 150,
      ease: 'outQuad'
    }),
    pulse: (element) => animate(element, {
      scale: [1, 1.1, 1],
      duration: 600,
      ease: 'inOutQuad'
    })
  },

  // Input animations
  input: {
    focus: (element) => animate(element, {
      borderColor: '#3b82f6',
      duration: 300,
      ease: 'outQuad'
    }),
    blur: (element) => animate(element, {
      borderColor: '#374151',
      duration: 300,
      ease: 'outQuad'
    }),
    shake: (element) => animate(element, {
      translateX: [0, -10, 10, -10, 10, 0],
      duration: 400,
      ease: 'linear'
    })
  },

  // Notification/Toast
  toast: {
    enter: (element) => animate(element, {
      translateY: [-100, 0],
      opacity: [0, 1],
      duration: 400,
      ease: 'outBack'
    }),
    exit: (element, onComplete) => animate(element, {
      translateX: 300,
      opacity: 0,
      duration: 300,
      ease: 'inQuad',
      onComplete
    })
  },

  // Panel animations
  panel: {
    slideInLeft: (element) => animate(element, {
      translateX: [-300, 0],
      opacity: [0, 1],
      duration: 350,
      ease: 'outQuad'
    }),
    slideInRight: (element) => animate(element, {
      translateX: [300, 0],
      opacity: [0, 1],
      duration: 350,
      ease: 'outQuad'
    }),
    slideOutLeft: (element, onComplete) => animate(element, {
      translateX: -300,
      opacity: 0,
      duration: 300,
      ease: 'inQuad',
      onComplete
    }),
    slideOutRight: (element, onComplete) => animate(element, {
      translateX: 300,
      opacity: 0,
      duration: 300,
      ease: 'inQuad',
      onComplete
    })
  },

  // List animations
  list: {
    staggerIn: (elements, delay = 50) => animate(elements, {
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 400,
      delay: stagger(delay),
      ease: 'outQuad'
    }),
    staggerOut: (elements, delay = 30) => animate(elements, {
      translateY: 20,
      opacity: 0,
      duration: 300,
      delay: stagger(delay),
      ease: 'inQuad'
    })
  },

  // Loading animations
  loading: {
    spin: (element) => animate(element, {
      rotate: 360,
      duration: 1000,
      ease: 'linear',
      loop: true
    }),
    pulse: (element) => animate(element, {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      duration: 1500,
      ease: 'inOutQuad',
      loop: true
    })
  }
};

/**
 * Animation engine wrapper with utility methods
 */
export const AnimationEngine = {
  /**
   * Direct access to anime.js animate function
   */
  animate,

  /**
   * Direct access to anime.js stagger function
   */
  stagger,

  /**
   * Direct access to anime.js createTimeline function
   */
  createTimeline,

  /**
   * Access to animation presets
   */
  presets: AnimationPresets,

  /**
   * Quick fade in animation
   */
  fadeIn(element, duration = 300) {
    return animate(element, {
      opacity: [0, 1],
      duration,
      ease: 'outQuad'
    });
  },

  /**
   * Quick fade out animation
   */
  fadeOut(element, duration = 300, onComplete) {
    return animate(element, {
      opacity: 0,
      duration,
      ease: 'inQuad',
      onComplete
    });
  },

  /**
   * Slide in from direction
   */
  slideIn(element, direction = 'up', distance = 20, duration = 300) {
    const translateProp = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';
    const value = direction === 'up' || direction === 'left' ? distance : -distance;
    
    return animate(element, {
      [translateProp]: [value, 0],
      opacity: [0, 1],
      duration,
      ease: 'outQuad'
    });
  },

  /**
   * Slide out to direction
   */
  slideOut(element, direction = 'up', distance = 20, duration = 300, onComplete) {
    const translateProp = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';
    const value = direction === 'up' || direction === 'left' ? -distance : distance;
    
    return animate(element, {
      [translateProp]: value,
      opacity: 0,
      duration,
      ease: 'inQuad',
      onComplete
    });
  },

  /**
   * Scale animation
   */
  scale(element, from = 0.5, to = 1, duration = 300) {
    return animate(element, {
      scale: [from, to],
      duration,
      ease: 'outBack'
    });
  },

  /**
   * Attention-seeking pulse
   */
  pulse(element, scale = 1.1, duration = 600) {
    return animate(element, {
      scale: [1, scale, 1],
      duration,
      ease: 'inOutQuad'
    });
  },

  /**
   * Shake effect (for errors)
   */
  shake(element, intensity = 10, duration = 400) {
    return animate(element, {
      translateX: [0, -intensity, intensity, -intensity, intensity, 0],
      duration,
      ease: 'linear'
    });
  },

  /**
   * Create a sequence of animations using timeline
   */
  sequence(animations) {
    const timeline = createTimeline();
    animations.forEach(({ element, props, offset = 0 }) => {
      timeline.add(element, props, offset);
    });
    return timeline;
  }
};

// Export everything for convenience
export { animate, stagger, createTimeline };

// Default export
export default AnimationEngine;
