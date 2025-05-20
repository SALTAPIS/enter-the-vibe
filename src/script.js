import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Global app configuration
let appConfig = null;

// -------------- CREDIT SEQUENCE DATA --------------
// Will store all credits loaded from JSON
let allCredits = [];

// Global variables for state tracking
let lastScreenChangeTime = Date.now();
let beatDetected = null; // Will be defined by playCreditsSequence
let minScreenDisplayTime = 300; // Minimum display time in milliseconds (0.3 seconds by default)

// Load app configuration from JSON file
async function loadAppConfig() {
    try {
        const response = await fetch('./data/app-config.json');
        if (!response.ok) {
            throw new Error(`Failed to load app config: ${response.status} ${response.statusText}`);
        }
        appConfig = await response.json();
        console.log('App configuration loaded successfully');
        
        // Apply initial config values
        if (appConfig.display && appConfig.display.timing) {
            minScreenDisplayTime = appConfig.display.timing.minDisplayTime;
        }
        
        return appConfig;
    } catch (error) {
        console.error("Error loading app configuration:", error);
        return null;
    }
}

// Load credits from JSON file
async function loadCredits() {
    try {
        const response = await fetch('./data/credits.json');
        if (!response.ok) {
            throw new Error(`Failed to load credits: ${response.status} ${response.statusText}`);
        }
        const creditsData = await response.json();
        
        // Combine all credits into one array
        allCredits = [
            ...(creditsData.technology || []),
            ...(creditsData.artists || []),
            ...(creditsData.writers || []),
            ...(creditsData.hackers || []),
            ...(creditsData.creative || []),
            ...(creditsData.special || [])
        ];

        console.log(`Loaded ${allCredits.length} credits from JSON`);
        
        // Now build the credits sequence
        buildAndStartCreditsSequence(creditsData);
    } catch (error) {
        console.error("Error loading credits:", error);
        // Fallback to simple credits if loading fails
        allCredits = [
            { name: "ERROR LOADING CREDITS", description: "Please check console", category: "error" }
        ];
    }
}

// Main initialization function
async function init() {
    // First load app configuration
    await loadAppConfig();
    
    // Then load credits and continue initialization
    await loadCredits();
    
    // Initialize user controls after config is loaded
    initBeatControls();
    
    // Initialize UI elements
    const startButton = document.getElementById('start-button');
    const skipButton = document.getElementById('skip-button');
    const beatIndicator = document.getElementById('beat-indicator');
    const mainSound = document.getElementById('main-sound');
    const glitchSound = document.getElementById('glitch-sound');
    const transitionSound = document.getElementById('transition-sound');
    
    // Set up event listeners
    if (skipButton) {
        skipButton.addEventListener('click', skipToPhase3);
    }
    
    // Allow manual beat triggering by clicking on the beat indicator
    if (beatIndicator) {
        beatIndicator.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Manual beat triggered by click");
            detectPeak(true);
        });
        // Make it clickable
        beatIndicator.style.pointerEvents = 'auto';
    }

    // Allow triggering beats with spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            console.log("Manual beat triggered by spacebar");
            detectPeak(true);
            e.preventDefault(); // Prevent page scrolling
        }
    });
    
    // Setup start button
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("Start button clicked");
            
            // Resume audio context if suspended (required by modern browsers)
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log("AudioContext resumed successfully");
                }).catch(err => {
                    console.error("Failed to resume AudioContext:", err);
                });
            }
            
            // Hide start screen
            const startScreen = document.getElementById('start-screen');
            gsap.to(startScreen, { 
                duration: 0.5, 
                opacity: 0, 
                onComplete: () => {
                    startScreen.classList.add('hidden');
                    // Show phase 1
                    const phase1 = document.getElementById('phase1');
                    phase1.classList.remove('hidden');
                    gsap.set(phase1, { opacity: 1 });
                    
                    // Initialize audio context and visualization
                    if (mainSound) {
                        // Make sure audio is ready to play
                        mainSound.volume = 1.0;
                        mainSound.currentTime = 0;
                        
                        // Add event listener for when audio ends
                        mainSound.addEventListener('ended', showEndScene);
                        
                        // Play the sound
                        mainSound.play().then(() => {
                            console.log("Main sound started playing");
                            setupAudioVisualization(mainSound);
                            
                            // Ensure fallback beats are running (even if audio analysis is working)
                            startFallbackBeatTimer();
                        }).catch(err => {
                            console.error("Error playing main sound:", err);
                            // If audio fails to play, still start fallback beats
                            startFallbackBeatTimer();
                        });
                    } else {
                        console.error("Main sound element not found!");
                        // Even without sound, start fallback beats
                        startFallbackBeatTimer();
                    }
                    
                    // Start the experience
                    startPhase1();
                } 
            });
        });
    }
    
    // Init phases
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    
    console.log("Initialization complete");
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Function to build and start the credits sequence
function buildAndStartCreditsSequence(creditsData) {
    console.log("Building credits sequence from JSON data");
    
    // Connect the beat detection to the credits sequence advancement
    window.addEventListener('audiobeat', handleBeat);
    
    // The main screens array for our sequence
    const creditScreens = [];
    
    // 1. Start with the title screens
    if (creditsData.layouts && creditsData.layouts.title) {
        creditScreens.push(...creditsData.layouts.title);
    }
    
    // 2. Add various layout types in a structured sequence
    
    // Create a shuffled list of all regular credits
    const regularCredits = shuffleArray([...allCredits]);
    
    // Create a function to get credits of a specific category
    function getCreditsOfCategory(category, count = 4) {
        return regularCredits
            .filter(credit => credit.category === category)
            .slice(0, count);
    }
    
    // We'll alternate between different layout types
    
    // First, do single name showcases
    for (let i = 0; i < 5; i++) {  // Show 5 individual prominent people
        const featuredCredit = creditsData.featured?.[i] || regularCredits[i];
        if (featuredCredit) {
            // For each featured credit, add it as a single name
            creditScreens.push({
                ...featuredCredit,
                layout: "single"
            });
        }
    }
    
    // Add bilingual layouts
    if (creditsData.layouts && creditsData.layouts.bilingual) {
        // Add all bilingual layouts - they look great
        creditScreens.push(...creditsData.layouts.bilingual);
    }
    
    // Add tech people in grid layouts
    const techCredits = getCreditsOfCategory('tech', 8);
    if (techCredits.length >= 4) {
        // Add them in groups of 4
        creditScreens.push({
            credits: techCredits.slice(0, 4),
            layout: "grid"
        });
        
        if (techCredits.length >= 8) {
            creditScreens.push({
                credits: techCredits.slice(4, 8),
                layout: "grid"
            });
        }
    }
    
    // Add more bilingual layouts
    if (creditsData.layouts && creditsData.layouts.bilingual) {
        // Add all bilingual layouts again - they're the focus
        creditScreens.push(...creditsData.layouts.bilingual.slice(0, 2));
    }
    
    // Add artists in row layouts
    const artistCredits = getCreditsOfCategory('artist', 6);
    if (artistCredits.length >= 3) {
        creditScreens.push({
            credits: artistCredits.slice(0, 3),
            layout: "row"
        });
        
        if (artistCredits.length >= 6) {
            creditScreens.push({
                credits: artistCredits.slice(3, 6),
                layout: "row"
            });
        }
    }
    
    // Add hierarchical layouts
    if (creditsData.layouts && creditsData.layouts.hierarchical) {
        creditScreens.push(...creditsData.layouts.hierarchical);
    }
    
    // Add writers in grid layouts
    const writerCredits = getCreditsOfCategory('writer', 4);
    if (writerCredits.length >= 4) {
        creditScreens.push({
            credits: writerCredits,
            layout: "grid"
        });
    }
    
    // Add firstname-lastname layouts
    if (creditsData.layouts && creditsData.layouts["firstname-lastname"]) {
        creditScreens.push(...creditsData.layouts["firstname-lastname"]);
    }
    
    // Add hackers in row layouts
    const hackerCredits = getCreditsOfCategory('hacker', 6);
    if (hackerCredits.length >= 3) {
        creditScreens.push({
            credits: hackerCredits.slice(0, 3),
            layout: "row"
        });
        
        if (hackerCredits.length >= 6) {
            creditScreens.push({
                credits: hackerCredits.slice(3, 6),
                layout: "row"
            });
        }
    }
    
    // Add more bilingual layouts to end strong
    if (creditsData.layouts && creditsData.layouts.bilingual) {
        // Add remaining bilingual layouts
        creditScreens.push(...creditsData.layouts.bilingual.slice(2));
    }
    
    // Add special credits at the end
    const specialCredits = getCreditsOfCategory('special');
    if (specialCredits.length > 0) {
        for (const credit of specialCredits) {
            creditScreens.push({
                ...credit,
                layout: "single"
            });
        }
    }
    
    // Start playing the credits sequence with our built screens
    playCreditsSequence(creditScreens);
}

