class Player {
    constructor(game) {
        this.game = game;
        
        this.x = 100;
        this.y = this.getCanvasHeight() / 2;
        this.width = 40;
        this.height = 40;
        
        this.velocityY = 0;
        this.gravity = 0.5; // consistent with debug defaults
        this.jumpForce = -10; // consistent with debug defaults (applied as negative)
        this.maxFallSpeed = 8; // consistent with debug defaults
        this.groundY = this.getCanvasHeight() - this.height - 20;
        
        this.isJumping = false;
        this.jumpFlipEnabled = true;
        this.flipRotation = 0;
        this.startingMode = true; // Player floats at start
        this.startingModeFrames = 0; // Frame counter for starting mode
        this.isFlipping = false;
        this.flipDuration = 400; // milliseconds for full 360 flip
        this.flipStartTime = 0;
        
        this.spriteLoaded = false;
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        this.sprite.onerror = () => {
            console.log('Could not load player sprite, using fallback');
            this.spriteLoaded = false;
        };
        this.sprite.src = './images/gameimage.png';
        
        this.animation = {
            frameCount: 0,
            bobOffset: 0,
            rotation: 0
        };
        
        this.particles = [];
        
        // Initialize Web Audio for iOS performance
        this.initWebAudio();
        
        this.reset();
    }
    
    getCanvasHeight() {
        return this.game.canvasHeight || this.game.canvas.height;
    }
    
    reset() {
        this.x = 100;
        this.y = this.getCanvasHeight() / 2;
        this.groundY = this.getCanvasHeight() - this.height - 20;
        this.velocityY = 0;
        this.isJumping = false;
        this.isFlipping = false;
        this.flipRotation = 0;
        this.flipStartTime = 0;
        this.startingMode = true; // Reset to floating mode
        this.startingModeFrames = 0; // Reset frame counter
        this.animation.frameCount = 0;
        this.animation.bobOffset = 0;
        this.animation.rotation = 0;
        this.particles = [];
    }
    
    jump() {
        // Flappy bird style - can always jump
        this.velocityY = this.jumpForce;
        this.isJumping = true;
        this.startingMode = false; // Exit floating mode on first jump
        
        // Start flip animation if enabled
        if (this.jumpFlipEnabled) {
            this.startFlip();
        }
        
        this.createJumpParticles();
        this.playJumpSound();
    }
    
    startFlip() {
        this.isFlipping = true;
        this.flipStartTime = Date.now(); // Use Date.now() instead of performance.now()
        this.flipRotation = 0;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 16;
        
        // If in starting mode, float in place until first jump or timer expires
        if (this.startingMode) {
            // Use frame-based timing instead of deltaTime for mobile reliability
            this.startingModeFrames = (this.startingModeFrames || 0) + 1;
            
            // Exit starting mode after ~240 frames (4 seconds at 60fps)
            // This works regardless of mobile timing issues
            if (this.startingModeFrames >= 240) {
                this.startingMode = false;
            }
            
            this.velocityY = 0;
            this.y = this.getCanvasHeight() / 2; // Keep at halfway point
        } else {
            // Normal physics
            this.velocityY += this.gravity * dt;
            this.velocityY = Math.min(this.velocityY, this.maxFallSpeed);
            this.y += this.velocityY * dt;
        }
        
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            const wasJumping = this.isJumping;
            this.isJumping = false;
            
            if (wasJumping) {
                this.createLandingParticles();
                this.playLandSound();
            }
        }
        
        if (this.y <= 0) {
            this.y = 0;
            this.velocityY = 0;
        }
        
