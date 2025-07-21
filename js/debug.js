class DebugManager {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.settingsButtonRetries = 0;
        
        // Default settings (Easy mode)
        this.defaultSettings = {
            // Player Physics
            gravity: 0.5,
            jumpForce: 10,
            maxFallSpeed: 8,
            jumpFlip: true,
            
            // Obstacles
            spawnDelay: 150,
            minGap: 210,
            maxGap: 294,
            obstacleWidth: 50,
            horizontalSpacing: 120,
            
            // Game Speed
            baseSpeed: 1.5,
            speedIncrease: 0.15,
            speedInterval: 50,
            
            // Scoring
            obstaclePoints: 5,
            distanceRate: 5,
            scoreMultiplier: 1.0,
            
            // Turtle Tokens
            apySpawnRate: 5,
            apyBonusValue: 100
        };
        
        this.currentSettings = { ...this.defaultSettings };
        
        // Difficulty presets - Only speed changes, gaps stay easy!
        this.presets = {
            easy: {
                gravity: 0.5,
                jumpForce: 10,
                maxFallSpeed: 8,
                spawnDelay: 150,
                minGap: 200,
                maxGap: 280,
                horizontalSpacing: 120,
                baseSpeed: 1.5,
                speedIncrease: 0.15,
                scoreMultiplier: 1.0
            },
            medium: {
                gravity: 0.5,
                jumpForce: 10,
                maxFallSpeed: 8,
                spawnDelay: 150,
                minGap: 200,
                maxGap: 280,
                horizontalSpacing: 120,
                baseSpeed: 2.2,
                speedIncrease: 0.2,
                scoreMultiplier: 1.3
            },
            hard: {
                gravity: 0.5,
                jumpForce: 10,
                maxFallSpeed: 8,
                spawnDelay: 150,
                minGap: 200,
                maxGap: 280,
                horizontalSpacing: 120,
                baseSpeed: 3.0,
                speedIncrease: 0.25,
                scoreMultiplier: 1.7
            },
            insane: {
                gravity: 0.5,
                jumpForce: 10,
                maxFallSpeed: 8,
                spawnDelay: 150,
                minGap: 200,
                maxGap: 280,
                horizontalSpacing: 120,
                baseSpeed: 4.0,
                speedIncrease: 0.3,
                scoreMultiplier: 2.5
            }
        };
        
        // Only enable debug functionality in local development environment
        const isLocalDev = location.hostname === 'localhost' || 
                          location.hostname === '127.0.0.1' || 
                          location.protocol === 'file:';
        
        if (!isLocalDev) {
            this.isEnabled = false;
            return; // Exit debug system entirely for public users
        }
        
        console.log('DebugManager constructor called - Local development environment detected');
        this.isEnabled = true;
        
        try {
            this.setupEventListeners();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
        
        try {
            this.setupButtonAndCheckboxListeners();
        } catch (error) {
            console.error('Error setting up button/checkbox listeners:', error);
        }
        
        try {
            this.initializeControls();
        } catch (error) {
            console.error('Error initializing controls:', error);
        }
    }
    
    setupEventListeners() {
        // Setup settings button toggle with retry mechanism
        this.trySetupSettingsButton();
        
        // Keep keyboard toggle as backup
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyD' && !e.repeat) {
                this.toggle();
            }
        });
    }
    
    trySetupSettingsButton() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            // Add multiple event types for better mobile compatibility
            const clickHandler = (e) => {
                console.log('Settings button clicked!', e.type);
                e.preventDefault();
                e.stopPropagation();
                this.playSettingsSound();
                this.toggle();
            };
            
            settingsBtn.addEventListener('click', clickHandler);
            settingsBtn.addEventListener('touchstart', clickHandler);
            settingsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            // Add visual feedback
            settingsBtn.addEventListener('mousedown', () => {
                settingsBtn.style.transform = 'scale(0.95)';
            });
            settingsBtn.addEventListener('mouseup', () => {
                settingsBtn.style.transform = '';
            });
            
            console.log('Settings button event listeners attached');
            console.log('Button style:', window.getComputedStyle(settingsBtn).display);
            console.log('Button position:', settingsBtn.getBoundingClientRect());
        } else {
            this.settingsButtonRetries++;
            if (this.settingsButtonRetries < 5) {
                console.warn(`Settings button not found, retry ${this.settingsButtonRetries}/5`);
                setTimeout(() => this.trySetupSettingsButton(), 100);
            } else {
                console.warn('Settings button not found after 5 retries, using keyboard only (press D)');
            }
        }
    }
    
    setupButtonAndCheckboxListeners() {
        // Close button
        document.getElementById('debugClose').addEventListener('click', () => {
            this.hide();
        });
        
        // Control event listeners
        this.setupSliderListeners();
        this.setupButtonListeners();
    }
    
    setupSliderListeners() {
        const sliders = [
            'gravity', 'jumpForce', 'maxFallSpeed',
            'spawnDelay', 'minGap', 'maxGap', 'obstacleWidth', 'horizontalSpacing',
            'baseSpeed', 'speedIncrease', 'speedInterval',
            'obstaclePoints', 'distanceRate', 'scoreMultiplier',
            'apySpawnRate', 'apyBonusValue'
        ];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = slider.parentElement.querySelector('.debug-value');
            
            slider.addEventListener('input', () => {
                const value = parseFloat(slider.value);
                // Special formatting for score multiplier
                if (sliderId === 'scoreMultiplier') {
                    valueDisplay.textContent = value.toFixed(1) + 'x';
                } else {
                    valueDisplay.textContent = value;
                }
                this.currentSettings[sliderId] = value;
                this.applySettings();
            });
        });
        
        // Setup checkbox listener for jump flip
        const jumpFlipCheckbox = document.getElementById('jumpFlip');
        const jumpFlipToggle = jumpFlipCheckbox.parentElement.querySelector('.debug-toggle');
        
        jumpFlipCheckbox.addEventListener('change', () => {
            this.currentSettings.jumpFlip = jumpFlipCheckbox.checked;
            jumpFlipToggle.textContent = jumpFlipCheckbox.checked ? 'Enabled' : 'Disabled';
            jumpFlipToggle.style.color = jumpFlipCheckbox.checked ? 'var(--katana-yellow)' : 'var(--katana-blue)';
            this.applySettings();
        });
        
        // Setup preset selector
        const presetSelector = document.getElementById('difficultyPreset');
        presetSelector.addEventListener('change', () => {
            if (presetSelector.value !== 'custom') {
                this.applyPreset(presetSelector.value);
            }
        });
    }
    
    setupButtonListeners() {
        document.getElementById('resetGame').addEventListener('click', () => {
            if (this.game.gameState === 'playing') {
                this.game.gameOver();
            }
            this.game.showMenu();
        });
        
        document.getElementById('exportSettings').addEventListener('click', () => {
            this.exportSettings();
        });
        
        document.getElementById('resetDefaults').addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        document.getElementById('lockSettings').addEventListener('click', () => {
            this.lockSettings();
        });
    }
    
    initializeControls() {
        // Set initial values for all slider controls
        Object.keys(this.defaultSettings).forEach(key => {
            if (key === 'jumpFlip') return; // Skip checkbox, handle separately
            
            const slider = document.getElementById(key);
            if (slider) {
                const valueDisplay = slider.parentElement.querySelector('.debug-value');
                slider.value = this.defaultSettings[key];
                valueDisplay.textContent = this.defaultSettings[key];
            }
        });
        
        // Initialize checkbox
        const jumpFlipCheckbox = document.getElementById('jumpFlip');
        const jumpFlipToggle = jumpFlipCheckbox.parentElement.querySelector('.debug-toggle');
        jumpFlipCheckbox.checked = this.defaultSettings.jumpFlip;
        jumpFlipToggle.textContent = this.defaultSettings.jumpFlip ? 'Enabled' : 'Disabled';
        
        // Initialize score multiplier display
        const scoreMultiplierDisplay = document.getElementById('scoreMultiplier').parentElement.querySelector('.debug-value');
        scoreMultiplierDisplay.textContent = this.defaultSettings.scoreMultiplier.toFixed(1) + 'x';
        
        this.applySettings();
    }
    
    applyPreset(presetName) {
        if (!this.presets[presetName]) return;
        
        const preset = this.presets[presetName];
        
        // Update current settings with preset values
        Object.keys(preset).forEach(key => {
            this.currentSettings[key] = preset[key];
        });
        
        // Update all UI controls with preset values
        Object.keys(preset).forEach(key => {
            if (key === 'jumpFlip') return; // Skip checkbox
            
            const control = document.getElementById(key);
            if (control) {
                control.value = preset[key];
                const valueDisplay = control.parentElement.querySelector('.debug-value');
                if (valueDisplay) {
                    if (key === 'scoreMultiplier') {
                        valueDisplay.textContent = preset[key].toFixed(1) + 'x';
                    } else {
                        valueDisplay.textContent = preset[key];
                    }
                }
            }
        });
        
        // Apply the preset settings to the game
        this.applySettings();
        
        // Show notification
        const presetNames = {
            easy: 'Easy - Large Gaps',
            medium: 'Medium - Balanced', 
            hard: 'Hard - Tight Spaces',
            insane: 'Insane - Expert Only'
        };
        this.showNotification(`Applied ${presetNames[presetName]} preset!`);
    }
    
    applySettings() {
        if (!this.game.player || !this.game.obstacleManager || !this.isEnabled) return;
        
        // Apply player physics settings
        this.game.player.gravity = this.currentSettings.gravity;
        this.game.player.jumpForce = -this.currentSettings.jumpForce;
        this.game.player.maxFallSpeed = this.currentSettings.maxFallSpeed;
        this.game.player.jumpFlipEnabled = this.currentSettings.jumpFlip;
        
        // Apply obstacle settings
        this.game.obstacleManager.spawnDelay = this.currentSettings.spawnDelay;
        this.game.obstacleManager.minGap = this.currentSettings.minGap;
        this.game.obstacleManager.maxGap = this.currentSettings.maxGap;
        this.game.obstacleManager.baseObstacleWidth = this.currentSettings.obstacleWidth;
        this.game.obstacleManager.minHorizontalSpacing = this.currentSettings.horizontalSpacing;
        
        // Apply game speed settings
        this.game.baseSpeed = this.currentSettings.baseSpeed;
        this.game.speedIncrease = this.currentSettings.speedIncrease;
        this.game.speedInterval = this.currentSettings.speedInterval;
        
        // Apply scoring settings
        this.game.obstaclePoints = this.currentSettings.obstaclePoints;
        this.game.distanceRate = this.currentSettings.distanceRate;
        this.game.scoreMultiplier = this.currentSettings.scoreMultiplier;
        
        // Apply turtle token settings
        this.game.obstacleManager.turtleSpawnRate = this.currentSettings.apySpawnRate;
    }
    
    updateLiveStats() {
        if (!this.isVisible || !this.game.player) return;
        
        // Update live stats display
        document.getElementById('liveSpeed').textContent = this.game.gameSpeed.toFixed(1);
        document.getElementById('liveObstacles').textContent = this.game.obstacleManager ? this.game.obstacleManager.obstacles.length : 0;
        document.getElementById('livePlayerY').textContent = Math.round(this.game.player.y);
        document.getElementById('liveVelocity').textContent = this.game.player.velocityY.toFixed(1);
    }
    
    toggle() {
        // Prevent debug access if not enabled (production environment)
        if (this.isEnabled === false) {
            return;
        }
        
        console.log('Debug menu toggle called, currently visible:', this.isVisible);
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    playSettingsSound() {
        if (this.game && this.game.playSettingsSound) {
            this.game.playSettingsSound();
        }
    }
    
    show() {
        console.log('Showing debug menu...');
        this.isVisible = true;
        const debugMenu = document.getElementById('debugMenu');
        console.log('Debug menu element found:', !!debugMenu);
        if (debugMenu) {
            debugMenu.classList.remove('hidden');
            console.log('Debug menu classes after show:', debugMenu.classList.toString());
        }
        this.applySettings(); // Ensure settings are applied when shown
    }
    
    hide() {
        this.isVisible = false;
        document.getElementById('debugMenu').classList.add('hidden');
    }
    
    exportSettings() {
        const exportData = {
            katanaGameSettings: this.currentSettings,
            timestamp: new Date().toISOString(),
            version: "1.0"
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create downloadable file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'katana-game-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also copy to clipboard
        navigator.clipboard.writeText(jsonString).then(() => {
            this.showNotification('Settings exported and copied to clipboard!');
        }).catch(() => {
            this.showNotification('Settings exported as file!');
        });
    }
    
    resetToDefaults() {
        this.currentSettings = { ...this.defaultSettings };
        
        // Update all slider values and displays
        Object.keys(this.defaultSettings).forEach(key => {
            if (key === 'jumpFlip') return; // Skip checkbox, handle separately
            
            const slider = document.getElementById(key);
            if (slider) {
                const valueDisplay = slider.parentElement.querySelector('.debug-value');
                slider.value = this.defaultSettings[key];
                valueDisplay.textContent = this.defaultSettings[key];
            }
        });
        
        // Reset checkbox
        const jumpFlipCheckbox = document.getElementById('jumpFlip');
        const jumpFlipToggle = jumpFlipCheckbox.parentElement.querySelector('.debug-toggle');
        jumpFlipCheckbox.checked = this.defaultSettings.jumpFlip;
        jumpFlipToggle.textContent = this.defaultSettings.jumpFlip ? 'Enabled' : 'Disabled';
        jumpFlipToggle.style.color = this.defaultSettings.jumpFlip ? 'var(--katana-yellow)' : 'var(--katana-blue)';
        
        // Reset score multiplier display
        const scoreMultiplierDisplay = document.getElementById('scoreMultiplier').parentElement.querySelector('.debug-value');
        scoreMultiplierDisplay.textContent = this.defaultSettings.scoreMultiplier.toFixed(1) + 'x';
        
        // Reset preset selector
        document.getElementById('difficultyPreset').value = 'custom';
        
        this.applySettings();
        this.showNotification('Settings reset to defaults!');
    }
    
    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'debug-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--katana-yellow);
            color: var(--katana-navy);
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            z-index: 1001;
            font-family: 'Courier New', monospace;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    // Method to lock in final settings (removes debug menu completely)
    lockSettings() {
        const finalCode = this.generateFinalCode();
        console.log('=== FINAL GAME SETTINGS CODE ===');
        console.log(finalCode);
        console.log('=== Copy this code to replace default values ===');
        
        // Copy to clipboard
        navigator.clipboard.writeText(finalCode).then(() => {
            this.showNotification('Final settings code copied to clipboard and console!');
        }).catch(() => {
            this.showNotification('Final settings code generated in console!');
        });
        
        // Also create a downloadable file
        const blob = new Blob([finalCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'katana-final-settings.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return finalCode;
    }
    
    generateFinalCode() {
        return `
// FINAL OPTIMIZED GAME SETTINGS
// Generated on ${new Date().toISOString()}

// Player Physics
const PLAYER_GRAVITY = ${this.currentSettings.gravity};
const PLAYER_JUMP_FORCE = ${this.currentSettings.jumpForce};
const PLAYER_MAX_FALL_SPEED = ${this.currentSettings.maxFallSpeed};
const PLAYER_JUMP_FLIP_ENABLED = ${this.currentSettings.jumpFlip};

// Obstacle Settings
const OBSTACLE_SPAWN_DELAY = ${this.currentSettings.spawnDelay};
const OBSTACLE_MIN_GAP = ${this.currentSettings.minGap};
const OBSTACLE_MAX_GAP = ${this.currentSettings.maxGap};
const OBSTACLE_WIDTH = ${this.currentSettings.obstacleWidth};
const HORIZONTAL_SPACING = ${this.currentSettings.horizontalSpacing};

// Game Speed & Difficulty
const BASE_GAME_SPEED = ${this.currentSettings.baseSpeed};
const SPEED_INCREASE_RATE = ${this.currentSettings.speedIncrease};
const SPEED_INCREASE_INTERVAL = ${this.currentSettings.speedInterval};

// Scoring
const POINTS_PER_OBSTACLE = ${this.currentSettings.obstaclePoints};
const DISTANCE_POINTS_RATE = ${this.currentSettings.distanceRate};
const SCORE_MULTIPLIER = ${this.currentSettings.scoreMultiplier};
        `.trim();
    }
}

// Debug manager will be initialized from game.js after game is ready