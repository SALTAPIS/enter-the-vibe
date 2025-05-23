import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Global app configuration
let appConfig = null;

// -------------- CREDIT SEQUENCE DATA --------------
// Will store all credits loaded from JSON
let allCredits = [];
let currentCreditIndex = 0; // Track current position in credits sequence

// Global variables for state tracking
let lastScreenChangeTime = Date.now();
let beatDetected = null; // Will be defined by playCreditsSequence
let minScreenDisplayTime = 300; // Minimum display time in milliseconds (0.3 seconds by default)
let isTransitionInProgress = false; // Flag to track when a transition is in progress

// Audio elements
let mainSound = null;
let glitchSound = null;
let transitionSound = null;

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
        
        // Apply font settings to CSS variables if needed
        if (appConfig.display && appConfig.display.fonts) {
            console.log('Font settings loaded from app-config');
            
            // You can add code here if you want to apply any font settings globally via CSS variables
            // For example:
            // document.documentElement.style.setProperty('--single-name-font-size', appConfig.display.fonts.layouts.single.nameFirst);
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
        
        // Combine all chronological credits into one array in the correct order
        allCredits = [
            ...(creditsData.early_computing || []),
            ...(creditsData.semiconductors_era || []),
            ...(creditsData.ai_pioneers || []),
            ...(creditsData.networking_era || []),
            ...(creditsData.personal_computing || []),
            ...(creditsData.internet_era || []),
            ...(creditsData.social_media_era || []),
            ...(creditsData.digital_artists || []),
            ...(creditsData.cyberpunk_writers || []),
            ...(creditsData.electronic_music || []),
            ...(creditsData.hackers || []),
            ...(creditsData.global_pioneers || []),
            ...(creditsData.blockchain_era || []),
            ...(creditsData.special || [])
        ];

        console.log(`Loaded ${allCredits.length} credits from JSON in chronological order`);
        
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

// Function to toggle HeroPanel visibility - defined early so it's available for event listeners
function toggleHeroPanelVisibility() {
    // Update HeroPanel visibility if the function exists
    if (typeof window.updateHeroPanelVisibility === 'function') {
        window.updateHeroPanelVisibility();
    }
}

// Main initialization function
async function init() {
    // First load app configuration
    await loadAppConfig();
    
    // Apply primary font if specified in the config
    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.primary) {
        document.body.classList.add(appConfig.display.fonts.primary);
    }
    
    // Then load credits and continue initialization
    await loadCredits();
    
    // Initialize HeroPanel controls directly (no need to load script as it's now inline)
    try {
        initHeroPanel();
    } catch (e) {
        console.error('Failed to initialize HeroPanel component:', e);
    }
    
    // Initialize bottom control panel
    try {
        initBottomControls();
    } catch (e) {
        console.error('Failed to initialize bottom controls:', e);
    }
    
    // Initialize UI elements
    const startButton = document.getElementById('start-button');
    mainSound = document.getElementById('main-sound');
    glitchSound = document.getElementById('glitch-sound');
    transitionSound = document.getElementById('transition-sound');
    
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
                    
                    // Show bottom controls when experience starts
                    if (typeof window.showBottomControls === 'function') {
                        window.showBottomControls();
                    }
                    
                    // Initialize audio context and visualization
                    if (mainSound) {
                        // Make sure audio is ready to play
                        mainSound.volume = 1.0;
                        mainSound.currentTime = 0;
                        
                        // Add event listener for when audio ends
                        mainSound.removeEventListener('ended', showEndScene); // Remove any existing listener first
                        mainSound.addEventListener('ended', showEndScene);
                        console.log("Added 'ended' event listener to mainSound");
                        
                        // Play the sound
                        mainSound.play().then(() => {
                            console.log("Main sound started playing");
                            setupAudioVisualization(mainSound);
                            
                            // Update bottom controls play state
                            if (typeof window.updateBottomControlsPlayState === 'function') {
                                window.updateBottomControlsPlayState(true);
                            }
                            
                            // Ensure fallback beats are running (even if audio analysis is working)
                            startFallbackBeatTimer();
                        }).catch(err => {
                            console.error("Error playing main sound:", err);
                            // If audio fails to play, still start fallback beats
                            startFallbackBeatTimer();
                        });
                        
                        // Add audio event listeners for bottom controls
                        mainSound.addEventListener('pause', () => {
                            if (typeof window.updateBottomControlsPlayState === 'function') {
                                window.updateBottomControlsPlayState(false);
                            }
                        });
                        
                        mainSound.addEventListener('ended', () => {
                            if (typeof window.updateBottomControlsPlayState === 'function') {
                                window.updateBottomControlsPlayState(false);
                            }
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
    console.log("Building comprehensive chronological computing history sequence");
    
    // Connect the beat detection to the credits sequence advancement
    window.addEventListener('audiobeat', handleBeat);
    
    // The main screens array for our sequence
    const creditScreens = [];
    
    // 1. Start with the title screens
    if (creditsData.layouts && creditsData.layouts.title) {
        creditScreens.push(...creditsData.layouts.title);
        // Add title pause
        creditScreens.push({ name: "COMPUTING HISTORY", category: "pause", layout: "single" });
    }
    
    // Helper function to get credits from a category
    function getCreditsFromCategory(categoryName, count = null) {
        const categoryData = creditsData[categoryName] || [];
        return count ? categoryData.slice(0, count) : categoryData;
    }
    
    // Helper function to shuffle array
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    // Helper function to add mixed content screens
    function addMixedScreens(categories, maxPerCategory = 8) {
        const allScreens = [];
        categories.forEach(cat => {
            const screens = getCreditsFromCategory(cat, maxPerCategory);
            allScreens.push(...screens);
        });
        return shuffle(allScreens);
    }
    
    // Helper function to get logos for a specific era
    function getLogosForEra(era) {
        if (!creditsData.layouts || !creditsData.layouts.fullscreen_logos) return [];
        return creditsData.layouts.fullscreen_logos.filter(logo => logo.era === era);
    }
    
    // 2. EARLY COMPUTING FOUNDATION (1800s-1950s)
    creditScreens.push({ name: "EARLY COMPUTING", category: "era_title", layout: "single", color: "blue" });
    creditScreens.push(creditsData.layouts.hierarchical[0]); // Early computing pioneers
    
    // Add early computing name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[0]) {
        creditScreens.push(creditsData.layouts.name_grids[0]); // Early computing grid
    }
    
    // Mix early computing with featured pioneers
    const earlyMix = addMixedScreens(['early_computing', 'featured'], 8);
    creditScreens.push(...earlyMix);
    
    // Add fullscreen logos from early era
    const earlyLogos = getLogosForEra('early');
    creditScreens.push(...earlyLogos.slice(0, 2));
    
    // Add some hierarchical and special credits
    creditScreens.push(creditsData.layouts.hierarchical[1]); // Semiconductor revolution
    
    // Add semiconductor name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[1]) {
        creditScreens.push(creditsData.layouts.name_grids[1]); // Semiconductor grid
    }
    
    // 3. SEMICONDUCTOR & MICROPROCESSOR ERA (1950s-1970s)
    creditScreens.push({ name: "SEMICONDUCTOR REVOLUTION", category: "era_title", layout: "single", color: "yellow" });
    
    // Mix semiconductor era with global pioneers
    const semiconductorMix = addMixedScreens(['semiconductors_era', 'global_pioneers'], 10);
    creditScreens.push(...semiconductorMix);
    
    // Add semiconductor era logos
    const semiconductorLogos = getLogosForEra('semiconductor');
    creditScreens.push(...semiconductorLogos.slice(0, 3));
    
    // Add first bilingual screen
    if (creditsData.layouts.bilingual) {
        creditScreens.push(creditsData.layouts.bilingual[0]); // Japanese screen
    }
    
    // 4. AI PIONEERS & EARLY RESEARCH (1950s-1980s)
    creditScreens.push({ name: "ARTIFICIAL INTELLIGENCE PIONEERS", category: "era_title", layout: "single", color: "green" });
    creditScreens.push(creditsData.layouts.hierarchical[4]); // AI revolution hierarchical
    
    // Add AI name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[2]) {
        creditScreens.push(creditsData.layouts.name_grids[2]); // AI Revolution grid
    }
    
    // Mix AI pioneers only (no modern companies yet)
    const aiMix = addMixedScreens(['ai_pioneers'], 10);
    creditScreens.push(...aiMix);
    
    // No AI era logos yet - save for later
    
    // 5. PERSONAL COMPUTING ERA (1970s-1990s)
    creditScreens.push({ name: "PERSONAL COMPUTING", category: "era_title", layout: "single", color: "orange" });
    creditScreens.push(creditsData.layouts.hierarchical[2]); // Personal computer era
    
    // Add personal computing name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[4]) {
        creditScreens.push(creditsData.layouts.name_grids[4]); // Personal computing grid
    }
    
    // Mix personal computing with companies
    const personalComputingMix = addMixedScreens(['personal_computing', 'companies'], 12);
    creditScreens.push(...personalComputingMix);
    
    // Add personal computing era logos
    const personalComputingLogos = getLogosForEra('personal_computing');
    creditScreens.push(...personalComputingLogos.slice(0, 4));
    
    // 6. NETWORKING & INTERNET FOUNDATIONS (1960s-1990s)
    creditScreens.push({ name: "NETWORKING & INTERNET", category: "era_title", layout: "single", color: "cyan" });
    creditScreens.push(creditsData.layouts.hierarchical[3]); // Internet foundations
    
    // Add networking name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[3]) {
        creditScreens.push(creditsData.layouts.name_grids[3]); // Networking pioneers grid
    }
    
    // Mix networking with hackers and non-western pioneers
    const networkingMix = addMixedScreens(['networking_era', 'hackers', 'non_western'], 15);
    creditScreens.push(...networkingMix);
    
    // Add CERN and early web logos
    const internetLogos = getLogosForEra('internet');
    creditScreens.push(...internetLogos.slice(0, 3));
    
    // 7. INTERNET BOOM (1990s-2000s)
    creditScreens.push({ name: "THE INTERNET BOOM", category: "era_title", layout: "single", color: "magenta" });
    
    // Add internet era name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[5]) {
        creditScreens.push(creditsData.layouts.name_grids[5]); // Internet era grid
    }
    
    // Mix internet era with companies
    const internetMix = addMixedScreens(['internet_era', 'companies'], 10);
    creditScreens.push(...internetMix);
    
    // Add more internet logos
    creditScreens.push(...internetLogos.slice(3, 6));
    
    // 8. SOCIAL MEDIA & WEB 2.0 (2000s-2010s)
    creditScreens.push({ name: "SOCIAL MEDIA REVOLUTION", category: "era_title", layout: "single", color: "pink" });
    creditScreens.push(creditsData.layouts.hierarchical[5]); // Social media pioneers
    
    // Add social media name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[6]) {
        creditScreens.push(creditsData.layouts.name_grids[6]); // Social media grid
    }
    
    // Mix social media with global pioneers
    const socialMix = addMixedScreens(['social_media_era', 'global_pioneers'], 8);
    creditScreens.push(...socialMix);
    
    // Add social media logos
    const socialMediaLogos = getLogosForEra('social_media');
    creditScreens.push(...socialMediaLogos);
    
    // 9. DIGITAL CREATIVITY & CULTURE
    creditScreens.push({ name: "DIGITAL CREATIVITY & CULTURE", category: "era_title", layout: "single", color: "gold" });
    
    // Add digital artists name grid
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[7]) {
        creditScreens.push(creditsData.layouts.name_grids[7]); // Digital artists grid
    }
    
    // Mix digital artists with electronic music and cyberpunk writers
    const creativeMix = addMixedScreens(['digital_artists', 'electronic_music', 'cyberpunk_writers'], 12);
    creditScreens.push(...creativeMix.slice(0, 25));
    
    // Add creativity hierarchical screens
    if (creditsData.layouts.hierarchical) {
        creditScreens.push(creditsData.layouts.hierarchical[9]); // Digital artists
        creditScreens.push(creditsData.layouts.hierarchical[11]); // Electronic music pioneers
    }
    
    // Add electronic music and cyberpunk writers name grids
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[8]) {
        creditScreens.push(creditsData.layouts.name_grids[8]); // Electronic music grid
    }
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[9]) {
        creditScreens.push(creditsData.layouts.name_grids[9]); // Cyberpunk writers grid
    }
    
    // Add more bilingual screens
    if (creditsData.layouts.bilingual) {
        creditScreens.push(creditsData.layouts.bilingual[4]); // Hindi screen
        creditScreens.push(creditsData.layouts.bilingual[7]); // Korean screen
        creditScreens.push(creditsData.layouts.bilingual[8]); // Portuguese screen
        creditScreens.push(creditsData.layouts.bilingual[9]); // African tech pioneers
    }
    
    // 10. MODERN TECH ERA (2000s-2010s)
    creditScreens.push({ name: "MODERN TECH PLATFORMS", category: "era_title", layout: "single", color: "green" });
    
    // Mix modern tech leaders with hackers
    const modernMix = addMixedScreens(['modern_tech_leaders', 'hackers'], 6);
    creditScreens.push(...modernMix.slice(0, 12));
    
    // Add modern era logos
    const modernLogos = getLogosForEra('modern');
    if (modernLogos.length > 0) {
        creditScreens.push(...modernLogos); // GitHub
    }
    
    // Add more hierarchical screens
    if (creditsData.layouts.hierarchical) {
        creditScreens.push(creditsData.layouts.hierarchical[6]); // Programming language creators
        creditScreens.push(creditsData.layouts.hierarchical[7]); // Security and cryptography
        creditScreens.push(creditsData.layouts.hierarchical[8]); // Game developers
        creditScreens.push(creditsData.layouts.hierarchical[10]); // Asian computing pioneers
    }
    
    // 11. AI REVOLUTION (2010s-present)
    creditScreens.push({ name: "THE AI REVOLUTION", category: "era_title", layout: "single", color: "red" });
    
    // Mix all AI-related content including modern companies
    const aiRevolutionMix = addMixedScreens(['ai_pioneers', 'ai_companies', 'featured'], 25);
    creditScreens.push(...aiRevolutionMix.slice(0, 35));
    
    // Add AI era logos (modern AI companies)
    const aiLogos = getLogosForEra('ai');
    if (aiLogos.length > 0) {
        creditScreens.push(...aiLogos); // OpenAI, Anthropic, Google Gemini, Claude AI
    }
    
    // 12. GLOBAL RECOGNITION
    creditScreens.push({ name: "GLOBAL COMPUTING LEGACY", category: "era_title", layout: "single", color: "blue" });
    
    // Add global pioneers and tech companies name grids
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[10]) {
        creditScreens.push(creditsData.layouts.name_grids[10]); // Global pioneers grid
    }
    if (creditsData.layouts.name_grids && creditsData.layouts.name_grids[11]) {
        creditScreens.push(creditsData.layouts.name_grids[11]); // Tech companies grid
    }
    
    // Add final mix of all categories
    const globalMix = addMixedScreens(['non_western', 'featured', 'companies'], 15);
    creditScreens.push(...globalMix);
    
    // 13. THE FUTURE
    creditScreens.push({ name: "THE FUTURE IS BEING WRITTEN", category: "era_title", layout: "single", color: "gold" });
    creditScreens.push({ name: "BY ALL OF US", category: "era_title", layout: "single", color: "white" });
    
    // Special ending
    if (creditsData.special) {
        creditScreens.push(...creditsData.special);
    }
    
    // Set the global credits array to our built sequence
    allCredits = creditScreens;
    
    console.log(`Built comprehensive sequence with ${creditScreens.length} screens`);
    console.log("Sequence includes:", {
        individual_screens: creditScreens.filter(s => s.name && !s.credits && !s.logos && !s.logo).length,
        era_titles: creditScreens.filter(s => s.category === 'era_title').length,
        hierarchical_screens: creditScreens.filter(s => s.layout === 'hierarchical').length,
        bilingual_screens: creditScreens.filter(s => s.layout === 'bilingual').length,
        fullscreen_logos: creditScreens.filter(s => s.category === 'logo' && s.layout === 'fullscreen').length,
        special_screens: creditScreens.filter(s => s.category === 'special').length
    });
    
    // Start the credits sequence
    playCreditsSequence();
}

