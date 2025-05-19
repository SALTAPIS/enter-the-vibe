import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// -------------- CREDIT SEQUENCE DATA --------------
// Process all names from credits-list.md
const allCredits = [
    // Technology Pioneers
    { name: "ALAN TURING", description: "Computer Science Father", color: "#33FF33", category: "tech" },
    { name: "GRACE HOPPER", description: "Compiler Pioneer", color: "#4169E1", category: "tech" },
    { name: "JOHN McCARTHY", description: "AI Pioneer", color: "#228B22", category: "tech" },
    { name: "MARVIN MINSKY", description: "Neural Network Pioneer", color: "#FF6347", category: "tech" },
    { name: "MARGARET HAMILTON", description: "Apollo Software Director", color: "#9370DB", category: "tech" },
    { name: "JOHN VON NEUMANN", description: "Computer Architecture Pioneer", color: "#3CB371", category: "tech" },
    { name: "ADA LOVELACE", description: "First Programmer", color: "#BA55D3", category: "tech" },
    { name: "DOUGLAS ENGELBART", color: "#00BFFF", category: "tech" },
    { name: "TIM BERNERS-LEE", color: "#CD5C5C", category: "tech" },
    { name: "RICHARD STALLMAN", color: "#4682B4", category: "tech" },
    { name: "LINUS TORVALDS", color: "#FFD700", category: "tech" },
    { name: "DONALD KNUTH", color: "#FF8C00", category: "tech" },
    { name: "BARBARA LISKOV", color: "#FF69B4", category: "tech" },
    { name: "EDSGER DIJKSTRA", color: "#4682B4", category: "tech" },
    { name: "GEOFFREY HINTON", color: "#FF4500", category: "tech" },
    { name: "YANN LECUN", color: "#1E90FF", category: "tech" },
    { name: "YOSHUA BENGIO", color: "#FF00FF", category: "tech" },
    { name: "ANDREW NG", color: "#00FFFF", category: "tech" },
    { name: "IAN GOODFELLOW", color: "#ADFF2F", category: "tech" },
    { name: "DEMIS HASSABIS", color: "#ADFF2F", category: "tech" },
    { name: "ANDREJ KARPATHY", color: "#FF6347", category: "tech" },
    { name: "SAM ALTMAN", color: "#20B2AA", category: "tech" },
    { name: "DARIO AMODEI", color: "#9932CC", category: "tech" },
    { name: "JOHN CARMACK", color: "#FF8C00", category: "tech" },
    { name: "ILYA SUTSKEVER", color: "#4169E1", category: "tech" },
    { name: "JENSEN HUANG", color: "#FF6347", category: "tech" },
    { name: "CHRIS LATTNER", color: "#FF8C00", category: "tech" },
    { name: "BRENDAN EICH", color: "#F0E68C", category: "tech" },
    { name: "GUIDO VAN ROSSUM", color: "#4169E1", category: "tech" },
    { name: "NATALIE SILVANOVICH", color: "#FF69B4", category: "tech" },
    { name: "KATIE BOUMAN", color: "#BA55D3", category: "tech" },
    { name: "MEREDITH WHITTAKER", color: "#FF69B4", category: "tech" },
    { name: "TIMNIT GEBRU", color: "#20B2AA", category: "tech" },
    { name: "JOY BUOLAMWINI", color: "#FF00FF", category: "tech" },
    { name: "KYUNGHYUN CHO", color: "#4169E1", category: "tech" },
    { name: "ORIOL VINYALS", color: "#00FFFF", category: "tech" },
    { name: "FRANCESCA ROSSI", color: "#BA55D3", category: "tech" },
    { name: "ROMAN YAMPOLSKIY", color: "#4682B4", category: "tech" },
    { name: "MIRA MURATI", color: "#FF69B4", category: "tech" },
    { name: "JEFF DEAN", color: "#00BFFF", category: "tech" },
    { name: "MIGUEL WATTSON", color: "#33FF33", category: "tech" },
    { name: "KATHY SIERRA", color: "#FF69B4", category: "tech" },
    { name: "NATCHA ENGTRAKUL", color: "#9370DB", category: "tech" },
    { name: "SVEN BERGMANN", color: "#3CB371", category: "tech" },
    { name: "CLAUDE SHANNON", color: "#00BFFF", category: "tech" },
    { name: "SEYMOUR PAPERT", color: "#FF8C00", category: "tech" },
    { name: "SHIGERU MIYAMOTO", color: "#FF6347", category: "tech" },
    { name: "IVAN SUTHERLAND", color: "#4682B4", category: "tech" },
    { name: "VINTON CERF", color: "#00BFFF", category: "tech" },
    { name: "BOB KAHN", color: "#3CB371", category: "tech" },
    
    // Digital Artists & Designers
    { name: "NAM JUNE PAIK", color: "#FF1493", category: "artist" },
    { name: "STELARC", color: "#FF4500", category: "artist" },
    { name: "LAURIE ANDERSON", color: "#BA55D3", category: "artist" },
    { name: "ZACH LIEBERMAN", color: "#00FFFF", category: "artist" },
    { name: "CASEY REAS", color: "#4B0082", category: "artist" },
    { name: "BEN FRY", color: "#32CD32", category: "artist" },
    { name: "JOHN MAEDA", color: "#FF4500", category: "artist" },
    { name: "JOSHUA DAVIS", color: "#FF1493", category: "artist" },
    { name: "REFIK ANADOL", color: "#00FFFF", category: "artist" },
    { name: "SOUGWEN CHUNG", color: "#BA55D3", category: "artist" },
    { name: "TEAMLAB", color: "#7FFFD4", category: "artist" },
    { name: "MEMO AKTEN", color: "#FF4500", category: "artist" },
    { name: "MARIO KLINGEMANN", color: "#4B0082", category: "artist" },
    { name: "HELENA SARIN", color: "#FF1493", category: "artist" },
    { name: "SOPHIA CRESPO", color: "#00FFFF", category: "artist" },
    { name: "SCOTT DRAVES", color: "#FF4500", category: "artist" },
    { name: "GOLAN LEVIN", color: "#32CD32", category: "artist" },
    
    // Writers & Theorists
    { name: "WILLIAM GIBSON", color: "#00FF7F", category: "writer" },
    { name: "NEAL STEPHENSON", color: "#FFD700", category: "writer" },
    { name: "BRUCE STERLING", color: "#00FF7F", category: "writer" },
    { name: "PAT CADIGAN", color: "#FF69B4", category: "writer" },
    { name: "DONNA HARAWAY", color: "#FF69B4", category: "writer" },
    { name: "SHERRY TURKLE", color: "#BA55D3", category: "writer" },
    { name: "KATHERINE HAYLES", color: "#FF69B4", category: "writer" },
    { name: "MARSHALL MCLUHAN", color: "#87CEEB", category: "writer" },
    { name: "JEAN BAUDRILLARD", color: "#FFD700", category: "writer" },
    { name: "URSULA K. LE GUIN", color: "#DA70D6", category: "writer" },
    { name: "PHILIP K. DICK", color: "#00FF7F", category: "writer" },
    { name: "ISAAC ASIMOV", color: "#87CEEB", category: "writer" },
    { name: "OCTAVIA BUTLER", color: "#BA55D3", category: "writer" },
    { name: "TED CHIANG", color: "#00FF7F", category: "writer" },
    
    // Hackers & Security
    { name: "KEVIN MITNICK", color: "#FF4500", category: "hacker" },
    { name: "JOHN DRAPER", color: "#00BFFF", category: "hacker" },
    { name: "DAN KAMINSKY", color: "#3CB371", category: "hacker" },
    { name: "KATIE MOUSSOURIS", color: "#FF69B4", category: "hacker" },
    { name: "BRUCE SCHNEIER", color: "#4682B4", category: "hacker" },
    { name: "MARK ABENE", color: "#FF4500", category: "hacker" },
    { name: "AARON SWARTZ", color: "#32CD32", category: "hacker" },
    { name: "MOXIE MARLINSPIKE", color: "#4169E1", category: "hacker" },
    { name: "EDWARD SNOWDEN", color: "#B0C4DE", category: "hacker" },
    { name: "JULIAN ASSANGE", color: "#FFFFFF", category: "hacker" },
    { name: "CHELSEA MANNING", color: "#FF69B4", category: "hacker" },
    { name: "PHIL ZIMMERMANN", color: "#4682B4", category: "hacker" },
    
    // Film & Music Pioneers
    { name: "KRAFTWERK", color: "#FF0000", category: "creative" },
    { name: "BRIAN ENO", color: "#9370DB", category: "creative" },
    { name: "VANGELIS", color: "#00FFFF", category: "creative" },
    { name: "APHEX TWIN", color: "#FF4500", category: "creative" },
    { name: "DAFT PUNK", color: "#FFD700", category: "creative" },
    { name: "BJÖRK", color: "#FF69B4", category: "creative" },
    { name: "RIDLEY SCOTT", color: "#FFD700", category: "creative" },
    { name: "JAMES CAMERON", color: "#00BFFF", category: "creative" },
    { name: "DAVID CRONENBERG", color: "#FF0000", category: "creative" },
    { name: "STANLEY KUBRICK", color: "#FFFFFF", category: "creative" },
    { name: "GEORGE LUCAS", color: "#FFD700", category: "creative" },
    { name: "DENIS VILLENEUVE", color: "#B0C4DE", category: "creative" },
    { name: "ALEX GARLAND", color: "#32CD32", category: "creative" },
    { name: "MAMORU OSHII", color: "#00FFFF", category: "creative" },
    { name: "KATSUHIRO OTOMO", color: "#FF0000", category: "creative" },
    { name: "GASPAR NOÉ", color: "#FF00FF", category: "creative" },
    
    // Special closing credit
    { name: "GHOST IN THE MACHINE", color: "#FF0000", category: "special" },
    
    // Special credits (Enter the Void style)
    { name: "BUF COMPAGNIE", color: "#FF6600", category: "company", layout: "company" },
    { name: "ENTER", color: "#FF6600", category: "title", layout: "title" },
    { name: "THE VOID", color: "#FF6600", category: "title", layout: "title" },
    { 
        name: "POST PRODUCTION SUPERVISORS\nOLIVIER THERY-LAPINEY\nSUSANA ANTUNES\nASSISTED BY\nYANNICK BOUVEROT\nPRODUCTION ASSISTANT\nROMAIN RICHARD", 
        color: "#FF6600", 
        category: "credits", 
        layout: "hierarchical" 
    },
    { 
        name: "LOCATION CO-ORDINATORS\n島田 都良 • FUMIYOSHI SHIMADA\n原田 洋祐 • YOSUKE HARADA\nUNIT CO-ORDINATORS\n見寄 修蔵 • SHUZO MIYORI\n武田 祥 • SHO TAKEDA", 
        color: "#FF6600", 
        category: "credits", 
        layout: "bilingual" 
    },
    { 
        name: "Nicoletta\nMASSONE", 
        color: "#FF00FF", 
        category: "artist", 
        layout: "firstname-lastname" 
    },
    { 
        name: "masa\nKOKUBO", 
        color: "#FFFF00", 
        outlineColor: "#FF00FF", 
        category: "artist", 
        layout: "firstname-lastname",
        effect: "neon" 
    },
];

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