// Function to show the next screen
let showNextScreen = null;

// Update the playCreditsSequence function to handle the new layout types (grid and row)
function playCreditsSequence(screens) {
    const creditsContainer = document.querySelector('.credits-container');
    const singleCreditContainer = document.querySelector('.single-credit-container');
    
    // Clear containers
    creditsContainer.innerHTML = '';
    singleCreditContainer.innerHTML = '';
    
    // Keep track of current screen index
    let currentScreenIndex = 0;
    
    // Function to show the next screen
    showNextScreen = () => {
        console.log(`Showing screen ${currentScreenIndex + 1} of ${screens.length}`);
        
        // Clear containers immediately
        creditsContainer.innerHTML = '';
        singleCreditContainer.innerHTML = '';
        
        const credit = screens[currentScreenIndex];
        
        // Create a GSAP timeline for this screen
        const screenTimeline = gsap.timeline();
        
        if (credit.layout === "single") {
            // Single name
            showSingleName(screenTimeline, credit);
        } 
        else if (credit.layout === "title" || credit.layout === "bilingual" || 
                 credit.layout === "hierarchical" || credit.layout === "firstname-lastname") {
            // Special layouts
            showSpecialLayoutCredit(screenTimeline, credit);
        }
        else if (credit.layout === "grid" || credit.layout === "row") {
            // Group of credits - show them together
            // The layout property determins if we use grid or row layout
            showPackeryGroup(screenTimeline, credit.credits, credit.layout);
        }
        else if (credit.credits) {
            // Legacy packery layout
            showPackeryGroup(screenTimeline, credit.credits);
        }
        
        // Increment index for next time
        currentScreenIndex = (currentScreenIndex + 1) % screens.length;
        lastScreenChangeTime = Date.now();
    };
    
    // Show the first screen immediately
    showNextScreen();
    
    // Update the beat detection callback to show the next screen on beat
    beatDetected = () => {
        // Only change screen if enough time has passed to prevent rapid changes
        const now = Date.now();
        const timeSinceLastChange = now - lastScreenChangeTime;
        
        // Use the configurable minimum time between screen changes
        if (timeSinceLastChange > minScreenDisplayTime) {
            showNextScreen();
        } else {
            console.log(`Beat detected but screen shown for only ${timeSinceLastChange}ms (min: ${minScreenDisplayTime}ms)`);
        }
    };
}

// Shuffle the credits array to make it random each time
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Define color palette based on the screenshots
const colorPalette = {
    blue: "#4495F1",    // Blue color used in some of the names
    gold: "#D1A032",    // Gold/yellow color used in some names
    green: "#33FF33",   // Green color used for category titles
    red: "#FF0000",     // Red color used for Japanese text
    white: "#FFFFFF"    // White color for most names
};

