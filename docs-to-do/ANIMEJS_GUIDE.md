# Anime.js v4 - Usage Guide for External Mines Programmator

## Overview

**Anime.js v4.2.2** is already installed and configured in this project. It provides lightweight, performant animations for UI elements.

- **Package**: `animejs` (v4.2.2)
- **Current Usage**: Dialog animations, button interactions, input focus effects
- **Import**: `import { animate } from 'animejs';`

## Installation Status

✅ **Already Installed** - No action needed!

```json
"dependencies": {
  "animejs": "^4.2.2"
}
```

## Current Usage in Project

### 1. Dialog Animations
Location: [`src/js/features/editor/components/dialogs/BaseDialog.js`](file:///Users/murasama/Projects/External-Mines-Programmator/src/js/features/editor/components/dialogs/BaseDialog.js)

```javascript
import { animate } from 'animejs';

// Opening animation
animate(this.overlay, {
  opacity: [0, 1],
  duration: 250,
  ease: 'outQuad'       // v4: 'ease' instead of 'easing'
});

animate(this.dialog, {
  scale: [0.9, 1],
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 250,
  ease: 'outBack'       // v4: 'ease' instead of 'easing'
});

// Closing animation
animate(this.dialog, {
  scale: 0.9,
  opacity: 0,
  translateY: 20,
  duration: 200,
  ease: 'inQuad',       // v4: 'ease' instead of 'easing'
  onComplete: () => this.cleanup(result)
});
```

### 2. Button Interactions
Location: [`src/js/core/utils/dom-utils.js`](file:///Users/murasama/Projects/External-Mines-Programmator/src/js/core/utils/dom-utils.js)

```javascript
// Click animation
button.addEventListener('click', () => {
  animate(button, {
    scale: [0.95, 1],
    duration: 100,
    ease: 'inOutQuad'     // v4: 'ease' instead of 'easing'
  });
});

// Hover animations
button.addEventListener('mouseenter', () => {
  animate(button, {
    scale: 1.05,
    duration: 200,
    ease: 'outQuad'       // v4: 'ease' instead of 'easing'
  });
});
```

### 3. Input Focus Effects
```javascript
input.addEventListener('focus', () => {
  animate(input, {
    borderColor: '#3b82f6',
    duration: 300,
    ease: 'outQuad'       // v4: 'ease' instead of 'easing'
  });
});
```

### 4. Feedback Messages
```javascript
// Fade in
animate(feedback, {
  opacity: [0, 1],
  translateY: [10, 0],
  duration: 300,
  ease: 'outQuad'       // v4: 'ease' instead of 'easing'
});

// Fade out
animate(feedback, {
  opacity: 0,
  translateY: -10,
  duration: 300,
  ease: 'inQuad',       // v4: 'ease' instead of 'easing'
  onComplete: () => feedback.remove()
});
```

## Core API Reference

### Basic Syntax

```javascript
import { animate } from 'animejs';

// Simple animation
animate(element, {
  translateX: 250,
  duration: 800
});

// From-to animation
animate(element, {
  opacity: [0, 1],      // [from, to]
  scale: [0.5, 1],
  duration: 500
});

// Object syntax for more control
animate(element, {
  opacity: { to: 1, duration: 200 },
  scale: { to: 1.5, duration: 400 }
});
```

### Common Properties

#### Transform Properties
```javascript
animate(element, {
  x: 100,              // Shorthand for translateX (px, %, em)
  y: -50,              // Shorthand for translateY
  z: 0,                // Shorthand for translateZ (3D)
  translateX: 100,     // Full form
  translateY: -50,
  translateZ: 0,
  rotate: '1turn',     // Rotation (deg, rad, turn)
  rotateX: 180,        // 3D rotation
  rotateY: 90,
  rotateZ: 45,
  scale: 1.5,          // Uniform scale
  scaleX: 2,           // Scale X-axis
  scaleY: 0.5,         // Scale Y-axis
  scaleZ: 1,           // Scale Z-axis (3D)
  skewX: 10,           // Skew on X-axis (deg)
  skewY: -5            // Skew on Y-axis (deg)
});
```

#### CSS Properties
```javascript
animate(element, {
  opacity: 0.5,
  backgroundColor: '#ff6b6b',
  color: '#ffffff',
  borderRadius: '50%',
  borderColor: '#3b82f6',
  width: '200px',
  height: '100px',
  padding: '20px',
  margin: '10px'
});
```

### Timing & Easing

#### Duration
```javascript
animate(element, {
  translateX: 250,
  duration: 1000        // Milliseconds (default: 1000)
});
```

#### Delay
```javascript
animate(element, {
  translateX: 250,
  delay: 500            // Start after 500ms
});
```

#### Loop Delay
```javascript
animate(element, {
  translateX: 250,
  loop: 3,              // Repeat 3 times (total 4 iterations)
  loopDelay: 500        // 500ms delay between loops
});
```

#### Easing Functions

> [!NOTE]
> **v4 Change**: `easing` parameter is now `ease`, and function names have been shortened (removed 'ease' prefix)

**Available easings:**
- `linear`
- `in`, `out`, `inOut` - Default quadratic (power of 2)
- `in(n)`, `out(n)`, `inOut(n)` - Custom power (e.g., `out(3)` for cubic)
- `inQuad`, `outQuad`, `inOutQuad` (or use `in(2)`, `out(2)`, etc.)
- `inCubic`, `outCubic`, `inOutCubic`
- `inQuart`, `outQuart`, `inOutQuart`
- `inQuint`, `outQuint`, `inOutQuint`
- `inSine`, `outSine`, `inOutSine`
- `inExpo`, `outExpo`, `inOutExpo`
- `inCirc`, `outCirc`, `inOutCirc`
- `inBack`, `outBack`, `inOutBack`
- `inElastic`, `outElastic`, `inOutElastic`
- `inBounce`, `outBounce`, `inOutBounce`

```javascript
animate(element, {
  translateX: 250,
  ease: 'outBack'       // v4: 'ease' instead of 'easing'
  // Default is 'out(2)' (same as 'outQuad')
});

// Custom power easing
animate(element, {
  x: 250,
  ease: 'out(3)'        // Cubic easing
});
```

### Advanced Features

#### Stagger (Multiple Elements)

> [!NOTE]
> **v4 Feature**: Import `stagger` function for sequential delays

```javascript
import { animate, stagger } from 'animejs';

const elements = document.querySelectorAll('.item');

// Using stagger function
animate(elements, {
  translateY: -20,
  opacity: [0, 1],
  duration: 400,
  delay: stagger(50)  // 50ms between each element
});

// Stagger with options
animate(elements, {
  x: 250,
  delay: stagger(100, {
    from: 'center',     // 'first', 'last', 'center', or index
    reversed: true,     // Reverse the order
    ease: 'outQuad'     // Easing for the stagger itself
  })
});

// Manual delay function (also works)
animate(elements, {
  translateY: -20,
  delay: (el, i) => i * 50  // Custom delay function
});
```

#### Loop and Direction Control

> [!IMPORTANT]
> **v4 Change**: `direction` parameter replaced by `reversed` and `alternate`

```javascript
// Loop: Number of times to REPEAT (not total iterations)
animate(element, {
  rotate: 360,
  loop: 2,              // Repeats 2 times = 3 total iterations
  duration: 1000
});

// Alternate: Play forward then backward
animate(element, {
  x: 250,
  alternate: true,      // v4: 'alternate' instead of direction: 'alternate'
  loop: 3,
  duration: 500
});

// Reversed: Play animation backward
animate(element, {
  opacity: [1, 0],
  reversed: true,       // v4: 'reversed' instead of direction: 'reverse'
  duration: 400
});
```

#### Timeline Sequences
```javascript
import { createTimeline } from 'animejs';

const timeline = createTimeline({
  loop: 2,              // Timeline-level loop
  ease: 'outQuad'       // Default easing for all children
});

timeline
  .add(element1, {
    translateX: 250,
    duration: 500
  })
  .add(element2, {
    opacity: [0, 1],
    duration: 300
  }, '-=200')  // Start 200ms before previous animation ends
  .add(element3, {
    scale: [0, 1],
    duration: 400
  }, '+=100'); // Start 100ms after previous animation ends
```

#### Callbacks
```javascript
animate(element, {
  translateX: 250,
  onUpdate: (animation) => {
    console.log('Progress:', animation.progress);
  },
  onComplete: (animation) => {
    console.log('Animation complete!');
  },
  onBegin: (animation) => {
    console.log('Animation started!');
  }
});
```

#### Animation Control
```javascript
const animation = animate(element, {
  translateX: 250,
  duration: 2000,
  autoplay: false  // Don't start automatically
});

// Control methods
animation.play();
animation.pause();
animation.restart();
animation.reverse();
animation.seek(1000);  // Jump to 1000ms
```

## Recommended Usage Patterns

### 1. Modal/Dialog Entrance
```javascript
// Scale + Fade + Translate
animate(dialog, {
  scale: [0.8, 1],
  opacity: [0, 1],
  translateY: [-30, 0],
  duration: 300,
  ease: 'outBack'
});
```

### 2. List Item Reveal
```javascript
const items = document.querySelectorAll('.list-item');

animate(items, {
  translateX: [-50, 0],
  opacity: [0, 1],
  duration: 400,
  delay: (el, i) => i * 100,
  ease: 'outQuad'
});
```

### 3. Attention-Seeking Pulse
```javascript
animate(element, {
  scale: [1, 1.1, 1],
  duration: 600,
  ease: 'inOutQuad'
});
```

### 4. Shake Effect (Error State)
```javascript
animate(element, {
  translateX: [0, -10, 10, -10, 10, 0],
  duration: 400,
  ease: 'linear'
});
```

### 5. Smooth Color Transition
```javascript
animate(element, {
  backgroundColor: ['#3b82f6', '#10b981'],
  duration: 500,
  ease: 'inOutQuad'
});
```

## Performance Best Practices

### 1. Use `will-change` CSS Property
```javascript
// Before animating
element.style.willChange = 'transform, opacity';

animate(element, {
  translateX: 250,
  opacity: 0.5,
  duration: 500
});

// After animation completes
element.style.willChange = 'auto';
```

### 2. Prefer Transform Properties
✅ **Fast**: `translate`, `scale`, `rotate`, `opacity`
❌ **Slow**: `width`, `height`, `top`, `left`, `margin`

```javascript
// GOOD - Uses GPU acceleration
animate(element, {
  translateX: 100,
  scale: 1.5
});

// AVOID - Triggers layout recalculation
animate(element, {
  left: '100px',
  width: '200px'
});
```

### 3. Batch Animations
```javascript
// GOOD - Single animation with multiple properties
animate(element, {
  translateX: 100,
  opacity: 0.5,
  scale: 1.2,
  duration: 500
});

// AVOID - Multiple separate animations
animate(element, { translateX: 100, duration: 500 });
animate(element, { opacity: 0.5, duration: 500 });
animate(element, { scale: 1.2, duration: 500 });
```

## Common Recipes for This Project

### Action Palette Item Click
```javascript
animate(item, {
  scale: [0.95, 1],
  duration: 150,
  ease: 'inOutQuad'
});
```

### Program Grid Cell Highlight
```javascript
animate(cell, {
  backgroundColor: ['transparent', '#3b82f620', 'transparent'],
  duration: 600,
  ease: 'inOutQuad'
});
```

### Notification Toast
```javascript
// Enter
animate(toast, {
  translateY: [-100, 0],
  opacity: [0, 1],
  duration: 400,
  ease: 'outBack'
});

// Exit
setTimeout(() => {
  animate(toast, {
    translateX: 300,
    opacity: 0,
    duration: 300,
    ease: 'inQuad',
    onComplete: () => toast.remove()
  });
}, 3000);
```

### Snippet Panel Slide In
```javascript
animate(panel, {
  translateX: [-300, 0],
  opacity: [0, 1],
  duration: 350,
  ease: 'outQuad'
});
```

## Migration from v3 to v4

If you have old anime.js v3 code:

### v3 Syntax
```javascript
import anime from 'animejs';

anime({
  targets: element,
  translateX: 250,
  duration: 1000
});
```

### v4 Syntax ✨ (Current)
```javascript
import { animate } from 'animejs';

animate(element, {
  translateX: 250,
  duration: 1000
});
```

**Key Changes:**
- No `targets` property needed
- Direct element passing
- Cleaner API
- Better tree-shaking

## Resources

- **Official Documentation**: https://animejs.com
- **GitHub**: https://github.com/juliangarnier/anime
- **Easing Visualizer**: https://easings.net

## Integration Checklist

- [x] Package installed (`animejs@^4.2.2`)
- [x] Imported in dialog components
- [x] Imported in DOM utilities
- [x] Used for dialog open/close animations
- [x] Used for button hover/click effects
- [x] Used for input focus animations
- [x] Used for feedback message transitions
- [ ] Add to action palette interactions (recommended)
- [ ] Add to grid cell animations (recommended)
- [ ] Add to snippet panel transitions (recommended)

## Next Steps

Consider adding animations to:
1. **Page transitions** in program grid
2. **Snippet drag-and-drop** visual feedback
3. **Toolbar button** interactions
4. **Success/error states** for operations
5. **Loading indicators** for async operations
