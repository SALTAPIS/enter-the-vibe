# Enter the Vibe - Sequence Structure

## Overview

"Enter the Vibe" uses a structured, multi-phase approach to create a dynamic, audio-synchronized experience. This document details how screens and transitions are organized throughout the application flow.

## Application Flow

The application follows a linear progression through several distinct phases:

1. **Start Screen** - Initial welcome screen with "ENTER THE VIBE" title and start button
2. **Phase 1: Credits Sequence** - The main dynamic credits display
3. **Phase 2: Main Title** - Dramatic display of the "ENTER THE VIBE" title
4. **Phase 3: Digital Landscape** - Abstract visual environment with "VIBE CODING" text
5. **End Scene** - Final display when audio completes with restart option

## Phase 1: Credits Sequence Construction

The credits sequence is the most complex part of the application, built dynamically in the `buildAndStartCreditsSequence` function:

### Screen Distribution

Credits are displayed using various layout types according to the distribution defined in `app-config.json`:

```json
"layoutDistribution": {
  "single": 0.3,      // 30% of screens
  "grid": 0.2,        // 20% of screens
  "row": 0.2,         // 20% of screens
  "firstnameLastname": 0.1,  // 10% of screens
  "bilingual": 0.1,   // 10% of screens
  "hierarchical": 0.1 // 10% of screens
}
```

### Sequence Building Process

1. **Title Screens First**
   - The sequence starts with title screens (doubled for emphasis)
   - These create a strong opening for the experience

2. **Category Organization**
   - Credits are organized by categories:
     - Technology pioneers
     - Artists
     - Writers
     - Hackers
     - Creative contributors
     - Special mentions

3. **Layout Selection Algorithm**
   - The algorithm distributes credits across different layout types:
     - Single names feature prominent figures with large typography
     - Grid layouts display 4 credits in a 2×2 formation
     - Row layouts arrange 3 credits horizontally
     - Firstname-Lastname layouts emphasize different parts of names
     - Bilingual layouts support multiple languages
     - Hierarchical layouts show categories with subordinate names

4. **Controlled Randomization**
   - Categories are kept together but shuffled internally
   - Special layouts are interspersed at regular intervals
   - High-impact screens appear at key positions

## Beat-Synchronized Transitions

Transitions between screens are controlled by the beat detection system:

### Beat Detection System

The application detects beats through audio analysis:

1. **Audio Processing**
   - Web Audio API analyzes frequency data in real-time
   - Custom algorithm detects peaks in specified frequency ranges

2. **Beat Events**
   - Each detected beat triggers a screen transition
   - Manual beats can be triggered by spacebar or clicking the beat indicator

### Transition Logic

Transitions follow specific rules to ensure a smooth experience:

```javascript
function handleBeat(event) {
    // Check if minimum display time has passed
    const currentTime = Date.now();
    if (currentTime - lastScreenChangeTime >= minScreenDisplayTime) {
        // Advance to next screen
        beatDetected();
        lastScreenChangeTime = currentTime;
    }
}
```

### Minimum Display Time

The app enforces a minimum display time for each screen:

- Default: 300ms (0.3 seconds)
- Configurable: 100ms to 2000ms (0.1 to 2 seconds)
- Purpose: Prevents rapid flickering when beats are too close together

## Phase Transitions

The application transitions between major phases at predetermined points:

### Phase 1 to Phase 2

- Triggered after a specific number of credits screens
- Fades out Phase 1 with 1-second opacity transition
- Reveals Phase 2 with the main title animation

```javascript
function transitionToPhase2() {
    gsap.to(phase1, { 
        opacity: 0, 
        duration: 1, 
        onComplete: () => {
            phase1.classList.add('hidden');
            phase2.classList.remove('hidden');
            startTitleSequence();
        }
    });
}
```

### Phase 2 to Phase 3

- Triggered after the title animation completes (2.5 seconds)
- Each word of "ENTER THE VIBE" animates individually
- Transitions to the digital landscape visualization

### Phase 3 to End Scene

- Triggered when the audio completes playing
- Displays thank you message and restart button
- Animated entrance of end elements

## GSAP Animation Integration

The application uses GSAP (GreenSock Animation Platform) for smooth, cinematic transitions:

- **Timeline-Based Animations**: Each layout type uses GSAP timelines
- **Staggered Effects**: Elements appear with slight timing offsets
- **Easing Functions**: Custom easing for natural motion
- **Callback Chaining**: Animations trigger subsequent steps upon completion

## Configuration Options

The sequence behavior can be customized through `app-config.json`:

- **Timing**: Adjust minimum display time per screen
- **Phase Control**: Enable/disable specific phases
- **Layout Distribution**: Change percentage of each layout type
- **Beat Detection**: Adjust sensitivity, frequency range, and fallback options

## Fallback Systems

The application includes fallback mechanisms to ensure consistent behavior:

- **Fallback Beats**: Automatic beat generation if audio analysis fails
- **Default Content**: Placeholder credits if JSON loading fails
- **Phase Skipping**: Option to skip directly to Phase 3

This structured approach creates a cohesive experience while allowing for dynamic, beat-synchronized content that changes with each viewing. 