// Function to get a random color from the palette with 80% chance of white
function getRandomColor() {
    // 80% chance to return white
    if (Math.random() < 0.8) {
        return colorPalette.white;
    }
    
    // For the other 20%, pick from the remaining colors
    const colors = Object.values(colorPalette).filter(color => color !== colorPalette.white);
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to split a name into first and last names for better display
function splitNameIntoLines(name) {
    // If name already contains a newline, return as is
    if (name.includes('\n')) return name;
    
    // Split the name by spaces
    const parts = name.split(' ');
    
    // If it's a single word, return as is
    if (parts.length === 1) return name;
    
    // If two words, split into two lines
    if (parts.length === 2) {
        return `${parts[0]}\n${parts[1]}`;
    }
    
    // For longer names, put the first name on top, rest on bottom
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return `${firstName}\n${lastName}`;
}

// -------------- FONT FAMILIES --------------
const fontClasses = [
    'font-boska',
    'font-cabinet',
    'font-zodiak',
    'font-clash',
    'font-chillax',
    'font-general',
    'font-satoshi',
    'font-switzer',
    'font-tanker',
    'font-rosaline',
    'font-gambetta',
    'font-author',
    'font-bespoke',
    'font-sentiment'
];

// Tech and 80s retro fonts for phase 3
const techFonts = [
    "'Press Start 2P', cursive",
    "'VT323', monospace",
    "'Share Tech Mono', monospace",
    "'JetBrains Mono', monospace",
    "'Orbitron', sans-serif",
    "'Major Mono Display', monospace",
    "'Rajdhani', sans-serif"
];

// -------------- AUDIO VARIABLES --------------
// Audio contexts and elements
let audioContext;
let audioSource;
let analyser;
let frequencyData;

// Peak detection (replacing beat detection)
let peakDetected = false;
let lastPeakTime = 0;
let signalEnergy = 0;
let peakThreshold = 0.05; // Updated default sensitivity threshold
let minimumThreshold = 70; // Updated noise gate threshold
let peakHoldTime = 250; // Minimum time between peaks
let energyDecay = 0.95; // Decay rate for energy smoothing
let peakCutoff = 0;
let cutoffDecay = 0.95; // Decay rate for dynamic threshold
let isAudioActuallyPlaying = false; // Flag to check if audio has real content

// Frequency range for peak detection
let freqRangeStart = 10; // Start bin index
let freqRangeEnd = 60;   // End bin index

// Fallback beat timer
let useFallbackBeats = false; // Default to OFF
let fallbackBeatInterval = 300; // Updated interval
let fallbackBeatTimer = null;
let peakCount = 0; // Counter for detected peaks
let beatIndicator; // The separate beat indicator element
let debugPanel; // Debug panel element
let debugEnergyEl, debugCutoffEl, debugCountEl; // Debug elements

// Beat control elements
let thresholdSlider, thresholdValue;
let noiseFloorSlider, noiseFloorValue;
let freqRangeSelect, freqStartSlider, freqEndSlider;
let freqStartValue, freqEndValue;
let fallbackToggle, fallbackInterval, intervalValue;
let displayTimeSlider, displayTimeValue; // New control elements for display time
let toggleControlsBtn, beatControls;
let freqRangeHighlight; // Element to highlight the selected frequency range

// Function to start fallback beat timer
function startFallbackBeatTimer() {
    stopFallbackBeatTimer(); // First stop any existing timer
    
    if (useFallbackBeats && !fallbackBeatTimer) {
        console.log(`Starting fallback beat timer with interval ${fallbackBeatInterval}ms`);
        fallbackBeatTimer = setInterval(() => {
            // Only trigger fallback beats if audio is actually playing
            if (useFallbackBeats && isAudioActuallyPlaying) {
                console.log("Fallback beat triggered");
                // Force a peak detection
                detectPeak(true);
            }
        }, fallbackBeatInterval);
    }
}

// Function to stop fallback beat timer
function stopFallbackBeatTimer() {
    if (fallbackBeatTimer) {
        console.log("Stopping fallback beat timer");
        clearInterval(fallbackBeatTimer);
        fallbackBeatTimer = null;
    }
}

// Setup audio visualization
function setupAudioVisualization(audioElement) {
    console.log("Setting up audio visualization...");
    
    // Initialize beat indicator
    beatIndicator = document.getElementById('beat-indicator');
    
    // Initialize debug panel
    debugPanel = document.getElementById('debug-panel');
    debugEnergyEl = document.getElementById('debug-energy');
    debugCutoffEl = document.getElementById('debug-cutoff');
    debugCountEl = document.getElementById('debug-count');
    
    // Initialize beat controls
    initBeatControls();
    
    // Check if audio is actually playing
    if (audioElement.paused) {
        console.error("Audio element is paused! Attempting to play...");
        audioElement.play()
            .then(() => {
                console.log("Audio started playing successfully");
                // Start monitoring audio for actual content
                checkForAudioContent();
                // Start fallback beats only if enabled
                if (useFallbackBeats) {
                    startFallbackBeatTimer();
                }
            })
            .catch(err => console.error("Failed to play audio:", err));
    } else {
        console.log("Audio is already playing");
        // Start monitoring audio for actual content
        checkForAudioContent();
        // Start fallback beats only if enabled
        if (useFallbackBeats) {
            startFallbackBeatTimer();
        }
    }
    
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create analyzer node
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512; // Higher value for more detailed analysis
    analyser.smoothingTimeConstant = 0.7; // Better for detecting distinct beats
    
    // Connect audio element to analyzer
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Create frequency data array
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    
    // Log setup success
    console.log("Audio visualization setup complete");
    
    // Start visualization loop
    drawVisualization();
}

// Check if audio contains actual content (not silence)
function checkForAudioContent() {
    // Create a timer to check every 500ms if audio has real content
    let checkTimer = setInterval(() => {
        if (!frequencyData) return; // Not ready yet
        
        // Check if there's significant energy in the signal
        let totalEnergy = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            totalEnergy += frequencyData[i];
        }
        
        // If we detect energy above our minimum threshold, consider audio to be playing
        if (totalEnergy > minimumThreshold * 10) {
            isAudioActuallyPlaying = true;
            console.log("Audio content detected!");
            clearInterval(checkTimer); // Stop checking once we've detected audio
        } else {
            isAudioActuallyPlaying = false;
        }
    }, 500);
}

// Initialize beat controls
function initBeatControls() {
    // Get control elements
    thresholdSlider = document.getElementById('threshold-slider');
    thresholdValue = document.getElementById('threshold-value');
    noiseFloorSlider = document.getElementById('noise-floor-slider');
    noiseFloorValue = document.getElementById('noise-floor-value');
    freqRangeSelect = document.getElementById('freq-range');
    freqStartSlider = document.getElementById('freq-start');
    freqEndSlider = document.getElementById('freq-end');
    freqStartValue = document.getElementById('freq-start-value');
    freqEndValue = document.getElementById('freq-end-value');
    fallbackToggle = document.getElementById('fallback-toggle');
    fallbackInterval = document.getElementById('fallback-interval');
    intervalValue = document.getElementById('interval-value');
    displayTimeSlider = document.getElementById('display-time-slider'); // Get display time slider
    displayTimeValue = document.getElementById('display-time-value'); // Get display time value
    toggleControlsBtn = document.getElementById('toggle-controls');
    beatControls = document.getElementById('beat-controls');
    
    // Load saved settings or use defaults
    loadSettings();
    
    // Initialize values in UI
    updateUIFromSettings();
    
    // Add event listeners
    thresholdSlider.addEventListener('input', (e) => {
        peakThreshold = parseFloat(e.target.value);
        thresholdValue.textContent = peakThreshold.toFixed(2);
        saveSettings();
    });
    
    if (noiseFloorSlider) {
        noiseFloorSlider.addEventListener('input', (e) => {
            minimumThreshold = parseInt(e.target.value);
            noiseFloorValue.textContent = minimumThreshold.toString();
            saveSettings();
        });
    }
    
    // Add display time slider listener
    if (displayTimeSlider) {
        displayTimeSlider.addEventListener('input', (e) => {
            minScreenDisplayTime = parseInt(e.target.value);
            displayTimeValue.textContent = (minScreenDisplayTime / 1000).toFixed(1) + 's';
            saveSettings();
        });
    }
    
    // Add frequency range controls
    if (freqRangeSelect) {
        freqRangeSelect.addEventListener('change', (e) => {
            const range = e.target.value;
            switch (range) {
                case 'bass':
                    freqRangeStart = 0;
                    freqRangeEnd = 20;
                    break;
                case 'mid':
                    freqRangeStart = 10;
                    freqRangeEnd = 60;
                    break;
                case 'high':
                    freqRangeStart = 50;
                    freqRangeEnd = 100;
                    break;
                case 'full':
                    freqRangeStart = 0;
                    freqRangeEnd = 120;
                    break;
            }
            
            // Update sliders to match the preset
            freqStartSlider.value = freqRangeStart;
            freqEndSlider.value = freqRangeEnd;
            freqStartValue.textContent = freqRangeStart.toString();
            freqEndValue.textContent = freqRangeEnd.toString();
            
            // Reset the peak detection values when changing ranges
            resetPeakDetection();
            saveSettings();
        });
    }
    
    if (freqStartSlider) {
        freqStartSlider.addEventListener('input', (e) => {
            freqRangeStart = parseInt(e.target.value);
            // Ensure start is less than end
            if (freqRangeStart >= freqRangeEnd) {
                freqRangeStart = freqRangeEnd - 1;
                freqStartSlider.value = freqRangeStart;
            }
            freqStartValue.textContent = freqRangeStart.toString();
            
            // Reset the peak detection values when changing ranges
            resetPeakDetection();
            saveSettings();
        });
    }
    
    if (freqEndSlider) {
        freqEndSlider.addEventListener('input', (e) => {
            freqRangeEnd = parseInt(e.target.value);
            // Ensure end is greater than start
            if (freqRangeEnd <= freqRangeStart) {
                freqRangeEnd = freqRangeStart + 1;
                freqEndSlider.value = freqRangeEnd;
            }
            freqEndValue.textContent = freqRangeEnd.toString();
            
            // Reset the peak detection values when changing ranges
            resetPeakDetection();
            saveSettings();
        });
    }
    
    fallbackToggle.addEventListener('change', (e) => {
        useFallbackBeats = e.target.checked;
        if (useFallbackBeats) {
            startFallbackBeatTimer();
        } else {
            stopFallbackBeatTimer();
        }
        saveSettings();
    });
    
    fallbackInterval.addEventListener('input', (e) => {
        fallbackBeatInterval = parseInt(e.target.value);
        intervalValue.textContent = fallbackBeatInterval.toString();
        if (useFallbackBeats) {
            startFallbackBeatTimer(); // Restart with new interval
        }
        saveSettings();
    });
    
    // Add restart button listener
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            restartAnimation();
        });
    }
    
    // Add reset settings button listener
    const resetSettingsButton = document.getElementById('reset-settings');
    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', () => {
            resetToDefaultSettings();
        });
    }
    
    toggleControlsBtn.addEventListener('click', () => {
        const controlRows = beatControls.querySelectorAll('.control-row:not(:last-child)');
        for (const row of controlRows) {
            row.style.display = row.style.display === 'none' ? 'flex' : 'none';
        }
        toggleControlsBtn.textContent = toggleControlsBtn.textContent === 'Hide Controls' ? 'Show Controls' : 'Hide Controls';
    });
    
    // Make beat indicator clickable to manually trigger beats or toggle auto mode
    if (beatIndicator) {
        beatIndicator.style.pointerEvents = 'auto';
        
        // Double click to toggle auto beats
        beatIndicator.addEventListener('dblclick', () => {
            useFallbackBeats = !useFallbackBeats;
            fallbackToggle.checked = useFallbackBeats;
            
            if (useFallbackBeats) {
                startFallbackBeatTimer();
                beatIndicator.textContent = "AUTO";
                setTimeout(() => { beatIndicator.textContent = "BEAT"; }, 1000);
            } else {
                stopFallbackBeatTimer();
                beatIndicator.textContent = "MANUAL";
                setTimeout(() => { beatIndicator.textContent = "BEAT"; }, 1000);
            }
            saveSettings();
        });
        
        // Single click to trigger manual beat
        beatIndicator.addEventListener('click', (e) => {
            if (e.detail === 1) { // Only for single clicks (not part of double click)
                // Manual peak triggering
                setTimeout(() => {
                    if (e.detail === 1) { // Still a single click after timeout
                        console.log("Manual peak triggered");
                        detectPeak(true);
                    }
                }, 200);
            }
        });
    }
    
    // Create a frequency range highlight element
    freqRangeHighlight = document.createElement('div');
    freqRangeHighlight.classList.add('freq-range-highlight');
    document.body.appendChild(freqRangeHighlight);
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        peakThreshold,
        minimumThreshold,
        freqRangeStart,
        freqRangeEnd,
        useFallbackBeats,
        fallbackBeatInterval,
        minScreenDisplayTime, // Save display time setting
        freqRangeType: freqRangeSelect ? freqRangeSelect.value : 'mid'
    };
    
    try {
        localStorage.setItem('vibeSettings', JSON.stringify(settings));
        console.log('Settings saved to localStorage');
    } catch (e) {
        console.error('Failed to save settings to localStorage:', e);
    }
}

