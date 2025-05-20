# Enter the Vibe - App Overview

## Introduction

"Enter the Vibe" is an interactive audio-visual experience that displays a dynamic credits sequence synchronized with audio beats. The application creates a cinematic experience similar to movie credits, with names and titles appearing in various layouts that transition in sync with audio. The design is inspired by the film "Enter the Void" with neon aesthetics and smooth animations.

## Features

### 1. Dynamic Credits Sequence

- **Multiple Layout Types**:
  - Single Name Layout: Showcases one name at a time with large typography
  - Grid Layout: Displays 4-8 names in a grid formation
  - Row Layout: Shows 3-6 names in horizontal rows
  - Firstname-Lastname Layout: Emphasizes different parts of names
  - Bilingual Layout: Supports multiple languages with appropriate styling
  - Hierarchical Layout: Shows categories with subordinate names
  - Title Layout: Displays large centered text for titles

- **Dynamic Typography**:
  - Responsive font sizes using clamp() for optimal viewing on any device
  - Single name layout: `clamp(6rem, 12vw, 12rem)`
  - Firstname-lastname layout: `clamp(5rem, 12vw, 10rem)`
  - Grid layout: `clamp(2rem, 6vw, 4rem)`
  - Row layout: `clamp(2rem, 6vw, 4rem)`
  - Title layout: `clamp(10rem, 20vw, 20rem)`
  - Bilingual layout: `clamp(2.5rem, 6vw, 4rem)` for headings
  - Hierarchical layout: `clamp(3rem, 7vw, 5rem)` for headings

- **Visual Effects**:
  - Electric effect: Pulsing text shadow that creates a neon glow
  - Flicker effect: Random opacity changes that simulate flickering lights
  - Glitch effect: More intense flickering for special elements

### 2. Audio Processing & Beat Detection

- **Real-time Audio Analysis**:
  - Web Audio API integration for frequency analysis
  - Customizable frequency range focus (bass, mids, highs, full spectrum)
  - Dynamic peak detection with adjustable sensitivity
  - Noise gate threshold to filter out background noise

- **Beat Detection Methods**:
  - Algorithmic beat detection based on frequency energy levels
  - Manual beat triggering via click or spacebar
  - Automatic fallback beats with adjustable intervals
  - Visual beat indicator in bottom-right corner

- **Display Timing Control**:
  - Configurable minimum display time per screen (0.1s to 2s)
  - Default display time of 0.3 seconds
  - Prevents rapid transitions when beats are too close together

### 3. Three-Phase Experience

- **Phase 1: Credits Sequence**
  - Dynamic display of credits in various layouts
  - Beat-synchronized transitions between screens
  - Text animations and effects

- **Phase 2: Main Title**
  - Large title display with "ENTER THE VIBE" text
  - Animated entrance of each word
  - Special effects for each title word

- **Phase 3: Digital Landscape**
  - Abstract visual landscape with grid and sun elements
  - Flying particles with randomized properties
  - "VIBE CODING" text animation

- **End Scene**
  - Final display when audio completes
  - Thank you message and restart button
  - Animated entrance of end elements

### 4. Interactive Controls

- **Beat Detection Controls**:
  - Peak threshold adjustment (sensitivity)
  - Noise floor adjustment (minimum level)
  - Frequency range selection and customization
  - Auto beats toggle with interval adjustment
  - Display time slider (0.1s to 2s)

- **Playback Controls**:
  - Start button to begin the experience
  - Skip button to jump to Phase 3
  - Restart button to reset the animation
  - Reset settings button to restore defaults

- **Responsive Design**:
  - Adapts to different screen sizes
  - Mobile-friendly interface with appropriate scaling

### 5. Audio Visualization

- **Real-time Spectrum Analyzer**:
  - Full-screen frequency visualization
  - Color-coded frequency bars
  - Highlighted frequency range of interest
  - Visual indicators for detected peaks

