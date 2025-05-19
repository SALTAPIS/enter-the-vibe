# ENTER THE VIBE Animation

An immersive three-phase typographic animation experience inspired by Gaspar Noé's "Enter the Void", featuring rapid-fire credits, electric title effects, and a 3D digital landscape with "VIBE CODING" animation.

## Features

### Phase 1: Rapid-Fire Credits Sequence
- Strobing credits with multiple font styles and effects
- Each name appears with unique animation and color treatment
- Categories include tech pioneers, artists, writers, and hackers
- Complete credits list available in `credits-list.md`

### Phase 2: Main Title Sequence
- Electric typographic treatment of "ENTER THE VIBE"
- Glitch and flicker effects inspired by "Enter the Void"
- Dramatic audio-visual presentation

### Phase 3: Digital Landscape
- 3D grid environment with perspective effects
- Flying particles and futuristic sun
- Interactive "VIBE CODING" typography with:
  - Multiple font styles for each letter
  - 3D transformations and animations
  - Interactive hover and click effects
  - Mouse-controlled perspective

## Tech Stack

- Vite for development and building
- GSAP Animation Library (GreenSock Animation Platform)
  - Core GSAP
  - ScrollTrigger plugin
- Fontshare Display Fonts
- Google Fonts
- Modern JavaScript (ES Modules)

## How to Run

### Prerequisites
- Node.js and npm installed

### Installation
```bash
# Clone this repository
git clone https://github.com/yourusername/vibe-coding-ani.git
cd vibe-coding-ani

# Install dependencies
npm install
```

### Sound Files
The animation requires three sound files placed in the `public/sounds` directory:
- `intro-sound.mp3` - For the start of the sequence
- `glitch-sound.mp3` - For glitch effect moments
- `transition-sound.mp3` - For transitions between phases

See `public/sounds/README.md` for more information.

### Development
```bash
# Start the development server on port 3001
npm run dev
```

### Building for Production
```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Interaction

- Click the "SKIP" button to jump directly to Phase 3
- In Phase 3:
  - Hover over letters to see hover effects
  - Click on letters for explosion effects
  - Move your mouse around to change the 3D perspective

## Credits

The animation features an extensive list of technology pioneers, digital artists, writers, and hackers. See `credits-list.md` for the complete list of names and categories.

## Inspiration

This project draws inspiration from the title sequence of Gaspar Noé's film "Enter the Void" (2009), known for its striking typographic design and electric visual effects. The animation adapts these elements into an interactive digital experience.

## Customization

You can customize the animation by modifying:
- The credits list in `src/script.js` or adding more from `credits-list.md`
- Fonts used in the project by editing the HTML imports
- Animation timings and effects in the JavaScript file
- Colors and styling in the CSS file

## License

MIT