// Load settings from localStorage
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('vibeSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings
            peakThreshold = settings.peakThreshold || 0.05;
            minimumThreshold = settings.minimumThreshold || 70;
            freqRangeStart = settings.freqRangeStart || 10;
            freqRangeEnd = settings.freqRangeEnd || 60;
            useFallbackBeats = settings.useFallbackBeats || false;
            fallbackBeatInterval = settings.fallbackBeatInterval || 300;
            minScreenDisplayTime = settings.minScreenDisplayTime || 300; // Load display time setting, default 0.3s
            
            console.log('Settings loaded from localStorage');
        }
    } catch (e) {
        console.error('Failed to load settings from localStorage:', e);
        // If loading fails, use defaults
        resetToDefaultSettings(false);
    }
}

// Update UI elements to reflect current settings
function updateUIFromSettings() {
    // Update sliders and values
    thresholdSlider.value = peakThreshold;
    thresholdValue.textContent = peakThreshold.toFixed(2);
    
    noiseFloorSlider.value = minimumThreshold;
    noiseFloorValue.textContent = minimumThreshold.toString();
    
    freqStartSlider.value = freqRangeStart;
    freqStartValue.textContent = freqRangeStart.toString();
    
    freqEndSlider.value = freqRangeEnd;
    freqEndValue.textContent = freqRangeEnd.toString();
    
    fallbackToggle.checked = useFallbackBeats;
    fallbackInterval.value = fallbackBeatInterval;
    intervalValue.textContent = fallbackBeatInterval.toString();
    
    // Update display time slider
    if (displayTimeSlider) {
        displayTimeSlider.value = minScreenDisplayTime;
        displayTimeValue.textContent = (minScreenDisplayTime / 1000).toFixed(1) + 's';
    }
    
    // Set frequency range select based on current values
    if (freqRangeSelect) {
        // Try to determine the preset based on the current range values
        if (freqRangeStart === 0 && freqRangeEnd === 20) {
            freqRangeSelect.value = 'bass';
        } else if (freqRangeStart === 10 && freqRangeEnd === 60) {
            freqRangeSelect.value = 'mid';
        } else if (freqRangeStart === 50 && freqRangeEnd === 100) {
            freqRangeSelect.value = 'high';
        } else if (freqRangeStart === 0 && freqRangeEnd === 120) {
            freqRangeSelect.value = 'full';
        }
        // If no preset matches, the custom range will be kept
    }
}

// Reset to default settings
function resetToDefaultSettings(saveAfterReset = true) {
    peakThreshold = 0.05;
    minimumThreshold = 70;
    freqRangeStart = 10;
    freqRangeEnd = 60;
    useFallbackBeats = false;
    fallbackBeatInterval = 300;
    minScreenDisplayTime = 300; // Reset display time to 0.3 seconds
    
    resetPeakDetection();
    
    if (saveAfterReset) {
        updateUIFromSettings();
        saveSettings();
        console.log('Settings reset to defaults');
    }
}

// Restart the animation from the beginning
function restartAnimation() {
    console.log("Restarting animation...");
    
    // Stop all sounds and timers
    if (mainSound) {
        mainSound.pause();
        mainSound.currentTime = 0;
        // Remove the ended event listener to prevent multiple triggers
        mainSound.removeEventListener('ended', showEndScene);
    }
    if (glitchSound) glitchSound.pause();
    if (transitionSound) transitionSound.pause();
    
    stopFallbackBeatTimer();
    
    // Remove any attached event listeners for beat detection
    window.removeEventListener('audiobeat', handleBeat);
    
    // Reset animation state
    gsap.killTweensOf("*"); // Kill all GSAP animations
    
    // Remove end scene if it exists
    const endScene = document.querySelector('.end-scene');
    if (endScene) {
        endScene.remove();
    }
    
    // Reset audio context if it exists
    if (audioContext) {
        audioContext.close().then(() => {
            console.log("Audio context closed");
            audioContext = null;
            analyser = null;
            audioSource = null;
        }).catch(err => {
            console.error("Error closing audio context:", err);
        });
    }
    
    // Hide all phases
    document.querySelectorAll('.phase').forEach(phase => {
        phase.classList.add('hidden');
    });
    
    // Show start screen
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.remove('hidden');
        gsap.set(startScreen, { opacity: 1, display: 'flex' });
    }
    
    // Reset beat counter and detection
    peakCount = 0;
    if (debugCountEl) debugCountEl.textContent = "0";
    resetPeakDetection();
    
    console.log("Animation restarted, ready for user to press start");
}