// Function to show the next screen
let showNextScreen = null;

// Update the playCreditsSequence function to handle the new layout types (grid and row)
function playCreditsSequence() {
    const creditsContainer = document.querySelector('.credits-container');
    const singleCreditContainer = document.querySelector('.single-credit-container');
    
    // Clear containers
    creditsContainer.innerHTML = '';
    singleCreditContainer.innerHTML = '';
    
    // Keep track of current screen index
    let currentScreenIndex = 0;
    
    // Function to show the next screen
    showNextScreen = () => {
        // Debug logging to understand what we're getting
        console.log(`Screen ${currentScreenIndex}:`, allCredits[currentScreenIndex]);
        
        // Set the transition flag
        isTransitionInProgress = true;
        
        // Clear containers immediately
        creditsContainer.innerHTML = '';
        singleCreditContainer.innerHTML = '';
        
        const credit = allCredits[currentScreenIndex];
        
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
        else if (credit.category === "logo" && credit.layout === "fullscreen") {
            // Fullscreen logo layout
            showFullscreenLogo(screenTimeline, credit);
        }
        else if (credit.layout === "grid" || credit.layout === "row") {
            // Handle name grids specially
            if (credit.category === "name_grid" && credit.names) {
                // Convert names array to credits format
                const gridCredits = credit.names.map(nameObj => {
                    // Handle both old format (strings) and new format (objects)
                    if (typeof nameObj === 'string') {
                        return {
                            name: nameObj,
                            description: "",
                            category: "name_grid"
                        };
                    } else {
                        return {
                            name: nameObj.name,
                            description: nameObj.description || "",
                            category: "name_grid"
                        };
                    }
                });
                showGridLayout(screenTimeline, gridCredits, credit.layout);
            }
            // Group of credits - show them together
            else if (credit.credits) {
                showGridLayout(screenTimeline, credit.credits, credit.layout);
            }
            else {
                console.warn("Grid layout requested but no credits or names found:", credit);
            }
        }
        else if (credit.name && credit.description) {
            // Individual credit without explicit layout - show as single name
            showSingleName(screenTimeline, credit);
        }
        else {
            // Fallback - log unhandled screen type
            console.warn("Unhandled screen type:", credit);
        }
        
        // Increment index for next time
        currentScreenIndex = (currentScreenIndex + 1) % allCredits.length;
        lastScreenChangeTime = Date.now();
        
        // Reset the transition flag after a small delay to prevent immediate transitions
        setTimeout(() => {
            isTransitionInProgress = false;
        }, 50);
    };
    
    // Show the first screen immediately
    showNextScreen();
    
    // Update the beat detection callback to show the next screen on beat
    beatDetected = () => {
        // Only change screen if enough time has passed AND no transition is in progress
        const now = Date.now();
        const timeSinceLastChange = now - lastScreenChangeTime;
        
        // Use the configurable minimum time between screen changes
        if (timeSinceLastChange >= minScreenDisplayTime && !isTransitionInProgress) {
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

// Function to limit description to maximum 2 words
function limitDescriptionWords(description) {
    if (!description) return '';
    
    // Split by spaces and take only first 2 words
    const words = description.split(' ');
    return words.slice(0, 2).join(' ');
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

// Global variables for visualization 
let peakCutoff = 100; // Default threshold for detecting peaks
let peakThreshold = 0.05; // Multiplier for peakCutoff (user adjustable)
let noiseFloor = 60; // Noise gate threshold (user adjustable)
let peakCount = 0; // Count of detected peaks
let lastPeakTime = 0; // Time of last detected peak
let peakDetected = false; // Flag for active peak state
let isAudioActuallyPlaying = false; // Flag to check if audio is actually playing
let signalEnergy = 0; // Running average of signal energy
let energyDecay = 0.95; // Decay rate for energy smoothing
let cutoffDecay = 0.95; // Decay rate for dynamic threshold
let peakHoldTime = 250; // Minimum time between peaks in ms

// Frequency range for analysis
let freqRangeStart = 0; // Default start (lower frequency)
let freqRangeEnd = 20; // Default end (higher frequency)
let freqRangeHighlight = null; // Element to highlight the frequency range

// Auto beat settings
let autoBeatsEnabled = false; // Flag for automatic beats
let autoBeatInterval = 500; // Interval for automatic beats in ms
let autoBeatTimer = null; // Timer reference for automatic beats
let displayTime = 500; // How long to display beat visuals in ms

// Credits settings
let credits = []; // Loaded from JSON

// Preload images array
const preloadedImages = [];

// Fallback beat timer
let useFallbackBeats = false; // Default to OFF
let fallbackBeatInterval = 300; // Updated interval
let fallbackBeatTimer = null;

// Controls elements
let displayTimeSlider, displayTimeValue; // Control elements for display time
let toggleControlsBtn, beatControls;

// Function to start fallback beat timer
function startFallbackBeatTimer() {
    stopFallbackBeatTimer(); // First stop any existing timer
    
    if (useFallbackBeats && !fallbackBeatTimer) {
        // Removed console log to reduce spam
        fallbackBeatTimer = setInterval(() => {
            // Only trigger fallback beats if audio is actually playing
            if (useFallbackBeats && isAudioActuallyPlaying) {
                // Force a peak detection - removed console log to reduce spam
                detectPeak(true);
            }
        }, fallbackBeatInterval);
    }
}

// Function to stop fallback beat timer
function stopFallbackBeatTimer() {
    if (fallbackBeatTimer) {
        // Removed console log to reduce spam
        clearInterval(fallbackBeatTimer);
        fallbackBeatTimer = null;
    }
}

// Setup audio visualization
function setupAudioVisualization(audioElement) {
    console.log("Setting up audio visualization...");
    
    // Initialize frequency range highlight
    freqRangeHighlight = document.getElementById('freq-range-highlight');
    
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
    
    try {
        // Create audio context if it doesn't exist
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create analyzer node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // Higher value for more detailed analysis
        analyser.smoothingTimeConstant = 0.7; // Better for detecting distinct beats
        
        // Create and connect audio source safely
        try {
            // Connect audio element to analyzer
            audioSource = audioContext.createMediaElementSource(audioElement);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (error) {
            console.warn("Error connecting audio element, may already be connected:", error);
            
            // If audio is already connected, try to recreate the audio context
            if (error.name === 'InvalidStateError' && error.message.includes('already connected')) {
                console.log("Audio element already connected, trying to reconnect...");
                
                // Try to disconnect everything and recreate
                if (audioSource) {
                    try {
                        audioSource.disconnect();
                    } catch (e) {
                        console.log("Error disconnecting audio source:", e);
                    }
                }
                
                if (analyser) {
                    try {
                        analyser.disconnect();
                    } catch (e) {
                        console.log("Error disconnecting analyser:", e);
                    }
                }
                
                // Create new audio context and analyser
                audioContext.close().then(() => {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 512;
                    analyser.smoothingTimeConstant = 0.7;
                    
                    // Try connecting again with the new context
                    try {
                        audioSource = audioContext.createMediaElementSource(audioElement);
                        audioSource.connect(analyser);
                        analyser.connect(audioContext.destination);
                        console.log("Successfully reconnected audio element");
                    } catch (e) {
                        console.error("Failed to reconnect audio element:", e);
                    }
                }).catch(err => {
                    console.error("Failed to close and recreate audio context:", err);
                });
            }
        }
        
        // Create frequency data array
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        
        // Log setup success
        console.log("Audio visualization setup complete");
        
        // Start visualization loop
        drawVisualization();
    } catch (error) {
        console.error("Error setting up audio visualization:", error);
        // Even if visualization fails, ensure fallback beats are running
        if (useFallbackBeats) {
            startFallbackBeatTimer();
        }
    }
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
        
        // If we detect energy above our noise floor threshold, consider audio to be playing
        if (totalEnergy > noiseFloor * 10) { // Use noiseFloor consistently
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
    // Load saved settings
    loadSettings();
    
    // Set initial state based on app config
    if (appConfig && appConfig.audio && appConfig.audio.beatDetection) {
        const beatConfig = appConfig.audio.beatDetection;
        
        // Set default values if not already set in settings
        if (peakThreshold === undefined && beatConfig.peakThreshold) {
            peakThreshold = beatConfig.peakThreshold.default;
        }
        
        if (noiseFloor === undefined && beatConfig.noiseFloor) {
            noiseFloor = beatConfig.noiseFloor.default;
        }
        
        if (freqRangeStart === undefined && beatConfig.frequencies && beatConfig.frequencies.custom) {
            freqRangeStart = beatConfig.frequencies.custom.start.default;
        }
        
        if (freqRangeEnd === undefined && beatConfig.frequencies && beatConfig.frequencies.custom) {
            freqRangeEnd = beatConfig.frequencies.custom.end.default;
        }
        
        if (useFallbackBeats === undefined && beatConfig.fallbackBeats) {
            useFallbackBeats = beatConfig.fallbackBeats.enabled;
        }
        
        if (fallbackBeatInterval === undefined && beatConfig.fallbackBeats) {
            fallbackBeatInterval = beatConfig.fallbackBeats.interval.default;
        }
        
        if (minScreenDisplayTime === undefined && appConfig.display && appConfig.display.timing) {
            minScreenDisplayTime = appConfig.display.timing.minDisplayTime;
        }
    }
    
    // Save settings
    saveSettings();
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        peakThreshold,
        noiseFloor,
        freqRangeStart,
        freqRangeEnd,
        useFallbackBeats,
        fallbackBeatInterval,
        displayTime
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
            noiseFloor = settings.noiseFloor || 70; // Use noiseFloor consistently
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
    
    noiseFloorSlider.value = noiseFloor;
    noiseFloorValue.textContent = noiseFloor.toString();
    
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
    noiseFloor = 70; // Use noiseFloor consistently
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
        mainSound.removeEventListener('ended', showEndScene);
    }
    
    if (glitchSound) {
        glitchSound.pause();
    }
    
    if (transitionSound) {
        transitionSound.pause();
    }
    
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
    
    // Reset audio context and disconnect all nodes
    if (audioContext) {
        // Close the audio context to clean up resources
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
    
    // Show phase 1 immediately rather than showing the start screen
    const phase1 = document.getElementById('phase1');
    phase1.classList.remove('hidden');
    gsap.set(phase1, { opacity: 1 });
    
    // Reset beat counter and detection
    peakCount = 0;
    resetPeakDetection();
    
    // Replace the audio elements with fresh clones to prevent connection issues
    const originalMainSound = document.getElementById('main-sound');
    const originalGlitchSound = document.getElementById('glitch-sound');
    const originalTransitionSound = document.getElementById('transition-sound');
    
    if (originalMainSound) {
        // Create a clone of the main sound element
        const clone = originalMainSound.cloneNode(true);
        // Replace the original with the clone
        originalMainSound.parentNode.replaceChild(clone, originalMainSound);
        // Update our reference
        mainSound = clone;
    }
    
    if (originalGlitchSound) {
        // Create a clone of the glitch sound element
        const clone = originalGlitchSound.cloneNode(true);
        // Replace the original with the clone
        originalGlitchSound.parentNode.replaceChild(clone, originalGlitchSound);
        // Update our reference
        glitchSound = clone;
    }
    
    if (originalTransitionSound) {
        // Create a clone of the transition sound element
        const clone = originalTransitionSound.cloneNode(true);
        // Replace the original with the clone
        originalTransitionSound.parentNode.replaceChild(clone, originalTransitionSound);
        // Update our reference
        transitionSound = clone;
    }
    
    // Create a new audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize audio and visualization
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
            
            // Update bottom controls play state
            if (typeof window.updateBottomControlsPlayState === 'function') {
                window.updateBottomControlsPlayState(true);
            }
            
            // Ensure fallback beats are running (even if audio analysis is working)
            startFallbackBeatTimer();
        }).catch(err => {
            console.error("Error playing main sound:", err);
            // If audio fails to play, still start fallback beats
            startFallbackBeatTimer();
        });
        
        // Add audio event listeners for bottom controls
        mainSound.addEventListener('pause', () => {
            if (typeof window.updateBottomControlsPlayState === 'function') {
                window.updateBottomControlsPlayState(false);
            }
        });
        
        mainSound.addEventListener('ended', () => {
            if (typeof window.updateBottomControlsPlayState === 'function') {
                window.updateBottomControlsPlayState(false);
            }
        });
    } else {
        console.error("Main sound element not found!");
        // Even without sound, start fallback beats
        startFallbackBeatTimer();
    }
    
    // Start the experience directly
    startPhase1();
    
    console.log("Animation restarted and immediately started");
}

// Function to handle beat events during credits sequence
function handleBeat(event) {
    // If beatDetected is defined and callable, use it
    if (typeof beatDetected === 'function') {
        beatDetected();
    } else {
        const currentTime = Date.now();
        
        // Only advance if screen has been visible for at least the minimum time
        // AND no transition is currently in progress
        if (currentTime - lastScreenChangeTime >= minScreenDisplayTime && !isTransitionInProgress) {
            if (typeof showNextScreen === 'function') {
                showNextScreen();
            }
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
        if (analyser) {
            analyser.getByteFrequencyData(frequencyData);
            
            // Check for peaks - this is critical for beat detection
            detectPeak(); // Call detectPeak on every frame
            
            // Draw visualization based on frequency data
            drawVisualizationBars(ctx, canvas, frequencyData);
            
            // Request an update of the HeroPanel with the latest information if available
            if (typeof window.requestHeroPanelUpdate === 'function') {
                window.requestHeroPanelUpdate();
            }
        } else {
            // No audio analyzer yet - just draw empty visualization
            drawVisualizationBars(ctx, canvas, new Uint8Array(128)); // Empty array as placeholder
        }
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
    const noiseGateHeight = noiseFloor * heightMultiplier; // Use noiseFloor consistently
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
            frequencyData[i] > noiseFloor) { // Use noiseFloor consistently
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
}

// Function to manually trigger a peak detection event
function detectPeak(forcePeak = false) {
    if (forcePeak || shouldTriggerPeak()) {
        // Increment peak count
        peakCount++;
        
        // Update peak detected state
        peakDetected = true;
        
        // Ensure the HeroPanel is updated with beat detection
        if (typeof window.requestHeroPanelUpdate === 'function') {
            // Make this call synchronous to ensure it happens immediately
            window.requestHeroPanelUpdate();
        }
        
        // Log peak detection only if it's forced (less spam)
        if (forcePeak) {
            console.log(`Peak detected! (forced) Count: ${peakCount}`);
        }
        
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
            
            // Update HeroPanel again to remove the beat effect
            if (typeof window.requestHeroPanelUpdate === 'function') {
                window.requestHeroPanelUpdate();
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
    if (currentEnergy < noiseFloor) {
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
    
    // Create a wrapper for the credit and description
    const creditWrapper = document.createElement('div');
    creditWrapper.style.position = 'absolute';
    creditWrapper.style.top = '50%'; // Changed from 40% to 50% for better vertical centering
    creditWrapper.style.left = '50%';
    creditWrapper.style.transform = 'translate(-50%, -50%)';
    creditWrapper.style.width = '90%';
    creditWrapper.style.textAlign = 'center';
    creditWrapper.style.display = 'flex';
    creditWrapper.style.flexDirection = 'column';
    creditWrapper.style.alignItems = 'center';
    creditWrapper.style.justifyContent = 'center'; // Add justify-content center
    
    // Split name into first/last name for single display
    const splitName = splitNameIntoLines(credit.name);
    
    // Create name element
    const nameEl = document.createElement('div');
    nameEl.classList.add('credit', 'single');
    nameEl.style.position = 'relative'; // Changed from absolute
    nameEl.style.transform = 'none'; // Remove transform
    nameEl.style.top = 'auto'; // Clear top positioning from CSS
    nameEl.style.left = 'auto'; // Clear left positioning from CSS
    
    // Use HTML to format the split name
    const nameParts = splitName.split('\n');
    if (nameParts.length === 2) {
        nameEl.innerHTML = `<div class="name-first">${nameParts[0]}</div>
                          <div class="name-last">${nameParts[1]}</div>`;
        
        // Ensure same font size for both parts - make it much larger
        const firstNameEl = nameEl.querySelector('.name-first');
        const lastNameEl = nameEl.querySelector('.name-last');
        if (firstNameEl && lastNameEl) {
            // Use font sizes from appConfig if available
            if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.single) {
                firstNameEl.style.fontSize = appConfig.display.fonts.layouts.single.nameFirst;
                lastNameEl.style.fontSize = appConfig.display.fonts.layouts.single.nameLast;
            } else {
                // Fallback to hardcoded value
                firstNameEl.style.fontSize = 'clamp(6rem, 12vw, 12rem)';
                lastNameEl.style.fontSize = 'clamp(6rem, 12vw, 12rem)';
            }
        }
    } else {
        nameEl.textContent = credit.name;
        // Use title font size from appConfig if available
        if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.title) {
            nameEl.style.fontSize = appConfig.display.fonts.layouts.title.text;
        } else {
            // Fallback to hardcoded value
            nameEl.style.fontSize = 'clamp(6rem, 15vw, 14rem)';
        }
    }
    
    // Add color (80% white, 20% other colors)
    nameEl.style.color = getRandomColor();
    
    // Add to wrapper
    creditWrapper.appendChild(nameEl);
    
    // If there's a description, add it
    if (credit.description) {
            const descEl = document.createElement('div');
            descEl.classList.add('credit-description');
        descEl.textContent = limitDescriptionWords(credit.description);
        
        // Use description font size from appConfig if available
        if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.single) {
            descEl.style.fontSize = appConfig.display.fonts.layouts.single.description;
        } else {
            // Fallback to hardcoded value
            descEl.style.fontSize = 'clamp(1.2rem, 3vw, 2.5rem)';
        }
        
        // Add description to wrapper
        creditWrapper.appendChild(descEl);
    }
    
    // Add wrapper to container
    singleCreditContainer.appendChild(creditWrapper);
    
    // Make it visible immediately
    gsap.set(creditWrapper, { opacity: 1 });
    
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
        
        // Use title font size from appConfig if available
        if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.title) {
            creditEl.style.fontSize = appConfig.display.fonts.layouts.title.text;
        } else {
            // Fallback to hardcoded value
            creditEl.style.fontSize = 'clamp(10rem, 20vw, 20rem)';
        }
        
        creditEl.style.letterSpacing = '10px';
        creditEl.style.color = colorPalette.white; // Changed from blue to white
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
                    
                    // Use heading font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.heading;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(7.5rem, 18vw, 12rem)';
                    }
                    
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    
                    // Use text font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.text;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(6rem, 15vw, 10.5rem)';
                    }
                    
                    lineDiv.style.marginBottom = '0.5rem';
                }
            }
            else if (credit.language === 'chinese') {
                // First line is a category, make it gold
                if (i === 0) {
                    lineDiv.style.color = colorPalette.gold;
                    
                    // Use heading font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.heading;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(7.5rem, 18vw, 12rem)';
                    }
                    
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    
                    // Use text font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.text;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(6rem, 15vw, 10.5rem)';
                    }
                    
                    lineDiv.style.marginBottom = '0.5rem';
                }
            }
            else if (credit.language === 'russian') {
                // First line is a category, make it blue
                if (i === 0) {
                    lineDiv.style.color = colorPalette.blue;
                    
                    // Use heading font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.heading;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(7.5rem, 18vw, 12rem)';
                    }
                    
                    lineDiv.style.marginBottom = '1rem';
                }
                // Names are white in this format
                else {
                    lineDiv.style.color = colorPalette.white;
                    
                    // Use text font size from appConfig if available
                    if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.bilingual) {
                        lineDiv.style.fontSize = appConfig.display.fonts.layouts.bilingual.text;
                    } else {
                        // Fallback to hardcoded value - 3x larger
                        lineDiv.style.fontSize = 'clamp(6rem, 15vw, 10.5rem)';
                    }
                    
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
                
                // Use heading font size from appConfig if available
                if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.hierarchical) {
                    lineDiv.style.fontSize = appConfig.display.fonts.layouts.hierarchical.heading;
                } else {
                    // Fallback to hardcoded value
                    lineDiv.style.fontSize = 'clamp(3rem, 7vw, 5rem)';
                }
                
                lineDiv.style.marginBottom = '1.5rem';
                lineDiv.style.letterSpacing = '5px';
                lineDiv.style.fontWeight = 'bold';
            }
            // Names
            else {
                lineDiv.style.color = colorPalette.white; // White for names
                
                // Use text font size from appConfig if available
                if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.hierarchical) {
                    lineDiv.style.fontSize = appConfig.display.fonts.layouts.hierarchical.text;
                } else {
                    // Fallback to hardcoded value
                    lineDiv.style.fontSize = 'clamp(2.5rem, 6vw, 4rem)';
                }
                
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
        
        // Use nameFirst font size from appConfig if available
        if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.firstnameLastname) {
            firstNameDiv.style.fontSize = appConfig.display.fonts.layouts.firstnameLastname.nameFirst;
        } else {
            // Fallback to hardcoded value
            firstNameDiv.style.fontSize = 'clamp(5rem, 12vw, 10rem)';
        }
        
        // Last name below, larger
        const lastNameDiv = document.createElement('div');
        lastNameDiv.classList.add('name-last');
        lastNameDiv.textContent = lines[1];
        
        // Use nameLast font size from appConfig if available
        if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts.firstnameLastname) {
            lastNameDiv.style.fontSize = appConfig.display.fonts.layouts.firstnameLastname.nameLast;
        } else {
            // Fallback to hardcoded value
            lastNameDiv.style.fontSize = 'clamp(5rem, 12vw, 10rem)';
        }
        
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