- **Debug Information**:
  - Energy level display
  - Cutoff threshold display
  - Beat count tracking

## Application Structure

### Files Organization

```
enter-the-vibe/
├── docs/
│   ├── credits-list.md       # Raw list of all credits
│   ├── enter-the-vibe.md     # Project documentation
│   ├── enter-the-void.md     # Reference documentation
│   ├── app-overview.md       # This overview document
├── public/
│   ├── data/
│   │   └── credits.json      # Credits data structure
│   ├── sounds/
│   │   ├── Enter-the-Void.mp3 # Main soundtrack
│   │   ├── glitch-sound.mp3   # Effect sound
│   │   └── transition-sound.mp3 # Transition sound
│   ├── text-layout/          # Reference design images
├── src/
│   ├── index.html            # Main HTML structure
│   ├── script.js             # Main JavaScript code
│   └── style.css             # CSS styling
```

### Code Architecture

- **HTML Structure**:
  - Canvas element for audio visualization
  - Beat indicator and controls panel
  - Phase containers for different visual states
  - Credits containers for dynamic content

- **JavaScript Components**:
  - Audio processing and beat detection system
  - Credits sequence generation and management
  - Dynamic layout creation and animation
  - Settings management with localStorage persistence
  - Event handling for user interactions

- **CSS Design**:
  - Phase-specific styling for different visual states
  - Animation keyframes for visual effects
  - Responsive design with clamp() and viewport units
  - Dynamic typography system
  - Control panel styling

## Technical Implementation

### Beat Detection Algorithm

The application uses a sophisticated beat detection algorithm:

1. Audio is processed through an analyzer node in the Web Audio API
2. Frequency data is analyzed within a configurable frequency range
3. Signal energy is calculated with a weighted average
4. A dynamic threshold is calculated based on recent peak values
5. Beats are detected when energy exceeds threshold by a configurable amount
6. A minimum time between beats prevents false positives
7. Fallback beats provide rhythm when audio analysis is unreliable

### Credits Sequence Generation

The credits sequence is generated dynamically:

1. Credits data is loaded from JSON
2. Different layout types are selected based on content
3. Screens are shown in a predetermined sequence
4. Transitions are triggered by detected beats
5. Each credit is styled according to its category and layout
6. Names are split appropriately for optimal display

### User Settings Management

User settings are managed persistently:

1. Settings are saved to localStorage when changed
2. Settings are loaded when the application starts
3. Default values are used if no saved settings exist
4. Reset functionality restores settings to defaults
5. UI is updated to reflect current settings

## Usage Instructions

1. **Starting the Experience**:
   - Click the "START EXPERIENCE" button on the start screen
   - Audio will begin playing automatically
   - Credits sequence will start with Phase 1

2. **Adjusting Beat Detection**:
   - Use Peak Threshold slider to adjust sensitivity
   - Use Noise Floor slider to set minimum level
   - Select frequency range focus (bass, mids, highs)
   - Fine-tune frequency range with start/end sliders

3. **Controlling Display Speed**:
   - Adjust Display Time slider (0.1s to 2s)
   - Lower values make transitions faster
   - Higher values make each screen stay longer

4. **Manual Control**:
   - Click beat indicator or press spacebar for manual beats
   - Double-click beat indicator to toggle auto beats
   - Use Skip button to jump directly to Phase 3
   - Use Restart button to start over

5. **Hiding Controls**:
   - Click "Hide Controls" to minimize the control panel
   - Click "Show Controls" to expand it again

## Future Enhancements

Potential future enhancements for the application:

1. Support for custom credits data upload
2. Additional layout types for more visual variety
3. Enhanced audio effects synchronized with visuals
4. Saving and loading different visual presets
5. Support for multiple audio tracks
6. Advanced customization of visual effects
7. Real-time collaborative viewing mode

---

Created for the Enter the Vibe project, an interactive audio-visual experience that creates a unique cinematic credits sequence synchronized to music. 