// Function to handle beat events during credits sequence
function handleBeat(event) {
    // If beatDetected is defined and callable, use it
    if (typeof beatDetected === 'function') {
        beatDetected();
    } else {
        const currentTime = Date.now();
        
        // Only advance if screen has been visible for at least the minimum time
        if (currentTime - lastScreenChangeTime >= minScreenDisplayTime) {
            console.log("Beat detected - advancing to next screen");
            if (typeof showNextScreen === 'function') {
                showNextScreen();
            }
        } else {
            console.log(`Beat detected but ignoring (too soon - ${currentTime - lastScreenChangeTime}ms < ${minScreenDisplayTime}ms)`);
        }
    }
}

// Draw visualization
function drawVisualization() {
    // Get canvas and context
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get frequency data
        analyser.getByteFrequencyData(frequencyData);
        
        // Check for peaks
        detectPeak();
        
        // Draw visualization based on frequency data
        drawVisualizationBars(ctx, canvas, frequencyData);
    }
    
    // Start animation loop
    animate();
}

// Draw frequency bars
function drawVisualizationBars(ctx, canvas, frequencyData) {
    const barWidth = Math.ceil(canvas.width / (frequencyData.length / 2));
    const heightMultiplier = canvas.height / 255 * 0.7; // 70% of canvas height max
    
    // Draw from center of screen
    ctx.translate(0, canvas.height / 2);
    
    // Calculate total signal energy for visualization purposes
    let totalSignalEnergy = 0;
    const binsToAnalyze = Math.min(frequencyData.length / 2, Math.max(freqRangeEnd, 120)); // Limit to visible bins
    
    // Focus only on the selected frequency range
    for (let i = freqRangeStart; i < freqRangeEnd && i < binsToAnalyze; i++) {
        // Apply weight based on position in the range
        const normalizedPos = (i - freqRangeStart) / (freqRangeEnd - freqRangeStart);
        // Bell curve weighting with higher weight in the middle of the range
        const weight = 1.0 + Math.sin(normalizedPos * Math.PI) * 0.5;
        
        totalSignalEnergy += frequencyData[i] * weight;
    }
    
    // Normalize the energy based on the size of the range
    const rangeSize = Math.min(freqRangeEnd - freqRangeStart, binsToAnalyze);
    totalSignalEnergy = totalSignalEnergy / (rangeSize * 1.2);
    
    // Update frequency range highlight position
    if (freqRangeHighlight) {
        const startX = freqRangeStart * barWidth;
        const width = (freqRangeEnd - freqRangeStart) * barWidth;
        
        freqRangeHighlight.style.left = `${startX}px`;
        freqRangeHighlight.style.width = `${width}px`;
        freqRangeHighlight.style.top = '0';
        freqRangeHighlight.style.bottom = '0';
    }
    
    // Draw silence threshold line (noise gate)
    const noiseGateHeight = minimumThreshold * heightMultiplier;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, -noiseGateHeight);
    ctx.lineTo(canvas.width, -noiseGateHeight);
    ctx.stroke();
    ctx.moveTo(0, noiseGateHeight);
    ctx.lineTo(canvas.width, noiseGateHeight);
    ctx.stroke();
    
    // Draw peak threshold line
    const peakHeight = (peakCutoff * (1 + peakThreshold)) * heightMultiplier;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, -peakHeight);
    ctx.lineTo(canvas.width, -peakHeight);
    ctx.stroke();
    ctx.moveTo(0, peakHeight);
    ctx.lineTo(canvas.width, peakHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Display audio playback status (if no audio is detected)
    if (!isAudioActuallyPlaying) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Audio Detected', canvas.width / 2, -canvas.height / 4);
    }
    
    // Draw frequency bars
    for (let i = 0; i < frequencyData.length / 2; i++) { // Use half the frequencies for better visuals
        const barHeight = frequencyData[i] * heightMultiplier;
        
        // Skip drawing very small bars (reduces visual noise)
        if (barHeight < 2) continue;
        
        // Determine if this frequency is in our analysis range
        const isInRange = i >= freqRangeStart && i < freqRangeEnd;
        
        // Determine color based on frequency and peak
        const r = peakDetected ? 255 : (frequencyData[i]);
        const g = 120 + frequencyData[i] / 3;
        const b = 255 - frequencyData[i] / 3;
        const alpha = peakDetected ? 0.8 : 0.6;
        
        // Highlight frequencies in our selected range
        const highlight = isInRange ? 0.3 : 0;
        
        // Top bar (goes up)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha + highlight})`;
        ctx.fillRect(i * barWidth, -barHeight, barWidth - 1, barHeight);
        
        // Bottom bar (mirror, goes down)
        ctx.fillRect(i * barWidth, 0, barWidth - 1, barHeight);
        
        // Highlight frequencies that are beyond threshold
        if (isInRange && frequencyData[i] > peakCutoff * (1 + peakThreshold) && 
            frequencyData[i] > minimumThreshold) {
            ctx.fillStyle = `rgba(255, 50, 50, 0.7)`;
            ctx.fillRect(i * barWidth, -barHeight, barWidth - 1, barHeight);
            ctx.fillRect(i * barWidth, 0, barWidth - 1, barHeight);
        }
    }
    
    // Draw current energy level line
    const energyHeight = totalSignalEnergy * heightMultiplier;
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -energyHeight);
    ctx.lineTo(90, -energyHeight);
    ctx.stroke();
    
    // Reset transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Add a more pronounced glow effect if peak detected
    if (peakDetected) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.height / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Update debug info
    if (debugEnergyEl) debugEnergyEl.textContent = Math.round(signalEnergy);
    if (debugCutoffEl) debugCutoffEl.textContent = Math.round(peakCutoff);
    if (debugCountEl) debugCountEl.textContent = peakCount;
}

// Function to manually trigger a peak detection event
function detectPeak(forcePeak = false) {
    if (forcePeak || shouldTriggerPeak()) {
        // Increment peak count
        peakCount++;
        
        // Update peak detected state
        peakDetected = true;
        
        // Update UI
        if (beatIndicator) {
            beatIndicator.classList.add('active');
        }
        
        // Log peak detection
        console.log(`Peak detected! (${forcePeak ? 'forced' : 'detected'}) Count: ${peakCount}`);
        
        // Create and dispatch a custom event for peak detection (reusing the same event name)
        const peakEvent = new CustomEvent('audiobeat', { 
            detail: { 
                time: Date.now(),
                forced: forcePeak
            } 
        });
        window.dispatchEvent(peakEvent);
        
        // Reset peak detected flag after a short delay
        setTimeout(() => {
            peakDetected = false;
            if (beatIndicator) {
                beatIndicator.classList.remove('active');
            }
        }, 200); // Keep it visible a bit longer (200ms)
        
        // Update last peak time
        lastPeakTime = Date.now();
        
        return true;
    }
    
    return false;
}