        this.updateAnimation(dt);
        this.updateFlipAnimation();
        this.updateParticles(dt);
    }
    
    updateAnimation(dt) {
        this.animation.frameCount += dt;
        
        // Only apply normal rotation if not flipping
        if (!this.isFlipping) {
            if (this.isJumping) {
                this.animation.rotation = Math.sin(this.animation.frameCount * 0.3) * 0.2;
                this.animation.bobOffset = 0;
            } else {
                this.animation.rotation = 0;
                this.animation.bobOffset = Math.sin(this.animation.frameCount * 0.1) * 2;
            }
        } else {
            this.animation.bobOffset = 0;
        }
    }
    
    updateFlipAnimation() {
        if (!this.isFlipping) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.flipStartTime;
        const progress = Math.min(elapsed / this.flipDuration, 1);
        
        // Smooth easing function for the flip
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        // Calculate rotation (360 degrees = 2π radians)
        this.flipRotation = easeProgress * Math.PI * 2;
        
        // End flip when complete
        if (progress >= 1) {
            this.isFlipping = false;
            this.flipRotation = 0;
        }
    }
    
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += 0.5 * dt;
            particle.life -= dt;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * -3 - 2,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: '#f6ff0d',
                size: Math.random() * 3 + 1
            });
        }
    }
    
    createLandingParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -2 - 1,
                life: 20,
                maxLife: 20,
                alpha: 1,
                color: '#4bbbf0',
                size: Math.random() * 2 + 1
            });
        }
    }
    
    render(ctx) {
        this.renderParticles(ctx);
        
        ctx.save();
        
        const renderX = this.x + this.width / 2;
        const renderY = this.y + this.height / 2 + this.animation.bobOffset;
        
        ctx.translate(renderX, renderY);
        
        // Apply flip rotation if active, otherwise normal rotation
        if (this.isFlipping) {
            ctx.rotate(this.flipRotation);
        } else {
            ctx.rotate(this.animation.rotation);
        }
        
        if (this.spriteLoaded) {
            ctx.imageSmoothingEnabled = false;
            
            const shadowOffset = 3;
            ctx.globalAlpha = 0.3;
            ctx.drawImage(
                this.sprite,
                -this.width / 2 + shadowOffset,
                -this.height / 2 + shadowOffset,
                this.width,
                this.height
            );
            
            ctx.globalAlpha = 1;
            ctx.drawImage(
                this.sprite,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            this.renderFallbackCharacter(ctx);
        }
        
        if (this.isJumping) {
            this.renderJumpEffect(ctx);
        }
        
        ctx.restore();
    }
    
    renderFallbackCharacter(ctx) {
        const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        gradient.addColorStop(0, '#4bbbf0');
        gradient.addColorStop(1, '#101631');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.strokeStyle = '#f6ff0d';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = '#f6ff0d';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('K', 0, 0);
    }
    
    renderJumpEffect(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#f6ff0d';
        ctx.lineWidth = 2;
        
        const radius = this.width * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#4bbbf0';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderParticles(ctx) {
        ctx.save();
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderHitbox(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    
    initWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.jumpBuffer = null;
            
            // Load jump sound into Web Audio buffer
            fetch('./sounds/player/jump.mp3')
                .then(response => response.arrayBuffer())
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => {
                    this.jumpBuffer = buffer;
                })
                .catch(() => {
                    // Fallback to HTML5 audio if Web Audio fails
                    this.audioContext = null;
                });
        } catch (e) {
            // Web Audio not supported, use HTML5 audio
            this.audioContext = null;
        }
    }

    playJumpSound() {
        if (this.audioContext && this.jumpBuffer) {
            // Use Web Audio API for low-latency playback
            try {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.jumpBuffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            } catch (e) {
                // Fallback to HTML5 audio
                this.playJumpSoundHTML5();
            }
        } else {
            // Fallback to HTML5 audio
            this.playJumpSoundHTML5();
        }
    }

    playJumpSoundHTML5() {
        const jumpSound = document.getElementById('jumpSound');
        if (jumpSound && jumpSound.play) {
            jumpSound.play().catch(e => {
                // Audio play failed, which is fine
            });
        }
    }
    
    playLandSound() {
        const landSound = document.getElementById('landSound');
        if (landSound && landSound.play) {
            landSound.currentTime = 0;
            landSound.play().catch(e => {
                // Audio play failed, which is fine
            });
        }
    }
    
    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
    
    checkCollision(rect) {
        const bounds = this.getBounds();
        
        return bounds.x < rect.x + rect.width &&
               bounds.x + bounds.width > rect.x &&
               bounds.y < rect.y + rect.height &&
               bounds.y + bounds.height > rect.y;
    }
}