// Function to show grid or row layout - multiple people in a more organized layout
function showGridLayout(timeline, creditsInput, layout = "grid") {
    const creditsContainer = document.querySelector('.credits-container');
    
    // Clear the container first
    creditsContainer.innerHTML = '';
    
    // Handle both cases:
    // 1. Passing an array of credits directly
    // 2. Passing an object with a credits property
    let credits = [];
    if (Array.isArray(creditsInput)) {
        credits = creditsInput;
    } else if (creditsInput && creditsInput.credits) {
        credits = creditsInput.credits;
    }
    
    if (!credits.length) {
        console.error("No credits provided for grid layout");
        return timeline;
    }
    
    console.log(`Displaying ${credits.length} credits in ${layout} layout`);
    
    // Create simple wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('credits-wrapper');
    wrapper.style.position = 'absolute';
    wrapper.style.width = '90%';
    wrapper.style.maxWidth = '1200px';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    
    if (layout === "row") {
        // Create row layout - simple column flex
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.gap = '40px';
        
        // Add credits to row layout
        credits.forEach(credit => {
            const creditEl = createCreditElement(credit, "row");
            wrapper.appendChild(creditEl);
        });
    } else {
        // Create grid layout - use specific grid settings
        wrapper.style.display = 'grid';
        
        // Calculate grid dimensions based on number of credits
        const totalCredits = credits.length;
        let columns, rows;
        
        if (totalCredits <= 4) {
            // 2x2 layout for 4 or fewer names
            columns = 2;
            rows = 2;
        } else if (totalCredits === 6) {
            // 3x2 layout for exactly 6 names
            columns = 3;
            rows = 2;
        } else {
            // Fallback for other counts (shouldn't happen with our data)
            columns = Math.min(3, totalCredits);
            rows = Math.ceil(totalCredits / columns);
        }
        
        // Set explicit grid template
        wrapper.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        wrapper.style.gridTemplateRows = `repeat(${rows}, auto)`;
        wrapper.style.gap = '40px 60px';
        wrapper.style.justifyItems = 'center';
        wrapper.style.alignItems = 'start';
    }
    
    // Add the wrapper to the container
    creditsContainer.appendChild(wrapper);
    
    // Add credits to the layout
    if (layout === "grid") {
        credits.forEach((credit, index) => {
            const creditEl = createCreditElement(credit, "grid");
            wrapper.appendChild(creditEl);
        });
    }
    
    // Helper function to create credit element
    function createCreditElement(credit, layoutType) {
        const el = document.createElement('div');
        el.classList.add('credit', `${layoutType}-item`);
        
        // Split name for better display
        const splitName = splitNameIntoLines(credit.name);
        const nameParts = splitName.split('\n');
        
        // Create a div for just the name part
        const nameContainer = document.createElement('div');
        nameContainer.style.display = 'flex';
        nameContainer.style.flexDirection = 'column';
        nameContainer.style.alignItems = 'center';
        
        if (nameParts.length === 2) {
            const firstNameEl = document.createElement('div');
            firstNameEl.classList.add('name-first');
            firstNameEl.textContent = nameParts[0];
            
            // Use nameFirst font size from appConfig if available
            if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts[layoutType]) {
                firstNameEl.style.fontSize = appConfig.display.fonts.layouts[layoutType].nameFirst;
            } else {
                // Fallback to hardcoded value - made bigger
                firstNameEl.style.fontSize = 'clamp(3.5rem, 8vw, 6rem)';
            }
            
            const lastNameEl = document.createElement('div');
            lastNameEl.classList.add('name-last');
            lastNameEl.textContent = nameParts[1];
            
            // Use nameLast font size from appConfig if available
            if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts[layoutType]) {
                lastNameEl.style.fontSize = appConfig.display.fonts.layouts[layoutType].nameLast;
            } else {
                // Fallback to hardcoded value - made bigger
                lastNameEl.style.fontSize = 'clamp(3.5rem, 8vw, 6rem)';
            }
            
            nameContainer.appendChild(firstNameEl);
            nameContainer.appendChild(lastNameEl);
        } else {
            // Single line name
            const nameEl = document.createElement('div');
            nameEl.textContent = credit.name;
            
            // Use nameFirst font size from appConfig if available (for single line)
            if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts[layoutType]) {
                nameEl.style.fontSize = appConfig.display.fonts.layouts[layoutType].nameFirst;
            } else {
                // Fallback to hardcoded value - made bigger
                nameEl.style.fontSize = 'clamp(3.5rem, 8vw, 6rem)';
            }
            
            nameEl.style.fontWeight = 'bold';
            nameContainer.appendChild(nameEl);
        }
        
        // Add the name container to the credit element
        el.appendChild(nameContainer);
        
        // Use white color for all grid/row items
        el.style.color = "#FFFFFF";
        
        // Add description if available
        if (credit.description) {
            const descEl = document.createElement('div');
            descEl.classList.add('credit-description');
            descEl.textContent = limitDescriptionWords(credit.description);
            
            // Use description font size from appConfig if available
            if (appConfig && appConfig.display && appConfig.display.fonts && appConfig.display.fonts.layouts && appConfig.display.fonts.layouts[layoutType]) {
                descEl.style.fontSize = appConfig.display.fonts.layouts[layoutType].description;
            } else {
                // Fallback to hardcoded value - made bigger
                descEl.style.fontSize = 'clamp(1.2rem, 2.5vw, 2rem)';
            }
            
            descEl.style.marginTop = '15px';
            descEl.style.opacity = '0.9';
            
            // Add description below the name
            el.appendChild(descEl);
        }
        
        return el;
    }
    
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
    console.log("Showing end scene");
    
    // Remove any existing end scene
    const existingEndScene = document.querySelector('.end-scene');
    if (existingEndScene) {
        existingEndScene.remove();
    }
    
    // Create end scene container
    const endScene = document.createElement('div');
    endScene.classList.add('end-scene');
    endScene.style.position = 'fixed'; // Changed from absolute to fixed
    endScene.style.top = '0';
    endScene.style.left = '0';
    endScene.style.width = '100%';
    endScene.style.height = '100%';
    endScene.style.display = 'flex';
    endScene.style.flexDirection = 'column';
    endScene.style.alignItems = 'center';
    endScene.style.justifyContent = 'center';
    endScene.style.zIndex = '1000'; // Ensure it's above other elements
    endScene.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Add background color
    
    // Create main title
    const endTitle = document.createElement('h1');
    endTitle.textContent = 'ENTER THE VIBE';
    endTitle.style.fontSize = 'clamp(3rem, 10vw, 7rem)';
    endTitle.style.fontFamily = "'Anton', sans-serif";
    endTitle.style.color = '#33FF33';
    endTitle.style.textShadow = '0 0 10px rgba(51, 255, 51, 0.8)';
    endTitle.style.marginBottom = '1rem';
    endTitle.style.letterSpacing = '5px';
    endTitle.classList.add('electric');
    
    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.textContent = 'THANK YOU FOR WATCHING';
    subtitle.style.fontSize = '2rem';
    subtitle.style.fontFamily = "'Inter', sans-serif";
    subtitle.style.color = '#4495F1';
    subtitle.style.marginBottom = '3rem';
    
    // Add restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART';
    restartButton.style.padding = '12px 30px';
    restartButton.style.fontSize = '1.5rem';
    restartButton.style.fontFamily = "'Anton', sans-serif";
    restartButton.style.backgroundColor = 'transparent';
    restartButton.style.color = '#33FF33';
    restartButton.style.border = '2px solid #33FF33';
    restartButton.style.cursor = 'pointer';
    restartButton.style.transition = 'all 0.3s ease';
    restartButton.style.textShadow = '0 0 10px rgba(51, 255, 51, 0.8)';
    restartButton.style.boxShadow = '0 0 10px rgba(51, 255, 51, 0.8)';
    
    // Add hover effect for the button
    restartButton.onmouseover = function() {
        this.style.backgroundColor = 'rgba(51, 255, 51, 0.2)';
    };
    restartButton.onmouseout = function() {
        this.style.backgroundColor = 'transparent';
    };
    
    // Add event listener to restart button
    restartButton.addEventListener('click', function() {
        console.log("Restart button clicked");
        restartAnimation();
    });
    
    // Append elements
    endScene.appendChild(endTitle);
    endScene.appendChild(subtitle);
    endScene.appendChild(restartButton);
    
    // Add to body directly to ensure it's visible
    document.body.appendChild(endScene);
    
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
    
    gsap.from(restartButton, {
        y: -20,
        opacity: 0, 
        duration: 1,
        delay: 1.5
    });
} 