// Check if we should trigger a peak based on audio analysis
function shouldTriggerPeak() {
    const currentTime = Date.now();
    
    // If no frequency data is available yet, return false
    if (!frequencyData || !frequencyData.length) return false;
    
    // Calculate signal energy across the selected frequency range
    let currentEnergy = 0;
    const binsToAnalyze = Math.min(frequencyData.length, Math.max(freqRangeEnd, 120));
    
    // Focus only on the selected frequency range
    for (let i = freqRangeStart; i < freqRangeEnd && i < binsToAnalyze; i++) {
        // Apply weight based on position in the range
        const normalizedPos = (i - freqRangeStart) / (freqRangeEnd - freqRangeStart);
        // Bell curve weighting with higher weight in the middle of the range
        const weight = 1.0 + Math.sin(normalizedPos * Math.PI) * 0.5;
        
        currentEnergy += frequencyData[i] * weight;
    }
    
    // Normalize the energy based on the size of the range
    const rangeSize = Math.min(freqRangeEnd - freqRangeStart, binsToAnalyze);
    currentEnergy = currentEnergy / (rangeSize * 1.2);
    
    // Calculate running average
    signalEnergy = signalEnergy * energyDecay + currentEnergy * (1 - energyDecay);
    
    // Dynamic peak cutoff calculation
    if (currentEnergy > peakCutoff) {
        peakCutoff = currentEnergy;
    } else {
        peakCutoff = peakCutoff * cutoffDecay;
    }
    
    // Check if we're above the noise floor (silence threshold)
    if (currentEnergy < minimumThreshold) {
        return false; // Ignore signal below the noise gate
    }
    
    // Check if energy is above threshold, has minimum time since last peak,
    // and is a significant amount above the running average
    if (currentEnergy > peakCutoff * (1 + peakThreshold) && 
        currentTime - lastPeakTime > peakHoldTime) {
        return true;
    }
    
    return false;
}

// Function to reset peak detection values when changing frequency range
function resetPeakDetection() {
    signalEnergy = 0;
    peakCutoff = 0;
    peakDetected = false;
    lastPeakTime = 0;
}

// Function to show a single name with immediate appearance
function showSingleName(timeline, credit) {
    const singleCreditContainer = document.querySelector('.single-credit-container');
    
    // Clear container
    singleCreditContainer.innerHTML = '';
    
    // Split name into first/last name for single display
    const splitName = splitNameIntoLines(credit.name);
    
    // Create name element
    const nameEl = document.createElement('div');
    nameEl.classList.add('credit', 'single');
    
    // Use HTML to format the split name
    const nameParts = splitName.split('\n');
    if (nameParts.length === 2) {
        nameEl.innerHTML = `<div class="name-first">${nameParts[0]}</div>
                          <div class="name-last">${nameParts[1]}</div>`;
        
        // Ensure same font size for both parts - make it much larger
        const firstNameEl = nameEl.querySelector('.name-first');
        const lastNameEl = nameEl.querySelector('.name-last');
        if (firstNameEl && lastNameEl) {
            firstNameEl.style.fontSize = 'clamp(6rem, 12vw, 12rem)';
            lastNameEl.style.fontSize = 'clamp(6rem, 12vw, 12rem)';
        }
    } else {
        nameEl.textContent = credit.name;
        nameEl.style.fontSize = 'clamp(6rem, 15vw, 14rem)'; // Make single line names larger too
    }
    
    // Add color (80% white, 20% other colors)
    nameEl.style.color = getRandomColor();
    
    // Add to container
    singleCreditContainer.appendChild(nameEl);
    
    // Make it visible immediately
    gsap.set(nameEl, { opacity: 1, scale: 1 });
    
    // If there's a description, add it
    if (credit.description) {
        const descEl = document.createElement('div');
        descEl.classList.add('credit-description');
        descEl.textContent = credit.description;
        descEl.style.position = 'absolute';
        descEl.style.top = '70%'; // Move description lower to make room for larger names
        descEl.style.left = '0';
        descEl.style.width = '100%';
        descEl.style.textAlign = 'center';
        descEl.style.fontSize = 'clamp(1.2rem, 3vw, 2.5rem)'; // Larger description text
        
        singleCreditContainer.appendChild(descEl);
        
        // Make description visible immediately
        gsap.set(descEl, { opacity: 1 });
    }
    
    // Apply effect immediately based on category
    if (credit.category === 'tech') nameEl.classList.add('electric');
    else if (credit.category === 'creative') nameEl.classList.add('flicker');
    else if (credit.category === 'artist') nameEl.classList.add('electric');
    else if (credit.category === 'writer') nameEl.classList.add('flicker');
    else if (credit.category === 'hacker') nameEl.classList.add('flicker');
    else if (credit.category === 'special') nameEl.classList.add('glitch');
    else if (credit.category === 'title') nameEl.classList.add('electric');
    
    // Play glitch sound
    if (document.getElementById('glitch-sound')) {
        const glitchSound = document.getElementById('glitch-sound');
        glitchSound.currentTime = 0;
        glitchSound.play().catch(e => console.log("Audio error:", e));
    }
    
    return timeline;
}

// Function to show special layout credits like bilingual and hierarchical
function showSpecialLayoutCredit(timeline, credit) {
    const creditsContainer = document.querySelector('.credits-container');
    
    // Clear container
    creditsContainer.innerHTML = '';
    
    // Create the credit element
    const creditEl = document.createElement('div');
    creditEl.classList.add('credit', credit.layout);
    
    // For title layout, use large centered text
    if (credit.layout === 'title') {
        creditEl.classList.add('font-anton');
        creditEl.textContent = credit.name;
        creditEl.style.fontSize = 'clamp(10rem, 20vw, 20rem)'; // Much larger
        creditEl.style.letterSpacing = '10px';
        creditEl.style.color = colorPalette.blue; // Blue for title text
    }
    // For bilingual layout, format based on the language
    else if (credit.layout === 'bilingual') {
        // Process multiline text and preserve line breaks
        const lines = credit.name.split('\n');
        lines.forEach((line, i) => {
            const lineDiv = document.createElement('div');
            
            // Apply language-specific styling
            if (credit.language === 'japanese') {
                // First line is a category, make it red
                if (i === 0) {
                    lineDiv.style.color = colorPalette.red;
                    lineDiv.style.fontSize = 'clamp(2.5rem, 6vw, 4rem)'; // Larger
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    lineDiv.style.fontSize = 'clamp(2rem, 5vw, 3.5rem)'; // Larger
                    lineDiv.style.marginBottom = '0.5rem';
                }
            }
            else if (credit.language === 'chinese') {
                // First line is a category, make it gold
                if (i === 0) {
                    lineDiv.style.color = colorPalette.gold;
                    lineDiv.style.fontSize = 'clamp(2.5rem, 6vw, 4rem)'; // Larger
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    lineDiv.style.fontSize = 'clamp(2rem, 5vw, 3.5rem)'; // Larger
                    lineDiv.style.marginBottom = '0.5rem';
                }
            }
            else if (credit.language === 'russian') {
                // First line is a category, make it blue
                if (i === 0) {
                    lineDiv.style.color = colorPalette.blue;
                    lineDiv.style.fontSize = 'clamp(2.5rem, 6vw, 4rem)'; // Larger
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    lineDiv.style.fontSize = 'clamp(2rem, 5vw, 3.5rem)'; // Larger
                    lineDiv.style.marginBottom = '0.5rem';
                }
            }
            
            lineDiv.textContent = line;
            creditEl.appendChild(lineDiv);
        });
    }
    // For hierarchical layout
    else if (credit.layout === 'hierarchical') {
        // Process multiline text and preserve line breaks
        const lines = credit.name.split('\n');
        lines.forEach((line, i) => {
            const lineDiv = document.createElement('div');
            
            // First line is the category title
            if (i === 0) {
                lineDiv.style.color = colorPalette.green; // Green for category titles
                lineDiv.style.fontSize = 'clamp(3rem, 7vw, 5rem)'; // Larger
                lineDiv.style.marginBottom = '1.5rem';
                lineDiv.style.letterSpacing = '5px';
                lineDiv.style.fontWeight = 'bold';
            }
            // Names
            else {
                lineDiv.style.color = colorPalette.white; // White for names
                lineDiv.style.fontSize = 'clamp(2.5rem, 6vw, 4rem)'; // Larger
                lineDiv.style.marginBottom = '0.5rem';
            }
            
            lineDiv.textContent = line;
            creditEl.appendChild(lineDiv);
        });
    }
    // For firstname-lastname layout
    else if (credit.layout === 'firstname-lastname') {
        // Split name into first and last
        const lines = credit.name.split('\n');
        
        // First name on top
        const firstNameDiv = document.createElement('div');
        firstNameDiv.classList.add('name-first');
        firstNameDiv.textContent = lines[0];
        firstNameDiv.style.fontSize = 'clamp(5rem, 12vw, 10rem)'; // Much larger
        
        // Last name below, larger
        const lastNameDiv = document.createElement('div');
        lastNameDiv.classList.add('name-last');
        lastNameDiv.textContent = lines[1];
        lastNameDiv.style.fontSize = 'clamp(5rem, 12vw, 10rem)'; // Much larger
        
        // If this has the neon effect
        if (credit.effect === 'neon') {
            creditEl.style.color = colorPalette.blue;
            creditEl.classList.add('electric');
        } else {
            creditEl.style.color = colorPalette.white;
        }
        
        creditEl.appendChild(firstNameDiv);
        creditEl.appendChild(lastNameDiv);
    }
    
    // Add to container
    creditsContainer.appendChild(creditEl);
    
    // Set visible immediately
    gsap.set(creditEl, { opacity: 1 });
    
    // Play glitch sound
    if (document.getElementById('glitch-sound')) {
        const glitchSound = document.getElementById('glitch-sound');
        glitchSound.currentTime = 0;
        glitchSound.play().catch(e => console.log("Audio error:", e));
    }
    
    return timeline;
}