// -------------- MAIN INITIALIZATION --------------
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio elements
    const mainSound = document.getElementById('main-sound');
    const glitchSound = document.getElementById('glitch-sound');
    const transitionSound = document.getElementById('transition-sound');
    
    // Initialize skip button
    const skipButton = document.getElementById('skip-button');
    skipButton.addEventListener('click', skipToPhase3);
    
    // Init phases
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    
    // Start the sequence
    startPhase1();
    
    // -------------- PHASE 1: CREDITS SEQUENCE --------------
    function startPhase1() {
        console.log("Starting Phase 1: Credits Sequence");
        
        // Show cursor for 1 second
        const cursor = document.querySelector('.cursor');
        gsap.set(cursor, { display: 'block', top: '50%', left: '50%', xPercent: -50, yPercent: -50 });
        
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
    }
    
    // New function to prepare and start the credits sequence
    function buildAndStartCreditsSequence() {
        console.log("Building credits sequence");
        
        // 1. Create simple featured single-name screens
        const singleNameScreens = [
            { name: "ALAN TURING", description: "Computer Science Father", color: "#33FF33", category: "tech" },
            { name: "GRACE HOPPER", description: "Compiler Pioneer", color: "#4169E1", category: "tech" },
            { name: "ADA LOVELACE", description: "First Programmer", color: "#BA55D3", category: "tech" },
            { name: "TIM BERNERS-LEE", description: "World Wide Web Inventor", color: "#CD5C5C", category: "tech" },
            { name: "LINUS TORVALDS", description: "Linux Creator", color: "#FFD700", category: "tech" },
            { name: "WILLIAM GIBSON", description: "Cyberpunk Pioneer", color: "#00FF7F", category: "writer" },
            { name: "KRAFTWERK", description: "Electronic Music Pioneers", color: "#FF0000", category: "creative" },
            { name: "GHOST IN THE MACHINE", description: "Digital Consciousness", color: "#FF0000", category: "special" },
            { name: "NAM JUNE PAIK", description: "Video Art Pioneer", color: "#FF1493", category: "artist" },
            { name: "GASPAR NOÉ", description: "Visionary Director", color: "#FF00FF", category: "creative" }
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
        
        // 3. Add Enter the Void style special layouts
        const enterTheVoidScreens = [
            { name: "BUF COMPAGNIE", color: "#FF6600", category: "company", layout: "company" },
            { name: "ENTER", color: "#FF6600", category: "title", layout: "title" },
            { name: "THE VOID", color: "#FF6600", category: "title", layout: "title" },
            { 
                name: "POST PRODUCTION SUPERVISORS\nOLIVIER THERY-LAPINEY\nSUSANA ANTUNES\nASSISTED BY\nYANNICK BOUVEROT\nPRODUCTION ASSISTANT\nROMAIN RICHARD", 
                color: "#FF6600", 
                category: "credits", 
                layout: "hierarchical" 
            },
            { 
                name: "LOCATION CO-ORDINATORS\n島田 都良 • FUMIYOSHI SHIMADA\n原田 洋祐 • YOSUKE HARADA\nUNIT CO-ORDINATORS\n見寄 修蔵 • SHUZO MIYORI\n武田 祥 • SHO TAKEDA", 
                color: "#FF6600", 
                category: "credits", 
                layout: "bilingual" 
            },
            { 
                name: "Nicoletta\nMASSONE", 
                color: "#FF00FF", 
                category: "artist", 
                layout: "firstname-lastname" 
            },
            { 
                name: "masa\nKOKUBO", 
                color: "#FFFF00", 
                outlineColor: "#FF00FF", 
                category: "artist", 
                layout: "firstname-lastname",
                effect: "neon" 
            }
        ];
        
        // Combine all screens and make sure we have at least 20
        let allScreens = [
            ...singleNameScreens,
            ...packeryScreens,
            ...enterTheVoidScreens
        ];
        
        // If we still don't have 20 screens, add more packery groups
        while (allScreens.length < 20) {
            const newGroup = shuffleArray([...regularCredits]).slice(0, 3);
            if (newGroup.length > 1) {
                allScreens.push(newGroup);
            }
        }
        
        // Shuffle but keep Enter the Void screens at the end
        const regularScreens = allScreens.filter(screen => 
            !Array.isArray(screen) && !screen.layout);
        const packeryGroupScreens = allScreens.filter(screen => 
            Array.isArray(screen));
        
        // Shuffle the regular and packery screens
        const shuffledRegular = shuffleArray([...regularScreens]);
        const shuffledPackery = shuffleArray([...packeryGroupScreens]);
        
        // Final sequence with Enter the Void screens at the end
        const finalSequence = [
            ...shuffledRegular,
            ...shuffledPackery,
            ...enterTheVoidScreens
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
        
        // Create the main timeline
        const masterTimeline = gsap.timeline({
            onComplete: () => {
                transitionToPhase2();
            }
        });
        
        // Calculate timing to ensure at least 30 seconds total duration
        const minDuration = 30; // seconds
        const avgScreenDuration = 2; // average seconds per screen
        const baseDelay = Math.max(1.2, minDuration / screens.length);
        
        // Function to add screens to the timeline
        const addScreen = (index) => {
            if (index >= screens.length) {
                return; // End of sequence
            }
            
            const screen = screens[index];
            const screenTimeline = gsap.timeline();
            
            // Clear containers
            creditsContainer.innerHTML = '';
            singleCreditContainer.innerHTML = '';
            
            // Handle different screen types
            if (Array.isArray(screen)) {
                // Packery layout with multiple names
                showPackeryGroup(screenTimeline, screen);
            } else if (screen.layout) {
                // Special Enter the Void style screen
                showSpecialLayoutCredit(screenTimeline, screen);
            } else {
                // Single name screen
                showSingleName(screenTimeline, screen);
            }
            
            // Add this screen's timeline to the master timeline
            masterTimeline.add(screenTimeline);
            
            // Schedule the next screen
            masterTimeline.call(() => addScreen(index + 1), [], `+=${baseDelay}`);
        };
        
        // Start with the first screen
        addScreen(0);
    }
    
    // Function to show a single name
    function showSingleName(timeline, credit) {
        const singleCreditContainer = document.querySelector('.single-credit-container');
        
        // Create the main credit element
        const creditEl = document.createElement('div');
        creditEl.classList.add('credit', 'single');
        creditEl.textContent = credit.name;
        creditEl.style.color = credit.color;
        
        // Add description if available
        if (credit.description) {
            creditEl.classList.add('has-description');
            
            const descEl = document.createElement('div');
            descEl.classList.add('credit-description');
            descEl.textContent = credit.description;
            descEl.style.top = '60%';
            
            singleCreditContainer.appendChild(descEl);
        }
        
        singleCreditContainer.appendChild(creditEl);
        
        // Animation
        timeline
            .fromTo(creditEl,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.6, ease: "power1.out" }
            )
            .add(() => {
                // Apply effect based on category
                if (credit.category === 'tech') creditEl.classList.add('electric');
                else if (credit.category === 'creative') creditEl.classList.add('flicker');
                else if (credit.category === 'artist') creditEl.classList.add('electric');
                else if (credit.category === 'writer') creditEl.classList.add('flicker');
                else if (credit.category === 'hacker') creditEl.classList.add('glitch');
                else if (credit.category === 'special') {
                    creditEl.classList.add('glitch');
                    creditEl.classList.add('electric');
                }
                
                // Play sound
                if (glitchSound) {
                    glitchSound.currentTime = 0;
                    glitchSound.play().catch(e => console.log("Audio error:", e));
                }
            })
            .to(creditEl, { 
                opacity: 0, 
                scale: 0.8, 
                duration: 0.4, 
                ease: "power1.in" 
            }, "+=1.5");
            
        // If there's a description, animate it too
        if (credit.description) {
            const descEl = singleCreditContainer.querySelector('.credit-description');
            timeline
                .fromTo(descEl,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" },
                    "-=0.5"
                )
                .to(descEl, { 
                    opacity: 0, 
                    y: -20, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "-=0.4");
        }
        
        return timeline;
    }
    
    // Function to show a packery group of names
    function showPackeryGroup(timeline, credits) {
        const creditsContainer = document.querySelector('.credits-container');
        
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
            
            // Add animation to timeline
            timeline.fromTo(creditEl,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out" },
                i * 0.1
            );
            
            // Add effect based on category with delay
            timeline.add(() => {
                if (credit.category === 'tech') creditEl.classList.add('electric');
                else if (credit.category === 'creative') creditEl.classList.add('flicker');
                else if (credit.category === 'artist') creditEl.classList.add('electric');
                else if (credit.category === 'writer') creditEl.classList.add('flicker');
                else if (credit.category === 'hacker') creditEl.classList.add('glitch');
                
                // Remove effect after 1.5s
                gsap.delayedCall(1.5, () => {
                    creditEl.classList.remove('electric');
                    creditEl.classList.remove('flicker');
                    creditEl.classList.remove('glitch');
                });
            }, `-=0.3`);
        });
        
        // Play glitch sound
        timeline.call(() => {
            if (glitchSound) {
                glitchSound.currentTime = 0;
                glitchSound.play().catch(e => console.log("Audio error:", e));
            }
        }, null, 0);
        
        // After all credits are shown, keep them for a while, then fade out
        timeline.to('.credits-container .credit', {
            opacity: 0,
            scale: 0.8,
            stagger: 0.05,
            duration: 0.3,
            ease: "power1.in"
        }, `+=${Math.min(2.5, credits.length * 0.3)}`);
        
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
        
        // Hide phase 1, show phase 2
        gsap.to(phase1, { duration: 0.5, opacity: 0, display: 'none', onComplete: () => {
            phase1.classList.add('hidden');
            phase2.classList.remove('hidden');
            gsap.set(phase2, { display: 'block', opacity: 1 });
            startTitleSequence();
        }});
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
    
    // New function to handle special Enter the Void style layouts
    function showSpecialLayoutCredit(timeline, credit) {
        const creditsContainer = document.querySelector('.credits-container');
        const singleCreditContainer = document.querySelector('.single-credit-container');
        
        // Clear containers
        creditsContainer.innerHTML = '';
        singleCreditContainer.innerHTML = '';
        
        if (credit.layout === "company") {
            // Company layout (like "BUF COMPAGNIE")
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'single', 'company');
            creditEl.textContent = credit.name;
            creditEl.style.color = credit.color;
            creditEl.style.fontSize = 'clamp(5rem, 15vw, 14rem)';
            creditEl.style.fontWeight = 'bold';
            
            singleCreditContainer.appendChild(creditEl);
            
            timeline
                .fromTo(creditEl,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.6, ease: "power1.out" }
                )
                .to(creditEl, { 
                    opacity: 0, 
                    scale: 0.9, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "+=2");
        }
        else if (credit.layout === "title") {
            // Title layout (like "ENTER")
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'single', 'title');
            creditEl.textContent = credit.name;
            creditEl.style.color = credit.color;
            creditEl.style.fontSize = 'clamp(6rem, 20vw, 16rem)';
            creditEl.style.fontWeight = 'bold';
            
            singleCreditContainer.appendChild(creditEl);
            
            timeline
                .fromTo(creditEl,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.6, ease: "power1.out" }
                )
                .to(creditEl, { 
                    opacity: 0, 
                    scale: 0.9, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "+=2");
        }
        else if (credit.layout === "hierarchical") {
            // Hierarchical layout with roles and names
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'hierarchical');
            
            // Parse the hierarchical text
            const lines = credit.name.split('\n');
            let htmlContent = '';
            
            lines.forEach((line, index) => {
                // Every even line is a role (orange), every odd line is a name (white)
                const isRole = index % 2 === 0;
                const textColor = isRole ? credit.color : 'white';
                htmlContent += `<div style="color: ${textColor}; margin-bottom: 10px; font-size: ${isRole ? '1.8rem' : '2.5rem'}">${line}</div>`;
            });
            
            creditEl.innerHTML = htmlContent;
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            timeline
                .fromTo(creditEl,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.6, ease: "power1.out" }
                )
                .to(creditEl, { 
                    opacity: 0, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "+=3");
        }
        else if (credit.layout === "bilingual") {
            // Bilingual layout with Japanese + English
            const creditEl = document.createElement('div');
            creditEl.classList.add('credit', 'bilingual');
            
            // Parse the bilingual text
            const lines = credit.name.split('\n');
            let htmlContent = '';
            
            lines.forEach((line, index) => {
                // Every even line is a header (orange), others are names
                const isHeader = index % 3 === 0;
                const hasDot = line.includes('•');
                
                if (isHeader) {
                    htmlContent += `<div style="color: ${credit.color}; margin-bottom: 10px; font-size: 1.8rem">${line}</div>`;
                } else if (hasDot) {
                    const [japanese, english] = line.split('•');
                    htmlContent += `<div style="color: white; margin-bottom: 10px; font-size: 2.2rem">
                        <span style="font-family: 'Noto Sans JP', sans-serif;">${japanese.trim()}</span>
                        <span style="color: red; margin: 0 10px;">•</span>
                        <span>${english.trim()}</span>
                    </div>`;
                } else {
                    htmlContent += `<div style="color: white; margin-bottom: 10px; font-size: 2.2rem">${line}</div>`;
                }
            });
            
            creditEl.innerHTML = htmlContent;
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            timeline
                .fromTo(creditEl,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.6, ease: "power1.out" }
                )
                .to(creditEl, { 
                    opacity: 0, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "+=3");
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
                    <div style="font-size: 2rem; margin-bottom: -5px;">${firstName}</div>
                    <div style="font-size: 5rem; text-shadow: 0 0 10px ${credit.outlineColor}, 0 0 20px ${credit.outlineColor};">${lastName}</div>
                `;
                creditEl.style.color = credit.color;
                creditEl.classList.add('electric');
            } else {
                // Regular styling
                creditEl.innerHTML = `
                    <div style="font-size: 2rem; margin-bottom: -5px;">${firstName}</div>
                    <div style="font-size: 5rem;">${lastName}</div>
                `;
                creditEl.style.color = credit.color;
            }
            
            creditEl.style.textAlign = 'center';
            
            singleCreditContainer.appendChild(creditEl);
            
            timeline
                .fromTo(creditEl,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.6, ease: "power1.out" }
                )
                .to(creditEl, { 
                    opacity: 0, 
                    scale: 0.9, 
                    duration: 0.4, 
                    ease: "power1.in" 
                }, "+=2.5");
        }
    }
}); 