# Overview

We are working on developing a landing page for Nuss. We are going to be working on a new section at time. The entire project is one-page website, so we will be working on one section at a time. Each section will be developed as a self-contained component with its own styles and logic. Every time we start a new section I'll provide you with a screenshot of the design for that section, and you will be responsible for implementing it according to the design system and guidelines outlined below.

# Nuss Project - AI Development Context

This document provides context for AI agents working on the Nuss project to ensure consistency across typography, components, and styling.

## Typography System
All text should be rendered using the custom `<Text />` component located in `src/components/Text.tsx`.

### Supported Fonts
- **Zarid**: `font="zarid"` (29LT Zarid Sans AL) - Used for primary headings and impact statements.
- **Cairo**: `font="cairo"` - Used for subheadings and navigation links.
- **IBM Plex**: `font="ibm-plex"` (IBM Plex Sans Arabic) - Default font used for body descriptions and secondary text.

### Component Usage
```tsx
import { Text } from '@/components/Text';

// Examples
<Text font="zarid" size="8xl" weight="bold">نُصنع الأثر</Text>
<Text font="cairo" size="4xl">الذي يميزك</Text>
<Text font="ibm-plex" size="lg" color="#888888" align="center">Description here...</Text>
```

## Reusable Components

### 1. InteractiveButton (`src/components/InteractiveButton.tsx`)
A circular button with a specialized hover animation:
- **Interaction**: On hover, a purple fill (`#7d6de9`) expands from the bottom to cover the circle.
- **Icon**: An arrow that rotates 45 degrees and changes color to white on hover.
- **Usage**: Primary call-to-action or scroll-down indicator.

### 2. Navbar (`src/components/Navbar.tsx`)
- Contains the `nuss-icon.svg` and navigation links.
- Uses `Cairo` font for links.

### 3. HeroSection (`src/components/HeroSection.tsx`)
- Self-contained hero component.
- **Includes**: The "popcorn wall" texture overlay and the `hero-grid.png` overlay.
- **Background Color**: `#FBF5F3` (defined in `globals.css`).

## Design Tokens
- **Background**: `#FBF5F3`
- **Primary Accent (Purple)**: `#7d6de9`
- **Primary Text**: `#555555`
- **Secondary Text**: `#888888`

## Development Guidelines
- **Modularity**: Keep section-specific styles and logic within their respective component folders.
- **RTL Support**: The project is configured for Arabic (RTL). Ensure all layout logic respects this.
- **Animations**: Use `framer-motion` for all interactive transitions.
- **Styling**: Prefer CSS Modules (`.module.css`) for component-level styling to avoid global scope pollution.