// Function to show a grid of logos
function showLogoGrid(timeline, credit) {
    const creditsContainer = document.querySelector('.credits-container');
    
    // Clear container
    creditsContainer.innerHTML = '';
    
    // Create a container for the logos
    const container = document.createElement('div');
    container.classList.add('logo-grid-container');
    container.style.width = '90%';
    container.style.height = '80%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    
    // Add a heading if provided
    if (credit.name) {
        const heading = document.createElement('h2');
        heading.textContent = credit.name;
        heading.style.color = 'white';
        heading.style.fontSize = 'clamp(2.5rem, 5vw, 4rem)';
        heading.style.marginBottom = '2rem';
        heading.style.textAlign = 'center';
        container.appendChild(heading);
    }
    
    // Create a grid for the logos
    const logoGrid = document.createElement('div');
    logoGrid.classList.add('logo-grid');
    logoGrid.style.display = 'grid';
    
    // Determine grid layout based on number of logos
    // Make sure logos property exists, use empty array as fallback
    const logos = credit.logos || [];
    const numLogos = logos.length;
    let columns = 3;
    
    if (numLogos <= 2) {
        columns = numLogos;
    } else if (numLogos <= 4) {
        columns = 2;
    } else if (numLogos <= 9) {
        columns = 3;
                } else {
        columns = 4;
    }
    
    logoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    logoGrid.style.gap = '2rem';
    logoGrid.style.width = '100%';
    logoGrid.style.justifyItems = 'center';
    logoGrid.style.alignItems = 'center';
    
    // Check if logos exist before trying to iterate
    if (numLogos > 0) {
        // Add logos to the grid
        logos.forEach(logoPath => {
            const logoContainer = document.createElement('div');
            logoContainer.classList.add('logo-container');
            logoContainer.style.width = '100%';
            logoContainer.style.height = '100%';
            logoContainer.style.display = 'flex';
            logoContainer.style.alignItems = 'center';
            logoContainer.style.justifyContent = 'center';
            
            const logo = document.createElement('img');
            logo.src = logoPath;
            logo.alt = 'Logo';
            logo.style.maxWidth = '100%';
            logo.style.maxHeight = '100px';
            logo.style.objectFit = 'contain';
            logo.style.filter = 'brightness(0) invert(1)'; // Make it white
            
            logoContainer.appendChild(logo);
            logoGrid.appendChild(logoContainer);
        });
    } else {
        console.warn('No logos provided for logo grid layout');
        
        // Add a placeholder message
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Logo Grid (Logos not specified)';
        placeholder.style.color = 'white';
        placeholder.style.fontSize = '2rem';
        placeholder.style.opacity = '0.7';
        logoGrid.appendChild(placeholder);
    }
    
    container.appendChild(logoGrid);
    creditsContainer.appendChild(container);
    
    // Set visible immediately
    gsap.set(container, { opacity: 1 });
    
    return timeline;
}

