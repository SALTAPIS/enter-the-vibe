import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// -------------- CREDIT SEQUENCE DATA --------------
// Will store all credits loaded from JSON
let allCredits = [];

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
            ...creditsData.technology,
            ...creditsData.artists,
            ...creditsData.writers,
            ...creditsData.hackers,
            ...creditsData.creative,
            ...creditsData.special
        ];
        
        console.log(`Successfully loaded ${allCredits.length} credits`);
        
        // Store the special layouts and featured credits for easy access
        window.creditsData = creditsData;
        
        return creditsData;
    } catch (error) {
        console.error('Error loading credits:', error);
        // Fallback to empty arrays if loading fails
        return {
            technology: [],
            artists: [],
            writers: [],
            hackers: [],
            creative: [],
            special: [],
            layouts: {
                title: [],
                bilingual: [],
                hierarchical: [],
                firstname_lastname: []
            },
            featured: []
        };
    }
}

// Shuffle the credits array to make it random each time
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    }
    if (glitchSound) glitchSound.pause();
    if (transitionSound) transitionSound.pause();
    
    stopFallbackBeatTimer();
    
    // Remove any attached event listeners for beat detection
    window.removeEventListener('audiobeat', handleBeat);
    
    // Reset animation state
    gsap.killTweensOf("*"); // Kill all GSAP animations
    
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
    const currentTime = Date.now();
    const minScreenTime = 1500; // 1.5 seconds minimum per screen
    
    // Only advance if screen has been visible for at least the minimum time
    if (currentTime - lastScreenChangeTime >= minScreenTime) {
        console.log("Beat detected - advancing to next screen");
        showNextScreen();
    } else {
        console.log("Beat detected but ignoring (too soon)");
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

// -------------- MAIN INITIALIZATION --------------
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio elements
    const mainSound = document.getElementById('main-sound');
    const glitchSound = document.getElementById('glitch-sound');
    const transitionSound = document.getElementById('transition-sound');
    
    // Initialize UI elements
    const startButton = document.getElementById('start-button');
    const skipButton = document.getElementById('skip-button');
    const beatIndicator = document.getElementById('beat-indicator');
    
    // Set up event listeners
    skipButton.addEventListener('click', skipToPhase3);
    
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
    
    // Init phases
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    
    // -------------- PHASE 1: CREDITS SEQUENCE --------------
    function startPhase1() {
        console.log("Starting Phase 1: Credits Sequence");
        
        // Show cursor for 1 second
        const cursor = document.querySelector('.cursor');
        gsap.set(cursor, { display: 'block', top: '50%', left: '50%', xPercent: -50, yPercent: -50 });
        
        // Load credits data then play main sound and start animation
        loadCredits().then(() => {
            // Play main sound (if available)
            if (mainSound) mainSound.play().catch(e => console.log("Audio error:", e));
            
            // Timeline for cursor effect
            const cursorTimeline = gsap.timeline({
                onComplete: () => {
                    // Hide cursor and start credits
                    gsap.to(cursor, { duration: 0.3, opacity: 0, display: 'none' });
                    buildAndStartCreditsSequence();
                }
            });
            
            cursorTimeline
                .to(cursor, { duration: 0.1, opacity: 0, repeat: 6, yoyo: true })
                .to(cursor, { duration: 0.5, scale: 10, opacity: 0, ease: "power4.in" });
        }).catch(error => {
            console.error("Failed to load credits:", error);
            // Start anyway with whatever credits we have (might be empty)
            if (mainSound) mainSound.play().catch(e => console.log("Audio error:", e));
            
            const cursorTimeline = gsap.timeline({
                onComplete: () => {
                    gsap.to(cursor, { duration: 0.3, opacity: 0, display: 'none' });
                    buildAndStartCreditsSequence();
                }
            });
            
            cursorTimeline
                .to(cursor, { duration: 0.1, opacity: 0, repeat: 6, yoyo: true })
                .to(cursor, { duration: 0.5, scale: 10, opacity: 0, ease: "power4.in" });
        });
    }
    
    // New function to prepare and start the credits sequence
    function buildAndStartCreditsSequence() {
        console.log("Building credits sequence");
        
        // Get data from loaded JSON
        const creditsData = window.creditsData || {};
        
        // 1. Create simple featured single-name screens using the featured list from JSON
        const singleNameScreens = creditsData.featured || [
            { name: "ALAN TURING", description: "Computer Science Father", color: "#33FF33", category: "tech" },
            { name: "GRACE HOPPER", description: "Compiler Pioneer", color: "#4169E1", category: "tech" },
            { name: "ADA LOVELACE", description: "First Programmer", color: "#BA55D3", category: "tech" }
        ];
        
        // 2. Create multi-name packery screens (groups of 3-4 names)
        const regularCredits = shuffleArray([...allCredits.filter(credit => 
            !credit.layout && !singleNameScreens.some(s => s.name === credit.name)
        )]);
        
        const packeryScreens = [];
        for (let i = 0; i < regularCredits.length; i += 4) {
            const group = regularCredits.slice(i, Math.min(i + 4, regularCredits.length));
            if (group.length > 1) {
                packeryScreens.push(group);
            }
        }
        
        // 3. Get special layouts from JSON
        const specialLayouts = [];
        
        // Title layouts
        if (creditsData.layouts && creditsData.layouts.title) {
            specialLayouts.push(...creditsData.layouts.title);
        } else {
            // Fallback if JSON doesn't have the data
            specialLayouts.push(
                { name: "ENTER", color: "#FF6600", category: "title", layout: "title" },
                { name: "THE", color: "#FF6600", category: "title", layout: "title" },
                { name: "VIBE", color: "#FF6600", category: "title", layout: "title" }
            );
        }
        
        // Bilingual layouts
        if (creditsData.layouts && creditsData.layouts.bilingual) {
            specialLayouts.push(...creditsData.layouts.bilingual);
        }
        
        // Hierarchical layouts
        if (creditsData.layouts && creditsData.layouts.hierarchical) {
            specialLayouts.push(...creditsData.layouts.hierarchical);
        }
        
        // Firstname-lastname layouts
        if (creditsData.layouts && creditsData.layouts["firstname-lastname"]) {
            specialLayouts.push(...creditsData.layouts["firstname-lastname"]);
        }
        
        // Combine all screens and make sure we have at least 20
        let allScreens = [
            ...singleNameScreens,
            ...packeryScreens,
            ...specialLayouts
        ];
        
        // If we still don't have 20 screens, add more packery groups
        while (allScreens.length < 20) {
            const newGroup = shuffleArray([...regularCredits]).slice(0, 3);
            if (newGroup.length > 1) {
                allScreens.push(newGroup);
            }
        }
        
        // Shuffle but keep special layouts at the end
        const regularScreens = allScreens.filter(screen => 
            !Array.isArray(screen) && !screen.layout);
        const packeryGroupScreens = allScreens.filter(screen => 
            Array.isArray(screen));
        
        // Shuffle the regular and packery screens
        const shuffledRegular = shuffleArray([...regularScreens]);
        const shuffledPackery = shuffleArray([...packeryGroupScreens]);
        
        // Final sequence with Enter the Vibe screens at the end
        const titleScreens = specialLayouts.filter(screen => screen.layout === "title");
        const otherSpecialLayouts = specialLayouts.filter(screen => screen.layout !== "title");
        
        const finalSequence = [
            ...shuffledRegular,
            ...shuffledPackery,
            ...otherSpecialLayouts,
            ...titleScreens
        ];
        
        console.log(`Prepared ${finalSequence.length} credit screens`);
        
        // Now start the actual sequence
        playCreditsSequence(finalSequence);
    }
    
    // Function to play the credits sequence
    function playCreditsSequence(screens) {
        const creditsContainer = document.querySelector('.credits-container');
        const singleCreditContainer = document.querySelector('.single-credit-container');
        
        // Clear containers
        creditsContainer.innerHTML = '';
        singleCreditContainer.innerHTML = '';
        
        // Keep track of current screen index
        let currentScreenIndex = 0;
        let lastScreenChangeTime = Date.now();
        
        // Function to show the next screen
        const showNextScreen = () => {
            console.log(`Showing screen ${currentScreenIndex + 1} of ${screens.length}`);
            
            // Clear containers immediately
            creditsContainer.innerHTML = '';
            singleCreditContainer.innerHTML = '';
            
            // Check if we've reached the end of all screens
            if (currentScreenIndex >= screens.length) {
                console.log("End of credits sequence - transitioning to phase 2");
                transitionToPhase2();
                return;
            }
            
            const screen = screens[currentScreenIndex];
            const screenTimeline = gsap.timeline();
            
            // Handle different screen types immediately without animation
            if (Array.isArray(screen)) {
                // Packery layout with multiple names
                showPackeryGroup(screenTimeline, screen);
            } else if (screen.layout) {
                // Special layout screen
                showSpecialLayoutCredit(screenTimeline, screen);
            } else {
                // Single name screen
                showSingleName(screenTimeline, screen);
            }
            
            // Increment screen index for next time
            currentScreenIndex++;
            lastScreenChangeTime = Date.now();
        };
        
        // Beat detection event handler 
        const handleBeat = () => {
            const currentTime = Date.now();
            const minScreenTime = 1000; // 1 second minimum per screen (reduced from 1.5s)
            
            // Only advance if screen has been visible for at least the minimum time
            if (currentTime - lastScreenChangeTime >= minScreenTime) {
                console.log("Beat detected - advancing to next screen");
                showNextScreen();
            } else {
                console.log("Beat detected but ignoring (too soon)");
            }
        };
        
        // Add event listener for beat detection
        window.addEventListener('audiobeat', handleBeat);
        
        // Start with the first screen
        showNextScreen();
        
        // Fallback: if no beats detected for 5 seconds, advance anyway
        const checkForInactivity = () => {
            const currentTime = Date.now();
            const phase1 = document.getElementById('phase1');
            const isPhase1Active = phase1 && !phase1.classList.contains('hidden');
            
            if (isPhase1Active) {
                if (currentTime - lastScreenChangeTime >= 5000) {
                    console.log("No beats detected for 5s - auto-advancing");
                    showNextScreen();
                }
                // Continue checking while in phase 1
                setTimeout(checkForInactivity, 2000);
            } else {
                // Clean up event listener when phase 1 is done
                window.removeEventListener('audiobeat', handleBeat);
            }
        };
        
        setTimeout(checkForInactivity, 5000);
        
        // Return a simple timeline (no animations)
        return gsap.timeline();
    }
    
    // Function to show a single name
    function showSingleName(timeline, credit) {
        const singleCreditContainer = document.querySelector('.single-credit-container');
        
        // Clear the container
        singleCreditContainer.innerHTML = '';
        
        // Create the main credit element
        const creditEl = document.createElement('div');
        creditEl.classList.add('credit', 'single');
        creditEl.textContent = credit.name;
        creditEl.style.color = credit.color;
        
        // Add to container first (name at the top)
        singleCreditContainer.appendChild(creditEl);
        
        // Always add description below the name
        const descEl = document.createElement('div');
        descEl.classList.add('credit-description');
        // Use description or category if no description
        descEl.textContent = credit.description || credit.category.toUpperCase();
        descEl.style.top = '60%'; // Position below the name
        singleCreditContainer.appendChild(descEl);
        
        // Apply effects immediately without animation
        if (credit.category === 'tech') creditEl.classList.add('electric');
        else if (credit.category === 'creative') creditEl.classList.add('flicker');
        else if (credit.category === 'artist') creditEl.classList.add('electric');
        else if (credit.category === 'writer') creditEl.classList.add('flicker');
        else if (credit.category === 'hacker') creditEl.classList.add('flicker');
        else if (credit.category === 'special') {
            creditEl.classList.add('flicker');
        }
        
        // Play sound
        if (glitchSound) {
            glitchSound.currentTime = 0;
            glitchSound.play().catch(e => console.log("Audio error:", e));
        }
        
        // Set visibility immediately without animation
        gsap.set(creditEl, { opacity: 1, scale: 1 });
        gsap.set(descEl, { opacity: 1 });
        
        return timeline;
    }
    
    // Function to show a packery group of names
    function showPackeryGroup(timeline, credits) {
        const creditsContainer = document.querySelector('.credits-container');
        
        // Clear container
        creditsContainer.innerHTML = '';
        
        // Get container dimensions
        const containerWidth = creditsContainer.clientWidth;
        const containerHeight = creditsContainer.clientHeight;
        
        // Calculate optimal font size and positions
        const packeryLayout = calculatePackeryLayout(credits, containerWidth, containerHeight);
        
        // Create and position credit elements
        packeryLayout.forEach((item, i) => {
            const credit = credits[i];
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit');
            creditEl.textContent = credit.name;
            creditEl.dataset.category = credit.category;
            
            // Apply position and size from packery algorithm
            creditEl.style.left = `${item.x}px`;
            creditEl.style.top = `${item.y}px`;
            creditEl.style.width = `${item.width}px`;
            creditEl.style.fontSize = `${item.fontSize}px`;
            creditEl.style.color = credit.color;
            
            creditsContainer.appendChild(creditEl);
            
            // Add description if available
            if (credit.description) {
                const descEl = document.createElement('div');
                descEl.classList.add('credit-description', 'packery-description');
                descEl.textContent = credit.description;
                
                // Position the description below the name
                descEl.style.left = `${item.x}px`;
                descEl.style.top = `${item.y + item.fontSize * 1.2}px`;
                descEl.style.width = `${item.width}px`;
                
                creditsContainer.appendChild(descEl);
                
                // Set description opacity (no animation)
                gsap.set(descEl, { opacity: 1 });
            }
            
            // Apply effect immediately based on category
            if (credit.category === 'tech') creditEl.classList.add('electric');
            else if (credit.category === 'creative') creditEl.classList.add('flicker');
            else if (credit.category === 'artist') creditEl.classList.add('electric');
            else if (credit.category === 'writer') creditEl.classList.add('flicker');
            else if (credit.category === 'hacker') creditEl.classList.add('flicker');
            
            // Set visible immediately without animation
            gsap.set(creditEl, { opacity: 1, scale: 1 });
        });
        
        // Play glitch sound
        if (glitchSound) {
            glitchSound.currentTime = 0;
            glitchSound.play().catch(e => console.log("Audio error:", e));
        }
        
        return timeline;
    }
    
    function calculatePackeryLayout(items, containerWidth, containerHeight) {
        // Packery algorithm implementation
        const positions = [];
        const padding = 20; // Space between items
        
        // Calculate optimal font size based on number of items and container size
        const totalArea = containerWidth * containerHeight;
        const itemArea = totalArea / (items.length * 1.7); // Using more space for better readability
        
        items.forEach((item, index) => {
            const textLength = item.name.length;
            
            // Calculate font size - longer names get slightly smaller fonts
            const fontSize = Math.min(
                72,  // Maximum font size - increased for better visibility
                Math.max(
                    28,  // Minimum font size - increased for readability
                    Math.floor(Math.sqrt(itemArea) / Math.sqrt(textLength) * 0.9)
                )
            );
            
            // Estimate width based on text length and font size
            const width = (textLength * fontSize * 0.6) + padding;
            const height = fontSize * 1.2 + padding;
            
            // Find a position where this item doesn't overlap with existing items
            let x = Math.random() * (containerWidth - width);
            let y = Math.random() * (containerHeight - height);
            
            // Simple collision detection and repositioning
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                let collision = false;
                
                // Check for collisions with existing items
                for (const pos of positions) {
                    if (
                        x < pos.x + pos.width + padding &&
                        x + width + padding > pos.x &&
                        y < pos.y + pos.height + padding &&
                        y + height + padding > pos.y
                    ) {
                        collision = true;
                        break;
                    }
                }
                
                if (!collision) break;
                
                // Try a new random position
                x = Math.random() * (containerWidth - width);
                y = Math.random() * (containerHeight - height);
                attempts++;
            }
            
            // Add the item to our layout
            positions.push({
                x,
                y,
                width,
                height,
                fontSize,
                index
            });
        });
        
        return positions;
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
    
    // Function to handle special layouts
    function showSpecialLayoutCredit(timeline, credit) {
        const creditsContainer = document.querySelector('.credits-container');
        const singleCreditContainer = document.querySelector('.single-credit-container');
        
        // Clear containers
        creditsContainer.innerHTML = '';
        singleCreditContainer.innerHTML = '';
        
        if (credit.layout === "title") {
            // Title layout (like "ENTER", "THE", "VIBE")
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'single', 'title');
            creditEl.textContent = credit.name;
            creditEl.style.color = credit.color;
            creditEl.style.fontSize = 'clamp(6rem, 20vw, 16rem)';
            creditEl.style.fontWeight = 'bold';
            
            singleCreditContainer.appendChild(creditEl);
            
            // Add flicker effect immediately
            creditEl.classList.add('flicker');
            
            // Set immediately visible
            gsap.set(creditEl, { opacity: 1, scale: 1 });
        }
        else if (credit.layout === "hierarchical") {
            // Hierarchical layout with roles and names
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'hierarchical');
            
            // Parse the hierarchical text
            const lines = credit.name.split('\n');
            let htmlContent = '';
            
            lines.forEach((line, index) => {
                // Every even line is a role (colored), every odd line is a name (white)
                const isRole = index % 2 === 0;
                const textColor = isRole ? credit.color : 'white';
                htmlContent += `<div style="color: ${textColor}; margin-bottom: ${isRole ? '10px' : '25px'}; font-size: ${isRole ? '2.5rem' : '3.5rem'}; font-weight: ${isRole ? 'normal' : 'bold'}; letter-spacing: ${isRole ? '2px' : '1px'}">${line}</div>`;
            });
            
            creditEl.innerHTML = htmlContent;
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            // Apply effects immediately
            const roleElements = creditEl.querySelectorAll('div');
            roleElements.forEach(el => {
                if (el.style.color === credit.color) {
                    el.classList.add('electric');
                } else {
                    el.classList.add('flicker');
                }
            });
            
            // Set immediately visible
            gsap.set(creditEl, { opacity: 1, scale: 1 });
        }
        else if (credit.layout === "bilingual") {
            // Bilingual layout with Japanese/Chinese/Russian + English
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'bilingual');
            
            // Parse the bilingual text
            const lines = credit.name.split('\n');
            let htmlContent = '';
            
            // Apply specific font for each language
            let fontFamily = 'sans-serif';
            if (credit.language === 'japanese') {
                fontFamily = "'Noto Sans JP', sans-serif";
            } else if (credit.language === 'chinese') {
                fontFamily = "'Noto Sans SC', sans-serif";
            } else if (credit.language === 'russian') {
                fontFamily = "'Noto Sans', sans-serif";
            }
            
            lines.forEach((line, index) => {
                // Every even line is a header (colored), others are names
                const isHeader = index % 3 === 0;
                const hasDot = line.includes('•');
                
                if (isHeader) {
                    htmlContent += `<div style="color: ${credit.color}; margin-bottom: 15px; font-size: 2.5rem; font-family: ${fontFamily}; letter-spacing: 2px; font-weight: bold;">${line}</div>`;
                } else if (hasDot) {
                    const [foreign, english] = line.split('•');
                    htmlContent += `<div style="color: white; margin-bottom: 25px; font-size: 3.5rem">
                        <span style="font-family: ${fontFamily}; font-weight: bold;">${foreign.trim()}</span>
                        <span style="color: ${credit.color}; margin: 0 15px; opacity: 0.8;">•</span>
                        <span style="letter-spacing: 1px;">${english.trim()}</span>
                    </div>`;
                } else {
                    htmlContent += `<div style="color: white; margin-bottom: 25px; font-size: 3.5rem; font-family: ${fontFamily}; letter-spacing: 1px;">${line}</div>`;
                }
            });
            
            creditEl.innerHTML = htmlContent;
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            // Apply effects immediately
            const headerElements = creditEl.querySelectorAll(`div[style*="color: ${credit.color}"]`);
            headerElements.forEach(el => {
                el.classList.add('electric');
            });
            
            // Set immediately visible
            gsap.set(creditEl, { opacity: 1, scale: 1 });
        }
        else if (credit.layout === "firstname-lastname") {
            // First name above last name layout
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'firstname-lastname');
            
            // Parse the name parts
            const [firstName, lastName] = credit.name.split('\n');
            
            if (credit.effect === "neon") {
                // Neon effect with outline
                creditEl.innerHTML = `
                    <div style="font-size: 2.5rem; margin-bottom: 0px;">${firstName}</div>
                    <div style="font-size: 5.5rem; text-shadow: 0 0 10px ${credit.outlineColor}, 0 0 20px ${credit.outlineColor};">${lastName}</div>
                `;
                creditEl.style.color = credit.color;
                creditEl.classList.add('electric');
            } else {
                // Regular styling
                creditEl.innerHTML = `
                    <div style="font-size: 2.5rem; margin-bottom: 0px;">${firstName}</div>
                    <div style="font-size: 5.5rem;">${lastName}</div>
                `;
                creditEl.style.color = credit.color;
                creditEl.classList.add('flicker');
            }
            
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            // Set immediately visible
            gsap.set(creditEl, { opacity: 1, scale: 1 });
        }
    }
}); 