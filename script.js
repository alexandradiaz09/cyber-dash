<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Cyber Dash 3D</title>
    <!-- Tailwind CSS for UI styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Three.js CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        body {
            font-family: 'Orbitron', sans-serif;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #050508;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
        }

        #game-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        /* Neon Text Effects */
        .neon-text-cyan {
            color: #00f3ff;
            text-shadow: 0 0 5px #00f3ff, 0 0 10px #00f3ff, 0 0 20px #00f3ff;
        }
        .neon-text-pink {
            color: #ff007f;
            text-shadow: 0 0 5px #ff007f, 0 0 10px #ff007f, 0 0 20px #ff007f;
        }
        .neon-text-yellow {
            color: #ffdd00;
            text-shadow: 0 0 5px #ffdd00, 0 0 10px #ffdd00;
        }

        /* UI Glassmorphism */
        .glass-panel {
            background: rgba(10, 10, 26, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 243, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.15), inset 0 0 15px rgba(255, 0, 127, 0.1);
        }

        /* Animated Nitro Glow */
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px #00f3ff, inset 0 0 10px #00f3ff; }
            50% { box-shadow: 0 0 30px #ff007f, inset 0 0 20px #ff007f; }
        }
        .nitro-ready {
            animation: pulse-glow 1.2s infinite ease-in-out;
            border-color: #ff007f !important;
        }

        /* Speed Lines / Distortion Overlay */
        #speed-overlay {
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
    </style>