// Function to show a fullscreen logo
function showFullscreenLogo(timeline, credit) {
    const creditsContainer = document.querySelector('.credits-container');
    
    // Clear container
    creditsContainer.innerHTML = '';
    
    // Create a container for the logo
    const container = document.createElement('div');
    container.classList.add('fullscreen-logo-container');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    
    // Check if logo exists
    if (credit.logo) {
        // Add the logo
        const logo = document.createElement('img');
        logo.src = credit.logo;
        logo.alt = credit.name || 'Logo';
        logo.style.maxWidth = '70%';
        logo.style.maxHeight = '60vh';
        logo.style.objectFit = 'contain';
        logo.style.filter = 'brightness(0) invert(1)'; // Make it white
        
        container.appendChild(logo);
        
        // No company name or description - just the logo as requested
    } else {
        console.warn('No logo provided for fullscreen logo layout');
        
        // Add a placeholder message
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Fullscreen Logo (Logo not specified)';
        placeholder.style.color = 'white';
        placeholder.style.fontSize = '3rem';
        placeholder.style.opacity = '0.7';
        container.appendChild(placeholder);
    }
    
    creditsContainer.appendChild(container);
    
    // Set visible immediately
    gsap.set(container, { opacity: 1 });
    
    return timeline;
}

// Function to toggle control panel visibility
function toggleControlsVisibility() {
    const beatControls = document.getElementById('beat-controls');
    
    // Update React panel
    if (typeof window.updateHeroPanelVisibility === 'function') {
        window.updateHeroPanelVisibility(); // Toggle the React panel
    }
    
    // Toggle the original panel if it exists
    if (beatControls) {
        if (beatControls.style.display === 'none') {
            beatControls.style.display = 'block';
            if (toggleControlsBtn) {
                toggleControlsBtn.textContent = 'Hide Controls';
            }
            } else {
            beatControls.style.display = 'none';
            if (toggleControlsBtn) {
                toggleControlsBtn.textContent = 'Show Controls';
            }
        }
    }
}

