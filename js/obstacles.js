class Obstacle {
    constructor(x, y, width, height, type = 'default') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.passed = false;
        
        this.animation = {
            frameCount: 0,
            glowIntensity: 0.5
        };
    }
    
    update(speed, deltaTime) {
        const dt = deltaTime / 16;
        this.x -= speed * dt;
        this.animation.frameCount += dt;
        this.animation.glowIntensity = 0.5 + Math.sin(this.animation.frameCount * 0.1) * 0.3;
    }
    
    render(ctx) {
        ctx.save();
        
        switch(this.type) {
            case 'pillar':
                this.renderPillar(ctx);
                break;
            case 'defi_node':
                this.renderDefiNode(ctx);
                break;
            case 'liquidation_wall':
                this.renderLiquidationWall(ctx);
                break;
            default:
                this.renderDefault(ctx);
        }
        
        ctx.restore();
    }
    
    renderPillar(ctx) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#101631');
        gradient.addColorStop(0.5, '#1a2040');
        gradient.addColorStop(1, '#101631');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = `rgba(75, 187, 240, ${this.animation.glowIntensity})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        const lineSpacing = 20;
        ctx.strokeStyle = `rgba(246, 255, 13, 0.3)`;
        ctx.lineWidth = 1;
        for (let i = this.y + lineSpacing; i < this.y + this.height; i += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(this.x + 5, i);
            ctx.lineTo(this.x + this.width - 5, i);
            ctx.stroke();
        }
    }
    
    renderDefiNode(ctx) {
        // Create a high-tech DeFi node with circuit pattern
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, '#4bbbf0');
        gradient.addColorStop(0.7, '#1a2040');
        gradient.addColorStop(1, '#101631');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw circuit lines
        ctx.strokeStyle = `rgba(246, 255, 13, ${this.animation.glowIntensity})`;
        ctx.lineWidth = 2;
        
        // Horizontal circuit lines
        const lineCount = Math.floor(this.height / 15);
        for (let i = 0; i < lineCount; i++) {
            const y = this.y + 10 + i * 15;
            ctx.beginPath();
            ctx.moveTo(this.x + 5, y);
            ctx.lineTo(this.x + this.width - 5, y);
            ctx.stroke();
            
            // Add small nodes on lines
            ctx.fillStyle = '#f6ff0d';
            ctx.fillRect(this.x + 10 + (i % 3) * 10, y - 1, 3, 3);
            ctx.fillRect(this.x + this.width - 15 - (i % 2) * 8, y - 1, 3, 3);
        }
        
        // Outer border
        ctx.strokeStyle = '#4bbbf0';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Center label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MEV BOT', this.x + this.width / 2, this.y + this.height / 2);
    }
    
    renderLiquidationWall(ctx) {
        // Create animated gradient background with pulsing effect
        const pulseIntensity = 0.3 + Math.sin(this.animation.frameCount * 0.15) * 0.2;
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, `rgba(139, 34, 47, ${0.9 * pulseIntensity})`);
        gradient.addColorStop(0.3, `rgba(255, 71, 87, ${pulseIntensity})`);
        gradient.addColorStop(0.7, `rgba(255, 71, 87, ${1.0 * pulseIntensity})`);
        gradient.addColorStop(1, `rgba(139, 34, 47, ${0.9 * pulseIntensity})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add animated warning stripes with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.clip();
        
        ctx.strokeStyle = `rgba(255, 255, 0, ${this.animation.glowIntensity})`;
        ctx.lineWidth = 2;
        const stripeSpacing = 15;
        const stripeOffset = (this.animation.frameCount * 0.5) % (stripeSpacing * 2);
        
        for (let i = -stripeSpacing; i < this.height + stripeSpacing; i += stripeSpacing) {
            const y = this.y + i + stripeOffset;
            if (y >= this.y - stripeSpacing && y <= this.y + this.height + stripeSpacing) {
                ctx.beginPath();
                ctx.moveTo(this.x, y);
                ctx.lineTo(this.x + this.width, y - this.width * 0.3);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(this.x, y + 3);
                ctx.lineTo(this.x + this.width, y - this.width * 0.3 + 3);
                ctx.stroke();
            }
        }
        
        ctx.restore();
        
        // Add danger border with glow effect
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 10 * this.animation.glowIntensity;
        ctx.strokeStyle = `rgba(255, 71, 87, ${this.animation.glowIntensity})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Add inner warning pattern
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 200, 200, ${0.4 + this.animation.glowIntensity * 0.3})`;
        ctx.lineWidth = 1;
        
        // Vertical warning lines
        const lineCount = Math.floor(this.width / 8);
        for (let i = 1; i < lineCount; i++) {
            const x = this.x + (i * this.width) / lineCount;
            ctx.beginPath();
            ctx.moveTo(x, this.y + 5);
            ctx.lineTo(x, this.y + this.height - 5);
            ctx.stroke();
        }
        
        // Add crackling energy effect at edges
        ctx.strokeStyle = `rgba(255, 255, 100, ${this.animation.glowIntensity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const sparkY = this.y + Math.random() * this.height;
            const sparkSize = 3 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.moveTo(this.x - sparkSize, sparkY);
            ctx.lineTo(this.x + sparkSize, sparkY);
            ctx.moveTo(this.x, sparkY - sparkSize);
            ctx.lineTo(this.x, sparkY + sparkSize);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width - sparkSize, sparkY);
            ctx.lineTo(this.x + this.width + sparkSize, sparkY);
            ctx.moveTo(this.x + this.width, sparkY - sparkSize);
            ctx.lineTo(this.x + this.width, sparkY + sparkSize);
            ctx.stroke();
        }
        
        // Center label with glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LIQUIDATION', this.x + this.width / 2, this.y + this.height / 2);
        ctx.shadowBlur = 0;
    }
    
    renderDefault(ctx) {
        ctx.fillStyle = '#4bbbf0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#f6ff0d';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class TurtleToken {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.animation = {
            frameCount: 0,
            floatOffset: 0,
            glowIntensity: 0.5,
            rotation: 0
        };
        this.value = 50 + Math.floor(Math.random() * 100); // 50-150 bonus points
        
        // Load turtle image
        this.turtleImage = new Image();
        this.imageLoaded = false;
        this.turtleImage.onload = () => {
            this.imageLoaded = true;
        };
        this.turtleImage.onerror = () => {
            this.imageLoaded = false;
        };
        this.turtleImage.src = './images/turtle.png';
    }
    
    update(speed, deltaTime) {
        const dt = deltaTime / 16;
        this.x -= speed * dt;
        this.animation.frameCount += dt;
        this.animation.floatOffset = Math.sin(this.animation.frameCount * 0.08) * 8;
        this.animation.glowIntensity = 0.5 + Math.sin(this.animation.frameCount * 0.12) * 0.4;
        this.animation.rotation += dt * 0.02;
        this.y = this.baseY + this.animation.floatOffset;
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Draw glow effect
        ctx.shadowColor = '#4bbbf0';
        ctx.shadowBlur = 15 * this.animation.glowIntensity;
        
        // Rotate around center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.animation.rotation);
        
        if (this.imageLoaded) {
            // Draw turtle image
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.turtleImage,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback: Draw simple green circle
            ctx.fillStyle = '#4bbbf0';
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Turtle text
            ctx.fillStyle = '#101631';
            ctx.font = 'bold 6px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐢', 0, 0);
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.turtleTokens = [];
        this.spawnTimer = 0;
        this.bonusSpawnTimer = 0;
        this.spawnDelay = 120; // frames between spawns
        this.bonusSpawnDelay = 120; // frames between bonus spawns (frequent spawning)
        this.minGap = 160;
        this.maxGap = 220;
        this.baseObstacleWidth = 50;
        this.minHorizontalSpacing = 100; // Minimum pixels between obstacle groups
        
        // Obstacle-type-specific spacing multipliers
        this.obstacleSpacingMultipliers = {
            'pillar': 1.0,
            'defi_node': 1.0,
            'liquidation_wall': 1.5  // Extra spacing for wide liquidation walls
        };
        this.safeZoneHeight = 80; // Guaranteed passable area height
        
        this.obstacleTypes = ['pillar', 'defi_node', 'liquidation_wall'];
        this.difficultyRamp = 0;
        
        // Turtle token frequency control
        this.obstacleCount = 0;
        this.turtleSpawnRate = 5; // Spawn turtle token every N obstacles
    }
    
    reset() {
        this.obstacles = [];
        this.turtleTokens = [];
        this.spawnTimer = 0;
        this.bonusSpawnTimer = 0;
        this.spawnDelay = 120;
        this.difficultyRamp = 0;
        this.obstacleCount = 0;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 16;
        
        this.difficultyRamp += dt * 0.001;
        this.spawnDelay = Math.max(60, 120 - this.difficultyRamp * 20);
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(this.game.gameSpeed, deltaTime);
            
            if (obstacle.isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Update turtle tokens
        for (let i = this.turtleTokens.length - 1; i >= 0; i--) {
            const bonus = this.turtleTokens[i];
            bonus.update(this.game.gameSpeed, deltaTime);
            
            if (bonus.isOffScreen() || bonus.collected) {
                this.turtleTokens.splice(i, 1);
            }
        }
        
        // Spawn obstacles
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnDelay) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            this.obstacleCount++;
            
            // Check if we should spawn a turtle token based on obstacle count
            if (this.obstacleCount % this.turtleSpawnRate === 0 && this.obstacles.length >= 2) {
                this.spawnTurtleToken();
            }
        }
    }
    
    getCanvasWidth() {
        return this.game.canvasWidth || this.game.canvas.width;
    }
    
    getCanvasHeight() {
        return this.game.canvasHeight || this.game.canvas.height;
    }
    
    spawnObstacle() {
        const canvasWidth = this.getCanvasWidth();
        const canvasHeight = this.getCanvasHeight();
        const obstacleWidth = this.baseObstacleWidth + Math.random() * 20;
        const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        
        // Check if there's enough horizontal spacing from existing obstacles
        if (!this.canSpawnAtPosition(canvasWidth, obstacleWidth, obstacleType)) {
            return; // Skip spawning if too close to existing obstacles
        }
        
        // Calculate safe gap size (ensure it's always navigable)
        const playerHeight = 40; // Player character height
        const safetyMargin = 20; // Extra space for comfortable navigation
        const minimumSafeGap = playerHeight + safetyMargin * 2; // 80 pixels minimum
        
        // Use the larger of configured gap or minimum safe gap
        const actualMinGap = Math.max(this.minGap, minimumSafeGap);
        const actualMaxGap = Math.max(this.maxGap, actualMinGap + 60);
        const gapSize = actualMinGap + Math.random() * (actualMaxGap - actualMinGap);
        
        // Calculate safe vertical position for the gap
        const topMargin = 60; // Space from top
        const bottomMargin = 60; // Space from bottom (ground level)
        const availableHeight = canvasHeight - topMargin - bottomMargin - gapSize;
        
        if (availableHeight <= 0) {
            // If screen too small, create a single obstacle instead
            this.spawnSingleObstacle(canvasWidth, canvasHeight, obstacleWidth, obstacleType);
            return;
        }
        
        const gapCenterY = topMargin + gapSize/2 + Math.random() * availableHeight;
        const gapTopY = gapCenterY - gapSize/2;
        const gapBottomY = gapCenterY + gapSize/2;
        
        // Create obstacles with validated gap
        const obstacles = this.createObstaclePair(canvasWidth, canvasHeight, obstacleWidth, gapTopY, gapBottomY, obstacleType);
        
        // Final validation - ensure obstacles don't overlap with existing ones
        if (this.validateObstacles(obstacles)) {
            this.obstacles.push(...obstacles);
        }
    }
    
    canSpawnAtPosition(x, width, obstacleType = 'pillar') {
        // Check minimum horizontal spacing from existing obstacles
        // Use boundary-to-boundary distance to prevent overlapping navigable space
        const spacingMultiplier = this.obstacleSpacingMultipliers[obstacleType] || 1.0;
        const requiredSpacing = this.minHorizontalSpacing * spacingMultiplier;
        
        for (const obstacle of this.obstacles) {
            const existingRightEdge = obstacle.x + obstacle.width;
            const newLeftEdge = x;
            const newRightEdge = x + width;
            const existingLeftEdge = obstacle.x;
            
            // Calculate the minimum distance between obstacle boundaries
            let boundaryDistance;
            if (newLeftEdge >= existingRightEdge) {
                // New obstacle is to the right
                boundaryDistance = newLeftEdge - existingRightEdge;
            } else if (existingLeftEdge >= newRightEdge) {
                // New obstacle is to the left
                boundaryDistance = existingLeftEdge - newRightEdge;
            } else {
                // Obstacles would overlap
                boundaryDistance = 0;
            }
            
            if (boundaryDistance < requiredSpacing) {
                return false;
            }
        }
        return true;
    }
    
    createObstaclePair(canvasWidth, canvasHeight, width, gapTop, gapBottom, type) {
        const obstacles = [];
        
        // Create top obstacle (if there's room)
        if (gapTop > 20) {
            obstacles.push(new Obstacle(
                canvasWidth,
                0,
                width,
                gapTop,
                type
            ));
        }
        
        // Create bottom obstacle (if there's room)
        const bottomStart = gapBottom;
        const bottomHeight = canvasHeight - bottomStart - 50; // Leave space for ground
        if (bottomHeight > 20) {
            obstacles.push(new Obstacle(
                canvasWidth,
                bottomStart,
                width,
                bottomHeight,
                type
            ));
        }
        
        return obstacles;
    }
    
    spawnSingleObstacle(canvasWidth, canvasHeight, width, type) {
        // Create a single obstacle with guaranteed gap above or below
        const playerHeight = 40;
        const safetyMargin = 30;
        const minObstacleHeight = 60;
        const maxObstacleHeight = Math.min(200, canvasHeight / 3);
        
        const obstacleHeight = minObstacleHeight + Math.random() * (maxObstacleHeight - minObstacleHeight);
        
        // Randomly place at top or bottom
        let obstacle;
        if (Math.random() < 0.5) {
            // Top obstacle - leave safe space at bottom
            const maxY = canvasHeight - (playerHeight + safetyMargin * 2) - obstacleHeight;
            const y = Math.random() * Math.max(0, maxY);
            obstacle = new Obstacle(canvasWidth, y, width, obstacleHeight, type);
        } else {
            // Bottom obstacle - leave safe space at top  
            const minY = playerHeight + safetyMargin * 2;
            const y = minY + Math.random() * (canvasHeight - minY - obstacleHeight - 50);
            obstacle = new Obstacle(canvasWidth, y, width, obstacleHeight, type);
        }
        
        if (this.validateObstacles([obstacle])) {
            this.obstacles.push(obstacle);
        }
    }
    
    validateObstacles(newObstacles) {
        // Check that new obstacles don't overlap with existing ones
        for (const newObstacle of newObstacles) {
            for (const existingObstacle of this.obstacles) {
                if (this.obstaclesOverlap(newObstacle, existingObstacle)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    obstaclesOverlap(obs1, obs2) {
        // Check if two obstacles overlap
        return !(obs1.x + obs1.width < obs2.x || 
                obs2.x + obs2.width < obs1.x || 
                obs1.y + obs1.height < obs2.y || 
                obs2.y + obs2.height < obs1.y);
    }
    
    spawnTurtleToken() {
        const canvasWidth = this.getCanvasWidth();
        const canvasHeight = this.getCanvasHeight();
        
        // Find the most recent obstacle pair to place bonus in their gap
        const safePosition = this.findGapForBonus(canvasWidth, canvasHeight);
        if (safePosition) {
            const token = new TurtleToken(safePosition.x, safePosition.y);
            this.turtleTokens.push(token);
        }
    }
    
    
    findGapForBonus(canvasWidth, canvasHeight) {
        if (this.obstacles.length === 0) return null;
        
        const bonusSize = 30;
        const playerHeight = 40;
        const minGapRequired = playerHeight + 40; // Player + safety margin
        
        // Find the most recent obstacle pair on screen
        const recentObstacles = this.obstacles
            .filter(obs => obs.x > canvasWidth - 100 && obs.x < canvasWidth + 400)
            .sort((a, b) => b.x - a.x); // Sort by X position, newest first
        
        if (recentObstacles.length === 0) {
            return this.createSafeOpenAreaBonus(canvasWidth, canvasHeight);
        }
        
        // Group by X position to find obstacle pairs
        const groups = this.groupObstaclesByX(recentObstacles);
        
        // Find the best gap in the most recent group
        for (const group of groups) {
            const gap = this.findBestGapInGroup(group, canvasHeight, minGapRequired);
            if (gap) {
                return {
                    x: group[0].x + group[0].width / 2, // Center of obstacle width
                    y: gap.centerY
                };
            }
        }
        
        // Fallback: create in completely open space
        return this.createSafeOpenAreaBonus(canvasWidth, canvasHeight);
    }
    
    groupObstaclesByX(obstacles) {
        const groups = [];
        const groupRange = 60; // Pixels to consider as same group
        
        for (const obstacle of obstacles) {
            let foundGroup = false;
            
            for (const group of groups) {
                if (Math.abs(group[0].x - obstacle.x) <= groupRange) {
                    group.push(obstacle);
                    foundGroup = true;
                    break;
                }
            }
            
            if (!foundGroup) {
                groups.push([obstacle]);
            }
        }
        
        // Sort each group by Y position and return only groups with 2+ obstacles
        return groups
            .filter(group => group.length >= 2)
            .map(group => group.sort((a, b) => a.y - b.y));
    }
    
    findBestGapInGroup(group, canvasHeight, minGapRequired) {
        // Look for gaps between obstacles in this group
        for (let i = 0; i < group.length - 1; i++) {
            const topObstacle = group[i];
            const bottomObstacle = group[i + 1];
            
            const gapTop = topObstacle.y + topObstacle.height;
            const gapBottom = bottomObstacle.y;
            const gapSize = gapBottom - gapTop;
            
            // Only use gaps that are large enough for safe passage
            if (gapSize >= minGapRequired) {
                return {
                    centerY: gapTop + gapSize / 2,
                    gapSize: gapSize
                };
            }
        }
        
        // Check gap above first obstacle
        const firstObstacle = group[0];
        if (firstObstacle.y > minGapRequired + 50) {
            return {
                centerY: (50 + firstObstacle.y) / 2,
                gapSize: firstObstacle.y - 50
            };
        }
        
        // Check gap below last obstacle
        const lastObstacle = group[group.length - 1];
        const bottomGap = canvasHeight - 50 - (lastObstacle.y + lastObstacle.height);
        if (bottomGap >= minGapRequired) {
            return {
                centerY: lastObstacle.y + lastObstacle.height + bottomGap / 2,
                gapSize: bottomGap
            };
        }
        
        return null;
    }
    
    createSafeOpenAreaBonus(canvasWidth, canvasHeight) {
        // Create bonus in completely open area away from all obstacles
        const attempts = 20;
        const bonusSize = 30;
        const safeDistance = 80; // Minimum distance from any obstacle
        
        for (let i = 0; i < attempts; i++) {
            const x = canvasWidth + 150 + Math.random() * 200;
            const y = 80 + Math.random() * (canvasHeight - 160);
            
            // Check distance from all obstacles
            let isSafe = true;
            for (const obstacle of this.obstacles) {
                const dx = Math.abs(x - (obstacle.x + obstacle.width / 2));
                const dy = Math.abs(y - (obstacle.y + obstacle.height / 2));
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < safeDistance) {
                    isSafe = false;
                    break;
                }
            }
            
            if (isSafe) {
                return { x, y };
            }
        }
        
        // Ultimate fallback: far right side in middle
        return {
            x: canvasWidth + 300,
            y: canvasHeight / 2
        };
    }
    
    
    render(ctx) {
        // Render obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.render(ctx);
        });
        
        // Render turtle tokens
        this.turtleTokens.forEach(token => {
            token.render(ctx);
        });
    }
    
    renderDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText(`Obstacles: ${this.obstacles.length}`, 10, 30);
        ctx.fillText(`Spawn Timer: ${Math.floor(this.spawnTimer)}`, 10, 45);
        ctx.fillText(`Difficulty: ${this.difficultyRamp.toFixed(2)}`, 10, 60);
        ctx.restore();
    }
    
    checkCollision(player) {
        const playerBounds = player.getBounds();
        
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            const obstacleBounds = obstacle.getBounds();
            
            if (this.isColliding(playerBounds, obstacleBounds)) {
                this.createCollisionEffect(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                return true;
            }
            
            if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
                obstacle.passed = true;
                this.game.updateScore(this.game.obstaclePoints);
                this.playScoreSound();
            }
        }
        
        // Check turtle token collection
        for (const token of this.turtleTokens) {
            if (!token.collected) {
                const tokenBounds = token.getBounds();
                
                if (this.isColliding(playerBounds, tokenBounds)) {
                    token.collected = true;
                    this.game.updateScore(token.value);
                    this.createBonusEffect(token.x + token.width / 2, token.y + token.height / 2, token.value);
                    this.playBonusSound();
                    
                }
            }
        }
        
        return false;
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createCollisionEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            const particle = {
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: '#ff4757',
                size: Math.random() * 4 + 2
            };
            
            if (this.game.player.particles) {
                this.game.player.particles.push(particle);
            }
        }
    }
    
    createBonusEffect(x, y, value) {
        // Create golden particles for bonus collection
        for (let i = 0; i < 20; i++) {
            const particle = {
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2, // Slight upward bias
                life: 40,
                maxLife: 40,
                alpha: 1,
                color: '#f6ff0d',
                size: Math.random() * 3 + 1
            };
            
            if (this.game.player.particles) {
                this.game.player.particles.push(particle);
            }
        }
        
        // Create floating score text
        const scoreText = {
            x: x,
            y: y,
            text: `+${value}`,
            life: 60,
            maxLife: 60,
            alpha: 1,
            vy: -1,
            color: '#f6ff0d'
        };
        
        if (this.game.ui && this.game.ui.floatingTexts) {
            this.game.ui.floatingTexts.push(scoreText);
        }
    }
    
    playScoreSound() {
        const scoreSound = document.getElementById('scoreSound');
        if (scoreSound && scoreSound.play) {
            scoreSound.currentTime = 0;
            scoreSound.play().catch(e => {
                // Audio play failed, which is fine
            });
        }
    }
    
    playBonusSound() {
        // Use dedicated turtle collection sound (keeping apy-collect.mp3 for now)
        const apySound = document.getElementById('apySound');
        if (apySound && apySound.play) {
            apySound.currentTime = 0;
            apySound.play().catch(e => {
                // Audio play failed, which is fine
            });
        }
    }
    
    getClosestObstacle(player) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const obstacle of this.obstacles) {
            const distance = obstacle.x - player.x;
            if (distance > 0 && distance < minDistance) {
                minDistance = distance;
                closest = obstacle;
            }
        }
        
        return closest;
    }
    
    clearObstacles() {
        this.obstacles = [];
    }
}