// Function to show packery group layout - multiple people in a more artistic layout
function showPackeryGroup(timeline, screen) {
    const creditsContainer = document.querySelector('.credits-container');
    
    // Clear the container first
    gsap.set('.credit, .credit-description', { 
        opacity: 0, 
        onComplete: function() {
            document.querySelectorAll('.credit, .credit-description').forEach(el => el.remove());
        }
    });
    
    // Extract the credits array from the screen object
    const credits = screen.credits || [];
    
    if (!credits.length) {
        console.error("No credits provided for packery layout");
        return timeline;
    }
    
    // Create and position credits with packery layout
    credits.forEach((credit, i) => {
        const creditEl = document.createElement('div');
        creditEl.classList.add('credit', 'packery-item');
        creditEl.textContent = credit.name;
        
        // Randomize size a bit within constraints (3x3 to 5x5 grid)
        const width = Math.floor(Math.random() * 3) + 3;
        const height = Math.floor(Math.random() * 3) + 3;
        
        // Responsive sizing that maintains the grid feel
        const gridSize = Math.min(window.innerWidth, window.innerHeight) / 12;
        
        creditEl.style.width = `${width * gridSize}px`;
        creditEl.style.height = `${height * gridSize}px`;
        creditEl.style.fontSize = '2rem';
        creditEl.style.fontWeight = 'bold';
        
        // Position randomly but ensure it's within container bounds
        const maxLeft = window.innerWidth - (width * gridSize);
        const maxTop = window.innerHeight - (height * gridSize) - 100; // Account for possible description
        
        creditEl.style.left = `${Math.random() * maxLeft}px`;
        creditEl.style.top = `${Math.random() * maxTop}px`;
        
        // Assign a color
        creditEl.style.color = colorPalette.white;
        
        creditsContainer.appendChild(creditEl);
        
        // Add description if available
        if (credit.description) {
            const descEl = document.createElement('div');
            descEl.classList.add('credit-description', 'packery-description');
            descEl.textContent = credit.description;
            
            // Position description below the credit
            const creditRect = creditEl.getBoundingClientRect();
            descEl.style.left = `${creditRect.left}px`;
            descEl.style.top = `${creditRect.bottom + 10}px`;
            descEl.style.width = `${creditRect.width}px`;
            
            creditsContainer.appendChild(descEl);
        }
        
        // Apply animations
        if (credit.category === 'tech') creditEl.classList.add('electric');
        else if (credit.category === 'artist') creditEl.classList.add('electric');
        else creditEl.classList.add('flicker');
    });
    
    // Play glitch sound
    if (document.getElementById('glitch-sound')) {
        const glitchSound = document.getElementById('glitch-sound');
        glitchSound.currentTime = 0;
        glitchSound.play().catch(e => console.log("Audio error:", e));
    }
    
    return timeline;
}

// -------------- PHASE 1: CREDITS SEQUENCE --------------
function startPhase1() {
    console.log("Starting Phase 1: Credits Sequence");
    
    // Show cursor for 1 second
    const cursor = document.querySelector('.cursor');
    gsap.set(cursor, { display: 'block', top: '50%', left: '50%', xPercent: -50, yPercent: -50 });
    
    // Load credits data then play main sequence
    loadCredits();
}

// -------------- PHASE 2: MAIN TITLE --------------
function transitionToPhase2() {
    console.log("Transitioning to Phase 2: Main Title");
    
    // Hide phase 1, show phase 2 immediately without animation
    phase1.classList.add('hidden');
    phase2.classList.remove('hidden');
    gsap.set(phase2, { display: 'block', opacity: 1 });
    
    // Start title sequence immediately
    startTitleSequence();
}

function startTitleSequence() {
    const titleElements = document.querySelectorAll('.title-word');
    const titleEnter = document.getElementById('title-enter');
    const titleThe = document.getElementById('title-the');
    const titleVibe = document.getElementById('title-vibe');
    
    // Title animation sequence
    const titleTimeline = gsap.timeline({
        onComplete: () => {
            // Brief pause before transition - longer (2.5s)
            gsap.delayedCall(2.5, () => {
                // Add final glitchy effect before transition
                titleElements.forEach(el => {
                    el.classList.add('electric');
                });
                
                // Play transition sound
                if (transitionSound) {
                    transitionSound.play().catch(e => console.log("Audio error:", e));
                }
                
                gsap.delayedCall(1, transitionToPhase3);
            });
        }
    });
    
    // Animate each title word - "Enter the Void" style but with Anton font (no rotations)
    titleTimeline
        // ENTER
        .to(titleEnter, {
            duration: 1,
            opacity: 1,
            ease: "power1.out"
        })
        // Add electric effect
        .add(() => {
            titleEnter.classList.add('electric');
            if (glitchSound) {
                glitchSound.currentTime = 0;
                glitchSound.play().catch(e => console.log("Audio error:", e));
            }
        }, "+=0.5") // Longer delay
        
        // THE
        .to(titleThe, {
            duration: 0.8,
            opacity: 1,
            ease: "power1.out",
            delay: 0.6 // Longer delay
        })
        // Add flicker effect
        .add(() => {
            titleThe.classList.add('flicker');
        }, "+=0.4") // Longer delay
        
        // VIBE
        .to(titleVibe, {
            duration: 1.2,
            opacity: 1,
            ease: "power1.out",
            delay: 0.7 // Longer delay
        })
        // Add glitch effect
        .add(() => {
            titleVibe.classList.add('glitch');
            if (glitchSound) {
                glitchSound.currentTime = 0;
                glitchSound.play().catch(e => console.log("Audio error:", e));
            }
        }, "+=0.5") // Longer delay
        
        // Pulse the entire title - longer duration (2.5s)
        .to(titleElements, {
            duration: 2.5,
            filter: "brightness(1.5)",
            repeat: 1,
            yoyo: true,
            stagger: 0.3,
            ease: "sine.inOut"
        });
}

