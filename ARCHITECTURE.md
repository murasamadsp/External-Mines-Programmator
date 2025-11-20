# Mines Programmator Architecture

## Overview

This document describes the refactored architecture of the Mines Programmator application, a visual programming interface for the Mines game bot programs.

## Project Structure

```
src/
├── app.js                     # Main application entry point
├── index.html                 # Main HTML file
├── components/                # UI Components
│   ├── common/               # Shared UI components
│   ├── editor/               # Editor-specific components
│   │   └── programmator-ui.js # Main UI controller
│   ├── layout/               # Layout components
│   └── index.js              # Component exports
├── core/                     # Core business logic
│   ├── constants/            # Application constants
│   │   ├── actions.js        # Program action definitions
│   │   ├── formats.js        # Format version constants
│   │   ├── grid.js           # Grid and layout constants
│   │   └── index.js          # Constants exports
│   ├── models/               # Data models
│   │   └── program.js        # Program model and logic
│   ├── services/             # Business services
│   │   └── serializer.js     # Program serialization service
│   └── index.js              # Core exports
├── utils/                    # Utility functions
│   ├── formatters/           # Data formatting utilities
│   │   └── program-formatter.js
│   ├── helpers/              # General helper functions
│   │   ├── error-handler.js  # Error handling utilities
│   │   └── storage.js        # Local storage utilities
│   ├── validators/           # Validation utilities
│   │   └── program-validator.js
│   └── index.js              # Utils exports
├── views/                    # View templates and partials
│   ├── pages/                # Page templates
│   └── partials/             # Partial templates
└── assets/                   # Static assets (CSS, images, etc.)
```

## Architecture Principles

### 1. Separation of Concerns
- **Components**: Handle UI rendering and user interactions
- **Core**: Contains business logic, models, and services
- **Utils**: Provide utility functions for formatting, validation, and helpers
- **Views**: Contain templates and static content

### 2. Modular Design
- Each module has a single responsibility
- Modules are loosely coupled through well-defined interfaces
- Easy to test and maintain individual components

### 3. Error Handling
- Comprehensive error handling with custom error types
- User-friendly error messages
- Detailed logging for debugging

### 4. Data Flow
```
User Input → Component → Model/Service → Utils → Storage/Display
```

## Core Components

### Program Model (`core/models/program.js`)
- Represents a program with instructions
- Handles program validation and manipulation
- Provides methods for encoding/decoding

### Serializer Service (`core/services/serializer.js`)
- Handles Base64 encoding/decoding with LZMA compression
- Implements the official Mines program format
- Supports proper length handling and label encoding

### UI Components (`components/editor/`)
- `ProgrammatorUI`: Main UI controller
- Manages grid display, user interactions
- Coordinates between user input and program model

### Utilities
- **Validators**: Program instruction validation
- **Formatters**: Data formatting for display
- **Error Handler**: Centralized error management
- **Storage**: Safe localStorage operations

## Key Features

### Program Format Support
- **Base64 Format**: Official compressed format with LZMA
- **Proper Length Handling**: 32-bit little-endian integers
- **Label Support**: Jump/call labels with values
- **Compression**: LZMA compression (gzip fallback in browser)

### Error Handling
- Custom error types (`ValidationError`, `SerializationError`, `UIError`)
- User-friendly error messages
- Detailed error logging
- Recoverable error detection

### Storage System
- Safe localStorage wrapper with error handling
- Program save/load functionality
- Autosave feature
- Recent programs tracking
- Settings persistence

### Validation
- Instruction-level validation
- Program-level validation (labels, structure)
- Real-time feedback
- Comprehensive error reporting

## Import System

The application uses path aliases for clean imports:

```javascript
import { Program, ProgAction } from '@core';
import { ProgrammatorUI } from '@components';
import { validateProgram, formatInstruction } from '@utils';
```

These aliases are configured in `vite.config.js`:
- `@core`: `/src/core`
- `@components`: `/src/components`
- `@utils`: `/src/utils`
- `@assets`: `/src/assets`

## Development Guidelines

### Adding New Features
1. Identify the appropriate layer (Component/Model/Service/Utility)
2. Implement the feature in the correct module
3. Add proper error handling
4. Update exports in index files
5. Add tests if applicable

### Error Handling
- Always wrap operations that can fail in try-catch
- Use appropriate error types from `error-handler.js`
- Provide meaningful error messages to users
- Log detailed information for debugging

### Storage
- Use the `Storage` utility for all localStorage operations
- Check storage availability before operations
- Handle storage quota exceeded errors gracefully

## Build System

The project uses Vite for building and development:
- ES modules for modern browser support
- Path aliases for clean imports
- Automatic code splitting
- CSS preprocessing with PostCSS

## Browser Support

- Modern browsers with ES2020+ support
- Graceful degradation for older browsers
- Fallback compression for LZMA (using gzip)

## Future Enhancements

- TypeScript migration for better type safety
- Unit testing framework integration
- Advanced program analysis features
- Multiple program format support
- Cloud synchronization
- Collaborative editing features