// Initialize the React HeroPanel
function initHeroPanel() {
    // Only initialize if React and ReactDOM are available
    if (!window.React || !window.ReactDOM) {
        console.error('React or ReactDOM not available - cannot initialize HeroPanel');
        return;
    }
    
    // Give more time for Babel to transpile the JSX and make HeroPanel available
    const checkForHeroPanel = () => {
        if (!window.HeroPanel) {
            console.warn('HeroPanel component not available yet, waiting for Babel transpilation...');
            setTimeout(checkForHeroPanel, 500); // Increased timeout to ensure transpilation completes
            return;
        }
        
        console.log("Initializing HeroPanel with React", window.React.version);
        
        const root = document.getElementById('hero-panel-root');
        if (!root) {
            console.error('Hero panel root element not found');
            return;
        }
        
        let panelVisible = false; // Start with panel hidden
        let needsUpdate = true; // Always do initial render
        
        // Function to toggle panel visibility - exposed to window for keyboard shortcuts
        window.updateHeroPanelVisibility = function() {
            panelVisible = !panelVisible;
            needsUpdate = true;
            console.log("HeroPanel visibility toggled:", panelVisible);
        };
        
        // Function to request a panel update for beat detection
        window.requestHeroPanelUpdate = function() {
            needsUpdate = true;
        };
        
        // Function to handle frequency range change
        function handleFreqRangeChange(e) {
            // For HeroPanel integration, handle both direct value and event target
            const range = e.target ? e.target.value : e;
            
            console.log("Frequency range changed to:", range);
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
            
            // Reset the peak detection values when changing ranges
            resetPeakDetection();
            saveSettings();
            
            // Remove references to DOM elements that might not exist
            // Update the UI elements for frequency ranges
            // if (freqStartSlider) freqStartSlider.value = freqRangeStart;
            // if (freqStartValue) freqStartValue.textContent = freqRangeStart.toString();
            // if (freqEndSlider) freqEndSlider.value = freqRangeEnd;
            // if (freqEndValue) freqEndValue.textContent = freqRangeEnd.toString();
            
            // Flag for update
            if (typeof window.requestHeroPanelUpdate === 'function') {
                window.requestHeroPanelUpdate();
            }
        }
        
        // Function to render the Hero Panel
        function renderHeroPanel() {
            // Use actual values directly instead of reading from removed debug elements
            const beatEnergy = typeof signalEnergy === 'number' ? signalEnergy : 0;
            const cutoff = typeof peakCutoff === 'number' ? peakCutoff : 0;
            const beatsDetected = peakCount;
            
            // Set auto beats when toggled
            const setAutoBeats = (value) => {
                useFallbackBeats = value;
                
                if (useFallbackBeats) {
                    startFallbackBeatTimer();
                } else {
                    stopFallbackBeatTimer();
                }
                saveSettings();
                needsUpdate = true;
            };
            
            const props = {
                peakThreshold,
                setPeakThreshold: (value) => {
                    peakThreshold = value;
                    resetPeakDetection();
                    saveSettings();
                    needsUpdate = true;
                },
                noiseFloor,
                setNoiseFloor: (value) => {
                    noiseFloor = value;
                    resetPeakDetection();
                    saveSettings();
                    needsUpdate = true;
                },
                freqRangeStart,
                setFreqRangeStart: (value) => {
                    freqRangeStart = value;
                    // Ensure start is less than end
                    if (freqRangeStart >= freqRangeEnd) {
                        freqRangeStart = freqRangeEnd - 1;
                    }
                    resetPeakDetection();
                    saveSettings();
                    needsUpdate = true;
                },
                freqRangeEnd,
                setFreqRangeEnd: (value) => {
                    freqRangeEnd = value;
                    // Ensure end is greater than start
                    if (freqRangeEnd <= freqRangeStart) {
                        freqRangeEnd = freqRangeStart + 1;
                    }
                    resetPeakDetection();
                    saveSettings();
                    needsUpdate = true;
                },
                autoBeats: useFallbackBeats,
                setAutoBeats,
                beatInterval: fallbackBeatInterval,
                setBeatInterval: (value) => {
                    fallbackBeatInterval = value;
                    if (useFallbackBeats) {
                        startFallbackBeatTimer(); // Restart with new interval
                    }
                    saveSettings();
                    needsUpdate = true;
                },
                displayTime: minScreenDisplayTime,
                setDisplayTime: (value) => {
                    minScreenDisplayTime = value;
                    saveSettings();
                    needsUpdate = true;
                },
                beatEnergy,
                cutoff,
                beatsDetected,
                peakDetected, // Pass the peak detected state
                onRestart: restartAnimation,
                onReset: () => {
                    resetToDefaultSettings();
                    needsUpdate = true;
                },
                onShowEndScene: showEndScene, // Add function to show end scene
                handleFreqRangeChange,
                visible: panelVisible,
                toggleVisibility: () => {
                    panelVisible = !panelVisible;
                    needsUpdate = true;
                }
            };
            
            try {
                ReactDOM.render(
                    React.createElement(window.HeroPanel, props),
                    root
                );
                // Removed console.log to prevent spam
            } catch (error) {
                console.error("Error rendering HeroPanel:", error);
            }
        }
        
        // Do the initial render
        renderHeroPanel();
        
        // Add keyboard shortcut for showing/hiding the panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                window.updateHeroPanelVisibility();
            }
        });
        
        // Set up continuous panel updates using requestAnimationFrame for smoother updates
        function updatePanelLoop() {
            // Only re-render if the panel is visible and metrics have changed or panel needs update
            if (needsUpdate) {
                // Update the panel
                renderHeroPanel();
                
                // Reset the update flag
                needsUpdate = false;
            }
            
            // Request next frame for continuous updates
            requestAnimationFrame(updatePanelLoop);
        }
        
        // Start the continuous update loop
        updatePanelLoop();
        
        console.log("HeroPanel initialization complete");
    };
    
    // Start checking for HeroPanel component - give Babel time to transpile
    setTimeout(checkForHeroPanel, 100);
}