// -------------- PHASE 3: DIGITAL LANDSCAPE --------------
function transitionToPhase3() {
    console.log("Transitioning to Phase 3: Digital Landscape");
    
    // Hide phase 2, show phase 3
    gsap.to(phase2, { duration: 0.5, opacity: 0, display: 'none', onComplete: () => {
        phase2.classList.add('hidden');
        phase3.classList.remove('hidden');
        gsap.set(phase3, { display: 'block', opacity: 1 });
        startDigitalLandscape();
    }});
}

function startDigitalLandscape() {
    // Create flying particles
    createParticles();
    
    // Start VIBE CODING animation
    initVibeCoding();
}

function createParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    
    // Clear any existing particles
    particlesContainer.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random color
        const colors = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FFFFFF'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Add to container
        particlesContainer.appendChild(particle);
        
        // Animate - linear movement only (no rotation as per requirements)
        gsap.to(particle, {
            y: `+=${Math.random() * 1000 + 500}`,
            x: `+=${(Math.random() * 200) - 100}`,
            opacity: 0,
            duration: Math.random() * 10 + 5,
            delay: Math.random() * 5,
            repeat: -1,
            ease: "none",
            onRepeat: () => {
                gsap.set(particle, {
                    y: -100,
                    x: Math.random() * window.innerWidth,
                    opacity: Math.random() * 0.8 + 0.2
                });
            }
        });
    }
}

function initVibeCoding() {
    // Select elements
    const letters = document.querySelectorAll('.letter');
    const vibeCoding = document.querySelector('.vibe-coding');
    
    // Create a timeline for the VIBE CODING animation
    const vibeTimeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.5 // Longer delay between repetitions
    });
    
    // Make the vibe-coding element visible
    gsap.to(vibeCoding, { opacity: 1, duration: 0.5 });
    
    // Entrance animation - no rotation as per requirements
    vibeTimeline.fromTo(letters, 
        {
            opacity: 0,
            y: 50, // Less movement
            scale: 0.8
        }, 
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5, // Slower animation
            ease: "power1.out",
            stagger: 0.12
        }
    )
    
    // Color effect - no rotation
    .to(letters, {
        duration: 3, // Longer duration
        color: (i) => {
            const colors = ['#FF4081', '#536DFE', '#8BC34A', '#FFC107', '#E040FB', '#00BCD4'];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        textShadow: "0 0 30px rgba(255,255,255,0.9)",
        ease: "sine.inOut",
        stagger: {
            each: 0.1,
            repeat: 1,
            yoyo: true
        }
    })
    
    // Electric effect on letters
    .call(() => {
        letters.forEach(letter => {
            if (!letter.classList.contains('space')) {
                letter.classList.add('electric');
            }
        });
        
        // Keep electric effect longer (2s instead of 1s)
        gsap.delayedCall(2, () => {
            letters.forEach(letter => {
                letter.classList.remove('electric');
            });
        });
    })
    
    // Longer hold before fade out (1s)
    .to(letters, { duration: 1 })
    
    // Fade out - no rotation
    .to(letters, {
        opacity: 0,
        y: -30, // Less movement
        scale: 0.8,
        duration: 1, // Slower fade
        stagger: 0.08,
        ease: "power1.in"
    });
}

function skipToPhase3() {
    // Stop all sounds
    if (mainSound) mainSound.pause();
    if (glitchSound) glitchSound.pause();
    if (transitionSound) transitionSound.pause();
    
    // Skip to phase 3 from any point in the sequence
    const currentPhase = document.querySelector('.phase:not(.hidden)');
    
    if (currentPhase.id === 'phase3') return; // Already in phase 3
    
    // Fade out current phase
    gsap.killTweensOf('.phase'); // Kill all animations
    gsap.to(currentPhase, { 
        duration: 0.5, 
        opacity: 0, 
        display: 'none', 
        onComplete: () => {
            // Hide all phases
            document.querySelectorAll('.phase').forEach(phase => {
                phase.classList.add('hidden');
            });
            
            // Show phase 3
            phase3.classList.remove('hidden');
            gsap.set(phase3, { display: 'block', opacity: 1 });
            
            // Initialize phase 3
            startDigitalLandscape();
        }
    });
}

// Function to show the end scene when audio finishes
function showEndScene() {
    console.log("Audio finished - showing end scene");
    
    // First transition to phase 3 if not already there
    const currentPhase = document.querySelector('.phase:not(.hidden)');
    if (currentPhase && currentPhase.id !== 'phase3') {
        // Force transition to phase 3
        transitionToPhase3();
    }
    
    // Create end scene elements
    const endScene = document.createElement('div');
    endScene.classList.add('end-scene');
    endScene.style.position = 'absolute';
    endScene.style.top = '0';
    endScene.style.left = '0';
    endScene.style.width = '100%';
    endScene.style.height = '100%';
    endScene.style.display = 'flex';
    endScene.style.flexDirection = 'column';
    endScene.style.justifyContent = 'center';
    endScene.style.alignItems = 'center';
    endScene.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    endScene.style.zIndex = '1000';
    
    // Create end title
    const endTitle = document.createElement('div');
    endTitle.textContent = 'ENTER THE VIBE';
    endTitle.style.fontSize = '6rem';
    endTitle.style.fontFamily = "'Anton', sans-serif";
    endTitle.style.color = 'white';
    endTitle.style.marginBottom = '2rem';
    endTitle.style.letterSpacing = '5px';
    endTitle.classList.add('electric');
    
    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.textContent = 'THANK YOU FOR WATCHING';
    subtitle.style.fontSize = '2rem';
    subtitle.style.fontFamily = "'Inter', sans-serif";
    subtitle.style.color = '#4495F1';
    subtitle.style.marginBottom = '3rem';
    
    // Create restart button
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'RESTART';
    restartBtn.style.padding = '1rem 2rem';
    restartBtn.style.fontSize = '1.5rem';
    restartBtn.style.fontFamily = "'Anton', sans-serif";
    restartBtn.style.backgroundColor = 'transparent';
    restartBtn.style.color = '#33FF33';
    restartBtn.style.border = '2px solid #33FF33';
    restartBtn.style.cursor = 'pointer';
    restartBtn.addEventListener('click', restartAnimation);
    
    // Append elements
    endScene.appendChild(endTitle);
    endScene.appendChild(subtitle);
    endScene.appendChild(restartBtn);
    
    // Add to phase 3
    const phase3 = document.getElementById('phase3');
    if (phase3) {
        phase3.appendChild(endScene);
    }
    
    // Animate in
    gsap.from(endScene, {
        opacity: 0,
        duration: 1.5
    });
    
    gsap.from(endTitle, {
        y: -50,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });
    
    gsap.from(subtitle, {
        y: -30,
        opacity: 0,
        duration: 1,
        delay: 1
    });
    
    gsap.from(restartBtn, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 1.5
    });
} 