</head>
<body class="w-screen h-screen relative overflow-hidden bg-black text-white">

    <!-- 3D Canvas -->
    <canvas id="game-canvas"></canvas>

    <!-- Speed Distortion Overlay for Nitro Mode -->
    <div id="speed-overlay" class="absolute inset-0 z-10 opacity-0 transition-opacity duration-300 bg-radial from-transparent via-transparent to-pink-900/40 border-[12px] border-cyan-400/30 pointer-events-none"></div>

    <!-- HUD Overlay -->
    <div id="hud" class="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
        
        <!-- Top Stats Bar -->
        <div class="flex justify-between items-start w-full max-w-5xl mx-auto">
            <!-- Score & Multiplier -->
            <div class="glass-panel p-3 sm:p-4 rounded-xl flex flex-col gap-1 min-w-[140px] sm:min-w-[180px]">
                <span class="text-xs text-cyan-300 font-bold tracking-widest uppercase">Score</span>
                <span id="score-val" class="text-2xl sm:text-4xl font-black neon-text-cyan">00000</span>
                <div class="flex items-center justify-between mt-1 pt-1 border-t border-cyan-500/30">
                    <span class="text-[10px] text-gray-400 uppercase">Multiplier</span>
                    <span id="multiplier-val" class="text-sm font-bold neon-text-yellow">1x</span>
                </div>
            </div>

            <!-- Combo & High Score -->
            <div class="flex flex-col items-end gap-2">
                <div class="glass-panel px-4 py-2 rounded-xl text-right">
                    <span class="text-[10px] text-pink-400 uppercase tracking-wider block">BEST SCORE</span>
                    <span id="highscore-val" class="text-lg sm:text-xl font-bold neon-text-pink">0</span>
                </div>
                <div id="combo-box" class="glass-panel px-3 py-1.5 rounded-lg text-right opacity-0 transition-opacity duration-200">
                    <span id="combo-val" class="text-sm sm:text-base font-black text-yellow-400">5 COMBO!</span>
                </div>
            </div>
        </div>

        <!-- Bottom Speedometer & Boost Bar -->
        <div class="w-full max-w-xl mx-auto flex flex-col items-center gap-3">
            <!-- Speed Indicator -->
            <div class="flex items-center gap-2 bg-black/60 px-4 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md">
                <span class="text-xs text-cyan-400 tracking-widest">VELOCITY:</span>
                <span id="speed-val" class="text-sm font-bold text-white tracking-wider">120 KM/H</span>
            </div>

            <!-- Nitro Gauge -->
            <div class="w-full glass-panel p-2.5 rounded-2xl flex flex-col gap-1">
                <div class="flex justify-between text-xs font-bold px-1">
                    <span class="text-cyan-400 tracking-widest flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        NITRO BOOST
                    </span>
                    <span id="boost-status" class="text-gray-400 text-[10px] sm:text-xs">COLLECT ORBS [SPACE/TAP]</span>
                </div>
                <div class="w-full bg-gray-950/80 h-4 rounded-xl overflow-hidden p-0.5 border border-cyan-500/20 relative">
                    <div id="boost-bar" class="h-full w-0% bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400 rounded-lg transition-all duration-150"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Start / Intro Screen -->
    <div id="start-screen" class="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div class="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center gap-6 border-cyan-500/50">
            <div class="space-y-1">
                <h1 class="text-4xl sm:text-6xl font-black italic tracking-wider neon-text-cyan">CYBER DASH</h1>
                <p class="text-xs sm:text-sm text-pink-400 font-bold tracking-widest">NEON INFINITE RUNNER 3D</p>
            </div>

            <div class="w-full bg-cyan-950/30 p-4 rounded-xl border border-cyan-500/20 text-left text-xs sm:text-sm text-gray-300 space-y-2">
                <div class="flex items-center gap-3">
                    <span class="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 font-mono text-xs">A/D</span> or
                    <span class="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 font-mono text-xs">◄ / ►</span>
                    <span>Steer Left / Right (3 Lanes)</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 font-mono text-xs">W / ▲ / SPACE</span>
                    <span>Jump over laser barriers</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-2 py-1 bg-pink-500/20 border border-pink-400 rounded text-pink-300 font-mono text-xs">S / ▼ / SHIFT</span>
                    <span>Activate Nitro Boost when full</span>
                </div>
                <p class="text-[11px] text-gray-400 pt-1 border-t border-gray-700/50">
                    💡 Touch controls enabled for mobile: Tap Left/Right edges to steer, Swipe Up to jump, Double Tap for Nitro!
                </p>
            </div>

            <button id="start-btn" class="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-600 rounded-xl font-black text-lg sm:text-xl tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 cursor-pointer pointer-events-auto">
                INITIALIZE RUN
            </button>
        </div>
    </div>

    <!-- Game Over Screen -->
    <div id="game-over-screen" class="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 hidden">
        <div class="glass-panel max-w-md w-full p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center gap-5 border-pink-500/50">
            <div>
                <h2 class="text-3xl sm:text-5xl font-black neon-text-pink tracking-wider">SYSTEM CRASH</h2>
                <p class="text-xs text-gray-400 tracking-widest mt-1">RUN TERMINATED</p>
            </div>

            <!-- High Score New Alert -->
            <div id="new-high-score-tag" class="hidden px-3 py-1 bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs font-bold rounded-full animate-bounce">
                🎉 NEW HIGH SCORE!
            </div>

            <div class="w-full bg-black/40 p-4 rounded-xl border border-gray-800 space-y-3 text-left">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">FINAL SCORE:</span>
                    <span id="final-score" class="text-xl font-bold neon-text-cyan">0</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">BEST SCORE:</span>
                    <span id="final-highscore" class="text-lg font-bold text-gray-200">0</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">MAX COMBO:</span>
                    <span id="final-combo" class="text-base font-bold text-yellow-400">0x</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">ORBS COLLECTED:</span>
                    <span id="final-orbs" class="text-base font-bold text-pink-400">0</span>
                </div>
            </div>

            <button id="restart-btn" class="w-full py-4 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 rounded-xl font-black text-lg tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/30 cursor-pointer pointer-events-auto">
                REBOOT RUN
            </button>
        </div>
    </div>

    <!-- Main Game Logic script -->
    <script>
        // ==========================================
        // SYNTHWAVE AUDIO SYNTHESIZER (Web Audio API)
        // ==========================================
        class SoundSystem {
            constructor() {
                this.ctx = null;
                this.isMuted = false;
                this.isPlayingMusic = false;
                this.synthInterval = null;
                this.step = 0;
            }

            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            playTone(freq, type, duration, vol = 0.1, slideTo = null) {
                if (!this.ctx || this.isMuted) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    if (slideTo) {
                        osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
                    }

                    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch(e) {}
            }

            playJump() {
                this.playTone(150, 'sine', 0.25, 0.15, 600);
            }

            playCollect() {
                this.playTone(523.25, 'triangle', 0.1, 0.12, 1046.50); // C5 to C6
            }

            playCrash() {
                if (!this.ctx || this.isMuted) return;
                try {
                    // Noise buffer for crash explosion
                    const bufferSize = this.ctx.sampleRate * 0.4;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const output = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = Math.random() * 2 - 1;
                    }

                    const whiteNoise = this.ctx.createBufferSource();
                    whiteNoise.buffer = buffer;

                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
                    filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.4);

                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

                    whiteNoise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);

                    whiteNoise.start();
                    whiteNoise.stop(this.ctx.currentTime + 0.4);
                } catch(e) {}
            }

            playBoost() {
                this.playTone(200, 'sawtooth', 0.6, 0.2, 800);
            }

            startMusic() {
                if (this.isPlayingMusic) return;
                this.init();
                this.isPlayingMusic = true;

                // Synthwave Bassline frequencies (A minor synthwave loop)
                const bassNotes = [110, 110, 220, 110, 130.81, 110, 146.83, 123.47]; 
                
                this.synthInterval = setInterval(() => {
                    if (!this.isPlayingMusic || this.isMuted) return;
                    
                    // Bass pulse
                    const note = bassNotes[this.step % bassNotes.length];
                    this.playTone(note, 'sawtooth', 0.15, 0.05);

                    // Hi-hat noise hit on offbeats
                    if (this.step % 2 === 1) {
                        this.playTone(8000, 'square', 0.03, 0.015);
                    }

                    this.step++;
                }, 130); // ~115 BPM rhythm
            }

            stopMusic() {
                this.isPlayingMusic = false;
                if (this.synthInterval) clearInterval(this.synthInterval);
            }
        }

        const audio = new SoundSystem();

        // ==========================================
        // GAME ENGINE & THREE.JS SETUP
        // ==========================================
        const LANES = [-3.5, 0, 3.5];
        const LANE_COUNT = 3;
        
        let scene, camera, renderer;
        let playerGroup, playerMesh, playerTrailParticles = [];
        let gridMesh, horizonSun;
        let obstacles = [], collectibles = [], particleEffects = [];

        // Game State Variables
        let isGameRunning = false;
        let currentLane = 1; // 0: Left, 1: Center, 2: Right
        let targetX = LANES[1];
        let playerY = 0.6;
        let jumpVelocity = 0;
        let isJumping = false;
        const GRAVITY = -32;
        const JUMP_IMPULSE = 11;

        let baseSpeed = 22;
        let currentSpeed = baseSpeed;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('cyberdash_highscore') || '0');
        let multiplier = 1;
        let comboCount = 0;
        let collectedOrbsCount = 0;

        let boostMeter = 0; // 0 to 100
        let isBoostActive = false;
        let boostTimer = 0;

        let spawnTimer = 0;
        let collectibleTimer = 0;

        // UI Element References
        const scoreValEl = document.getElementById('score-val');
        const highscoreValEl = document.getElementById('highscore-val');
        const multiplierValEl = document.getElementById('multiplier-val');
        const speedValEl = document.getElementById('speed-val');
        const boostBarEl = document.getElementById('boost-bar');
        const boostStatusEl = document.getElementById('boost-status');
        const comboValEl = document.getElementById('combo-val');
        const comboBoxEl = document.getElementById('combo-box');
        const speedOverlayEl = document.getElementById('speed-overlay');

        const startScreenEl = document.getElementById('start-screen');
        const gameOverScreenEl = document.getElementById('game-over-screen');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');

        highscoreValEl.innerText = highScore;

        // Initialize Three.js Scene
        function initScene() {
            const canvas = document.getElementById('game-canvas');
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x050510, 0.018);

            camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 3.2, 7.5);
            camera.rotation.x = -0.22;

            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
            dirLight.position.set(0, 20, -10);
            scene.add(dirLight);

            const pinkPointLight = new THREE.PointLight(0xff007f, 2, 30);
            pinkPointLight.position.set(0, 5, 2);
            scene.add(pinkPointLight);

            // Create Grid & Sun World
            createEnvironment();

            // Create Player Vehicle / Sphere
            createPlayer();

            // Window Resize Listener
            window.addEventListener('resize', onWindowResize);
        }

        // Environment Creation (Synthwave Sunset & Glowing Grid Floor)
        function createEnvironment() {
            // Infinite Grid Canvas Texture Creation
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#050512';
            ctx.fillRect(0, 0, 512, 512);

            // Neon cyan grid lines
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 8;

            const step = 64;
            for (let i = 0; i <= 512; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 512);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(512, i);
                ctx.stroke();
            }

            const gridTexture = new THREE.CanvasTexture(canvas);
            gridTexture.wrapS = THREE.RepeatWrapping;
            gridTexture.wrapT = THREE.RepeatWrapping;
            gridTexture.repeat.set(8, 40);

            const gridGeo = new THREE.PlaneGeometry(60, 400);
            const gridMat = new THREE.MeshBasicMaterial({
                map: gridTexture,
                transparent: true,
                opacity: 0.9
            });

            gridMesh = new THREE.Mesh(gridGeo, gridMat);
            gridMesh.rotation.x = -Math.PI / 2;
            gridMesh.position.set(0, 0, -180);
            scene.add(gridMesh);

            // Horizon Synthwave Sun (Gradient Sphere with rings effect)
            const sunCanvas = document.createElement('canvas');
            sunCanvas.width = 256;
            sunCanvas.height = 256;
            const sCtx = sunCanvas.getContext('2d');
            const gradient = sCtx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, '#ffdd00');
            gradient.addColorStop(0.5, '#ff007f');
            gradient.addColorStop(1, '#1a0033');
            sCtx.fillStyle = gradient;
            sCtx.fillRect(0, 0, 256, 256);

            // Sun horizontal grid cut lines
            sCtx.fillStyle = '#050510';
            for (let y = 140; y < 256; y += 12) {
                sCtx.fillRect(0, y, 256, 4);
            }

            const sunTexture = new THREE.CanvasTexture(sunCanvas);
            const sunGeo = new THREE.CircleGeometry(28, 32);
            const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture, side: THREE.DoubleSide });
            horizonSun = new THREE.Mesh(sunGeo, sunMat);
            horizonSun.position.set(0, 16, -220);
            scene.add(horizonSun);
        }

        // Player Ship / Sphere Creation
        function createPlayer() {
            playerGroup = new THREE.Group();

            // Core Metallic Glowing Sphere Player
            const sphereGeo = new THREE.SphereGeometry(0.65, 32, 32);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: 0x00f3ff,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x00a8ff,
                emissiveIntensity: 0.6
            });
            playerMesh = new THREE.Mesh(sphereGeo, sphereMat);
            playerGroup.add(playerMesh);

            // Outer Sci-Fi Ring Orbiting Player
            const ringGeo = new THREE.TorusGeometry(0.9, 0.04, 16, 50);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.name = 'outerRing';
            ringMesh.rotation.x = Math.PI / 3;
            playerGroup.add(ringMesh);

            playerGroup.position.set(LANES[currentLane], playerY, 0);
            scene.add(playerGroup);
        }

        // ==========================================
        // PROCEDURAL OBSTACLE & COLLECTIBLE SPAWNING
        // ==========================================
        function spawnObstacle() {
            const laneIndex = Math.floor(Math.random() * LANE_COUNT);
            const laneX = LANES[laneIndex];
            const spawnZ = -180;

            const typeRand = Math.random();
            let obstacleMesh;

            if (typeRand < 0.6) {
                // Neon Red Cube / Block
                const geo = new THREE.BoxGeometry(1.8, 1.4, 1.8);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0xff0044,
                    emissive: 0xff0044,
                    emissiveIntensity: 0.8,
                    roughness: 0.3
                });
                obstacleMesh = new THREE.Mesh(geo, mat);
                obstacleMesh.position.set(laneX, 0.7, spawnZ);
                obstacleMesh.userData = { type: 'block', lane: laneIndex };
            } else {
                // Laser Barrier (Spans lane, requires jump)
                const geo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 16);
                geo.rotateZ(Math.PI / 2);
                const mat = new THREE.MeshBasicMaterial({ color: 0xff007f });
                obstacleMesh = new THREE.Mesh(geo, mat);

                // Side glowing posts
                const postGeo = new THREE.BoxGeometry(0.3, 1.8, 0.3);
                const postMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
                const leftPost = new THREE.Mesh(postGeo, postMat);
                const rightPost = new THREE.Mesh(postGeo, postMat);
                leftPost.position.set(-1.6, 0, 0);
                rightPost.position.set(1.6, 0, 0);
                obstacleMesh.add(leftPost, rightPost);

                obstacleMesh.position.set(laneX, 0.8, spawnZ);
                obstacleMesh.userData = { type: 'laser', lane: laneIndex };
            }

            scene.add(obstacleMesh);
            obstacles.push(obstacleMesh);
        }

        function spawnCollectible() {
            const laneIndex = Math.floor(Math.random() * LANE_COUNT);
            const laneX = LANES[laneIndex];
            const spawnZ = -180;

            // Rotating Glowing Orb/Diamond Crystal
            const geo = new THREE.OctahedronGeometry(0.45, 0);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffdd00,
                emissive: 0xffaa00,
                emissiveIntensity: 1,
                metalness: 0.5
            });
            const orb = new THREE.Mesh(geo, mat);
            orb.position.set(laneX, 1.0, spawnZ);
            orb.userData = { lane: laneIndex };

            scene.add(orb);
            collectibles.push(orb);
        }

        // Particle Burst FX for Collections/Collisions
        function createExplosionFX(pos, colorHex, count = 20) {
            const pGroup = new THREE.Group();
            const geo = new THREE.SphereGeometry(0.08, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: colorHex });

            for (let i = 0; i < count; i++) {
                const p = new THREE.Mesh(geo, mat);
                p.position.copy(pos);
                p.userData = {
                    vel: new THREE.Vector3(
                        (Math.random() - 0.5) * 12,
                        (Math.random() - 0.2) * 10,
                        (Math.random() - 0.5) * 12
                    ),
                    life: 1.0
                };
                pGroup.add(p);
            }
            scene.add(pGroup);
            particleEffects.push(pGroup);
        }

        // ==========================================
        // INPUT CONTROLS (Keyboard & Touch)
        // ==========================================
        function setupControls() {
            window.addEventListener('keydown', (e) => {
                if (!isGameRunning) return;

                if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && currentLane > 0) {
                    currentLane--;
                    targetX = LANES[currentLane];
                } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && currentLane < LANE_COUNT - 1) {
                    currentLane++;
                    targetX = LANES[currentLane];
                } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') && !isJumping) {
                    isJumping = true;
                    jumpVelocity = JUMP_IMPULSE;
                    audio.playJump();
                } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') && boostMeter >= 100 && !isBoostActive) {
                    activateNitro();
                }
            });

            // Touch Control Logic for Mobile
            let touchStartX = 0;
            let touchStartY = 0;
            let lastTapTime = 0;

            window.addEventListener('touchstart', (e) => {
                if (!isGameRunning || e.touches.length === 0) return;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;

                // Check for double-tap to activate boost
                const now = Date.now();
                if (now - lastTapTime < 300 && boostMeter >= 100 && !isBoostActive) {
                    activateNitro();
                }
                lastTapTime = now;
            }, { passive: true });

            window.addEventListener('touchend', (e) => {
                if (!isGameRunning || e.changedTouches.length === 0) return;
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                const deltaY = e.changedTouches[0].clientY - touchStartY;

                if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX < 0 && currentLane > 0) {
                        currentLane--;
                        targetX = LANES[currentLane];
                    } else if (deltaX > 0 && currentLane < LANE_COUNT - 1) {
                        currentLane++;
                        targetX = LANES[currentLane];
                    }
                } else if (deltaY < -35 && !isJumping) {
                    // Swipe up to jump
                    isJumping = true;
                    jumpVelocity = JUMP_IMPULSE;
                    audio.playJump();
                }
            }, { passive: true });
        }

        // ==========================================
        // GAME LOGIC & LOOP
        // ==========================================
        function activateNitro() {
            isBoostActive = true;
            boostTimer = 4.5; // 4.5 seconds nitro
            boostMeter = 0;
            speedOverlayEl.style.opacity = '1';
            audio.playBoost();
        }

        function startGame() {
            // Reset state
            score = 0;
            multiplier = 1;
            comboCount = 0;
            collectedOrbsCount = 0;
            boostMeter = 0;
            isBoostActive = false;
            currentLane = 1;
            targetX = LANES[1];
            playerY = 0.6;
            isJumping = false;
            jumpVelocity = 0;
            currentSpeed = baseSpeed;

            // Clear active entities
            obstacles.forEach(o => scene.remove(o));
            collectibles.forEach(c => scene.remove(c));
            particleEffects.forEach(p => scene.remove(p));
            obstacles = [];
            collectibles = [];
            particleEffects = [];

            // UI Reset
            startScreenEl.classList.add('hidden');
            gameOverScreenEl.classList.add('hidden');
            speedOverlayEl.style.opacity = '0';
            updateUI();

            isGameRunning = true;
            audio.startMusic();
        }

        function gameOver() {
            isGameRunning = false;
            audio.stopMusic();
            audio.playCrash();

            // Check Highscore
            let isNewHigh = false;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('cyberdash_highscore', highScore.toString());
                highscoreValEl.innerText = highScore;
                isNewHigh = true;
            }

            // Populate Game Over UI
            document.getElementById('final-score').innerText = Math.floor(score);
            document.getElementById('final-highscore').innerText = highScore;
            document.getElementById('final-combo').innerText = `${comboCount}x`;
            document.getElementById('final-orbs').innerText = collectedOrbsCount;

            const newTag = document.getElementById('new-high-score-tag');
            if (isNewHigh) {
                newTag.classList.remove('hidden');
            } else {
                newTag.classList.add('hidden');
            }

            gameOverScreenEl.classList.remove('hidden');
        }

        function updateUI() {
            scoreValEl.innerText = Math.floor(score).toString().padStart(5, '0');
            multiplierValEl.innerText = `${multiplier}x`;
            speedValEl.innerText = `${Math.floor(currentSpeed * 5.5)} KM/H`;

            // Update Boost Meter UI
            boostBarEl.style.width = `${boostMeter}%`;
            if (boostMeter >= 100 && !isBoostActive) {
                boostStatusEl.innerText = "NITRO READY! [PRESS S/DOWN]";
                boostStatusEl.classList.add("neon-text-pink");
            } else if (isBoostActive) {
                boostStatusEl.innerText = "NITRO BOOSTING!!";
                boostStatusEl.classList.remove("neon-text-pink");
            } else {
                boostStatusEl.innerText = "COLLECT ORBS [SPACE/TAP]";
                boostStatusEl.classList.remove("neon-text-pink");
            }

            // Combo display logic
            if (comboCount >= 3) {
                comboValEl.innerText = `${comboCount} COMBO!`;
                comboBoxEl.style.opacity = '1';
            } else {
                comboBoxEl.style.opacity = '0';
            }
        }

        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const delta = Math.min(clock.getDelta(), 0.1);

            if (isGameRunning) {
                // Acceleration over time
                currentSpeed = (isBoostActive ? baseSpeed * 1.8 : baseSpeed) + Math.min(score * 0.005, 18);

                // 1. Grid Movement Animation
                gridMesh.position.z += currentSpeed * delta;
                if (gridMesh.position.z > -100) {
                    gridMesh.position.z = -180;
                }

                // 2. Player Horizontal Smooth Movement (Lerp)
                playerGroup.position.x += (targetX - playerGroup.position.x) * 14 * delta;

                // 3. Player Jumping Physics
                if (isJumping) {
                    playerY += jumpVelocity * delta;
                    jumpVelocity += GRAVITY * delta;

                    if (playerY <= 0.6) {
                        playerY = 0.6;
                        isJumping = false;
                        jumpVelocity = 0;
                    }
                }
                playerGroup.position.y = playerY;

                // Rotate player sphere and ring
                playerMesh.rotation.x += currentSpeed * 0.1 * delta;
                const ring = playerGroup.getObjectByName('outerRing');
                if (ring) ring.rotation.z += 2.5 * delta;

                // Nitro Boost Timer
                if (isBoostActive) {
                    boostTimer -= delta;
                    if (boostTimer <= 0) {
                        isBoostActive = false;
                        speedOverlayEl.style.opacity = '0';
                    }
                }

                // 4. Spawning Logic
                spawnTimer += delta;
                if (spawnTimer > Math.max(0.45, 1.4 - currentSpeed * 0.025)) {
                    spawnObstacle();
                    spawnTimer = 0;
                }

                collectibleTimer += delta;
                if (collectibleTimer > 0.8) {
                    if (Math.random() > 0.3) spawnCollectible();
                    collectibleTimer = 0;
                }

                // 5. Update Obstacles & Collision Detection
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    const obs = obstacles[i];
                    obs.position.z += currentSpeed * delta;

                    // Collision Check
                    const dz = Math.abs(obs.position.z - playerGroup.position.z);
                    const dx = Math.abs(obs.position.x - playerGroup.position.x);

                    if (dz < 0.9 && dx < 1.1) {
                        let hit = false;
                        if (obs.userData.type === 'block') {
                            hit = playerY < 1.3;
                        } else if (obs.userData.type === 'laser') {
                            hit = playerY < 1.4; // Jump required
                        }

                        if (hit) {
                            if (isBoostActive) {
                                // Destroy obstacle in Nitro Mode
                                createExplosionFX(obs.position, 0xff0044, 25);
                                scene.remove(obs);
                                obstacles.splice(i, 1);
                                score += 200;
                                continue;
                            } else {
                                // Normal Hit - Game Over
                                createExplosionFX(playerGroup.position, 0x00f3ff, 35);
                                gameOver();
                                return;
                            }
                        }
                    }

                    // Remove out of bounds
                    if (obs.position.z > 10) {
                        scene.remove(obs);
                        obstacles.splice(i, 1);
                        score += 25 * multiplier;
                    }
                }

                // 6. Update Collectibles & Collection Detection
                for (let i = collectibles.length - 1; i >= 0; i--) {
                    const orb = collectibles[i];
                    orb.position.z += currentSpeed * delta;
                    orb.rotation.y += 4 * delta;

                    const dz = Math.abs(orb.position.z - playerGroup.position.z);
                    const dx = Math.abs(orb.position.x - playerGroup.position.x);
                    const dy = Math.abs(orb.position.y - playerGroup.position.y);

                    if (dz < 1.0 && dx < 1.1 && dy < 1.2) {
                        // Collected!
                        audio.playCollect();
                        createExplosionFX(orb.position, 0xffdd00, 15);
                        
                        collectedOrbsCount++;
                        comboCount++;
                        multiplier = 1 + Math.floor(comboCount / 5);
                        score += 100 * multiplier;

                        if (!isBoostActive && boostMeter < 100) {
                            boostMeter = Math.min(100, boostMeter + 20);
                        }

                        scene.remove(orb);
                        collectibles.splice(i, 1);
                        continue;
                    }

                    if (orb.position.z > 10) {
                        // Missed orb resets combo
                        comboCount = 0;
                        multiplier = 1;
                        scene.remove(orb);
                        collectibles.splice(i, 1);
                    }
                }

                // 7. Update Particle Effects
                for (let i = particleEffects.length - 1; i >= 0; i--) {
                    const pGroup = particleEffects[i];
                    let allDead = true;

                    pGroup.children.forEach(p => {
                        p.position.addScaledVector(p.userData.vel, delta);
                        p.userData.life -= delta * 2.5;
                        p.scale.setScalar(Math.max(0.01, p.userData.life));
                        if (p.userData.life > 0) allDead = false;
                    });

                    if (allDead) {
                        scene.remove(pGroup);
                        particleEffects.splice(i, 1);
                    }
                }

                // Incremental distance score
                score += currentSpeed * delta * 0.5 * multiplier;
                updateUI();
            }

            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Initialize on load
        window.onload = () => {
            initScene();
            setupControls();

            startBtn.addEventListener('click', startGame);
            restartBtn.addEventListener('click', startGame);

            // Start render loop
            animate();
        };
    </script>
</body>
</html>