// -------------- BOTTOM CONTROL PANEL --------------
function initBottomControls() {
    const bottomControls = document.getElementById('bottom-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const equalizerBtn = document.getElementById('equalizer-btn');
    const heroPanelBtn = document.getElementById('hero-panel-btn');
    
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    
    if (!bottomControls || !playPauseBtn || !restartBtn || !equalizerBtn || !heroPanelBtn) {
        console.error('Bottom control panel elements not found');
        return;
    }
    
    let isPlaying = false;
    let equalizerVisible = true; // Start with equalizer visible
    let heroPanelVisible = false; // Start with hero panel hidden
    
    // Function to show the bottom controls (called when experience starts)
    function showBottomControls() {
        bottomControls.classList.remove('hidden');
        console.log('Bottom controls now visible');
    }
    
    // Function to hide the bottom controls
    function hideBottomControls() {
        bottomControls.classList.add('hidden');
    }
    
    // Function to update play/pause button state
    function updatePlayPauseButton() {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            playPauseBtn.classList.add('active');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playPauseBtn.classList.remove('active');
        }
    }
    
    // Function to update equalizer button state
    function updateEqualizerButton() {
        const canvas = document.getElementById('audio-visualizer');
        if (equalizerVisible) {
            equalizerBtn.classList.add('active');
            if (canvas) canvas.style.display = 'block';
        } else {
            equalizerBtn.classList.remove('active');
            if (canvas) canvas.style.display = 'none';
        }
    }
    
    // Function to update hero panel button state
    function updateHeroPanelButton() {
        if (heroPanelVisible) {
            heroPanelBtn.classList.add('active');
        } else {
            heroPanelBtn.classList.remove('active');
        }
    }
    
    // Function to setup audio event listeners (called when mainSound is available)
    function setupAudioListeners(audioElement) {
        if (!audioElement) return;
        
        audioElement.addEventListener('play', () => {
            isPlaying = true;
            updatePlayPauseButton();
        });
        
        audioElement.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayPauseButton();
        });
        
        audioElement.addEventListener('ended', () => {
            isPlaying = false;
            updatePlayPauseButton();
        });
    }
    
    // Play/Pause button functionality
    playPauseBtn.addEventListener('click', () => {
        const audio = mainSound || document.getElementById('main-sound');
        if (audio) {
            if (isPlaying) {
                // Pause the audio
                audio.pause();
                isPlaying = false;
                console.log('Audio paused');
            } else {
                // Resume the audio
                audio.play().then(() => {
                    isPlaying = true;
                    console.log('Audio resumed');
                }).catch(err => {
                    console.error('Error resuming audio:', err);
                });
            }
            updatePlayPauseButton();
        }
    });
    
    // Restart button functionality
    restartBtn.addEventListener('click', () => {
        console.log('Restart button clicked');
        restartAnimation();
    });
    
    // Equalizer toggle button functionality
    equalizerBtn.addEventListener('click', () => {
        equalizerVisible = !equalizerVisible;
        updateEqualizerButton();
        console.log('Equalizer visibility toggled:', equalizerVisible);
    });
    
    // Hero panel toggle button functionality
    heroPanelBtn.addEventListener('click', () => {
        heroPanelVisible = !heroPanelVisible;
        if (typeof window.updateHeroPanelVisibility === 'function') {
            window.updateHeroPanelVisibility();
        }
        updateHeroPanelButton();
        console.log('Hero panel visibility toggled:', heroPanelVisible);
    });
    
    // Setup audio listeners if mainSound is already available
    if (mainSound) {
        setupAudioListeners(mainSound);
    }
    
    // Initialize button states
    updatePlayPauseButton();
    updateEqualizerButton();
    updateHeroPanelButton();
    
    // Expose functions globally for external access
    window.showBottomControls = showBottomControls;
    window.hideBottomControls = hideBottomControls;
    window.updateBottomControlsPlayState = (playing) => {
        isPlaying = playing;
        updatePlayPauseButton();
    };
    window.setupBottomControlsAudioListeners = setupAudioListeners;
    
    console.log('Bottom control panel initialized');
}

// ... existing code ...