class VisionSystem {
    constructor(game) {
        this.game = game;
        this.viewDistance = 10;
        this.detectionPrecision = 1;
    }

    look(dirX, dirY) {
        let distance = 1;
        let x = this.game.snake.x + dirX;
        let y = this.game.snake.y + dirY;
        
        while (x >= 0 && x < this.game.tileCount && 
               y >= 0 && y < this.game.tileCount && 
               distance <= this.viewDistance) {
            
            // Verifica obstáculos
            if (this.game.obstacles.has(`${x},${y}`)) {
                return {type: 'obstacle', distance};
            }
            
            // Verifica corpo da cobra
            if (this.game.snake.cells.some(cell => cell.x === x && cell.y === y)) {
                return {type: 'body', distance};
            }
            
            // Verifica comida
            if (x === this.game.food.x && y === this.game.food.y) {
                return {type: 'food', distance};
            }
            
            // Verifica parasitas
            if (this.game.parasites && this.game.parasites.some(p => 
                Math.round(p.x) === x && Math.round(p.y) === y)) {
                return {type: 'parasite', distance};
            }

            x += dirX;
            y += dirY;
            distance++;
        }
        
        return {type: 'wall', distance};
    }

    getDangerMap() {
        const map = Array(this.viewDistance * 2 + 1).fill().map(() => 
            Array(this.viewDistance * 2 + 1).fill(0)
        );

        for (let y = -this.viewDistance; y <= this.viewDistance; y++) {
            for (let x = -this.viewDistance; x <= this.viewDistance; x++) {
                const worldX = this.game.snake.x + x;
                const worldY = this.game.snake.y + y;
                
                if (worldX < 0 || worldX >= this.game.tileCount || 
                    worldY < 0 || worldY >= this.game.tileCount) {
                    map[y + this.viewDistance][x + this.viewDistance] = 1;
                    continue;
                }

                if (this.game.obstacles.has(`${worldX},${worldY}`)) {
                    map[y + this.viewDistance][x + this.viewDistance] = 1;
                }

                if (this.game.snake.cells.some(cell => 
                    cell.x === worldX && cell.y === worldY)) {
                    map[y + this.viewDistance][x + this.viewDistance] = 1;
                }

                if (this.game.parasites && this.game.parasites.some(p => 
                    Math.round(p.x) === worldX && Math.round(p.y) === worldY)) {
                    map[y + this.viewDistance][x + this.viewDistance] = 2;
                }
            }
        }

        return map;
    }
}

class SnakeAI {
    constructor(game) {
        this.game = game;
        this.vision = new VisionSystem(game);
        this.isActive = false;
        this.thinkingInterval = null;
        this.moveCount = 0;
        
        // Sistema de análise e memória
        this.memory = {
            shortTerm: [],
            longTerm: [],
            traumaticEvents: [],
            successfulStrategies: new Map(),
            failedAttempts: new Map()
        };

        // Adiciona configurações de fuga
        this.fleeConfig = {
            parasiteDetectionRange: 8,  // Distância para detectar parasitas
            minSafeDistance: 5,         // Distância mínima segura do parasita
            panicMode: false            // Indica se está fugindo de um parasita
        };
    }

    makeDecision() {
        if (!this.isActive) return;

        // Primeiro, verifica se há parasitas próximos
        const nearestParasite = this.findNearestParasite();
        
        if (nearestParasite) {
            // Se encontrou parasita próximo, entra em modo de fuga
            this.fleeFromParasite(nearestParasite);
            return;
        }

        // Se não há parasitas, continua com o comportamento normal
        const path = this.findPathToFood();
        if (path && path.length > 1) {
            const nextStep = path[1];
            const direction = this.getDirectionFromPath(nextStep);
            
            if (this.isSafeDirection(direction)) {
                this.game.changeDirection(direction);
            }
        } else {
            this.findSafeDirection();
        }
    }

    findNearestParasite() {
        if (!this.game.parasites) return null;

        let nearestParasite = null;
        let minDistance = Infinity;

        this.game.parasites.forEach(parasite => {
            if (parasite.active) {
                const distance = Math.sqrt(
                    Math.pow(parasite.x - this.game.snake.x, 2) + 
                    Math.pow(parasite.y - this.game.snake.y, 2)
                );

                if (distance < this.fleeConfig.parasiteDetectionRange && distance < minDistance) {
                    nearestParasite = {
                        parasite: parasite,
                        distance: distance
                    };
                    minDistance = distance;
                }
            }
        });

        return nearestParasite;
    }

    fleeFromParasite(parasiteInfo) {
        // Ativa modo pânico
        this.fleeConfig.panicMode = true;

        // Calcula vetor de direção do parasita para a cobra
        const dx = this.game.snake.x - parasiteInfo.parasite.x;
        const dy = this.game.snake.y - parasiteInfo.parasite.y;

        // Lista de possíveis direções de fuga, priorizando a direção oposta ao parasita
        const directions = [];

        // Adiciona direção oposta ao parasita como primeira opção
        if (Math.abs(dx) > Math.abs(dy)) {
            // Fuga horizontal
            directions.push(dx > 0 ? 'right' : 'left');
            directions.push(dy > 0 ? 'down' : 'up');
            directions.push(dy <= 0 ? 'down' : 'up');
        } else {
            // Fuga vertical
            directions.push(dy > 0 ? 'down' : 'up');
            directions.push(dx > 0 ? 'right' : 'left');
            directions.push(dx <= 0 ? 'right' : 'left');
        }

        // Tenta cada direção de fuga até encontrar uma segura
        for (const direction of directions) {
            if (this.isSafeEscapeDirection(direction, parasiteInfo.parasite)) {
                this.game.changeDirection(direction);
                return;
            }
        }

        // Se não encontrou direção segura, tenta qualquer direção disponível
        this.findSafeDirection();
    }

    isSafeEscapeDirection(direction, parasite) {
        const nextPos = this.getNextPosition(direction);

        // Verifica se a posição é válida e não tem obstáculos
        if (!this.isSafeDirection(direction)) {
            return false;
        }

        // Calcula se a nova posição aumenta a distância do parasita
        const currentDistance = Math.sqrt(
            Math.pow(this.game.snake.x - parasite.x, 2) + 
            Math.pow(this.game.snake.y - parasite.y, 2)
        );

        const newDistance = Math.sqrt(
            Math.pow(nextPos.x - parasite.x, 2) + 
            Math.pow(nextPos.y - parasite.y, 2)
        );

        // Retorna true se a nova posição aumenta a distância do parasita
        return newDistance > currentDistance;
    }

    // Modifique o método isSafeDirection existente
    isSafeDirection(direction) {
        const nextPos = this.getNextPosition(direction);

        // Verifica colisões básicas
        if (!this.game.isValidMove(nextPos)) {
            return false;
        }

        // Se estiver em modo pânico, considera apenas colisões básicas
        if (this.fleeConfig.panicMode) {
            return true;
        }

        // Verificações adicionais para modo normal
        // ... resto do código existente de verificação de segurança ...

        return true;
    }

    toggle() {
        this.isActive = !this.isActive;
        console.log("IA " + (this.isActive ? "Ativada" : "Desativada"));
        
        if (this.isActive) {
            // Faz uma decisão imediata
            this.makeDecision();
            
            // Inicia o loop de pensamento
            if (!this.thinkingInterval) {
                this.thinkingInterval = setInterval(() => {
                    if (this.isActive && this.game.gameLoop) {
                        this.makeDecision();
                    }
                }, 100);
            }
        } else {
            if (this.thinkingInterval) {
                clearInterval(this.thinkingInterval);
                this.thinkingInterval = null;
            }
        }
    }

    // ... outros métodos permanecem iguais ...

    // Método auxiliar para obter próxima posição
    getNextPosition(direction) {
        const pos = {
            x: this.game.snake.x,
            y: this.game.snake.y
        };

        switch(direction) {
            case 'up': pos.y--; break;
            case 'down': pos.y++; break;
            case 'left': pos.x--; break;
            case 'right': pos.x++; break;
        }

        return pos;
    }

    // Verifica se uma posição causará morte imediata
    willCauseImmediateDeath(pos) {
        // Verifica colisão com paredes
        if (pos.x < 0 || pos.x >= this.game.tileCount ||
            pos.y < 0 || pos.y >= this.game.tileCount) {
            return true;
        }

        // Verifica colisão com obstáculos
        if (this.game.obstacles.has(`${pos.x},${pos.y}`)) {
            return true;
        }

        // Verifica colisão com o próprio corpo
        return this.game.snake.cells.some(cell => 
            cell.x === pos.x && cell.y === pos.y
        );
    }

    // Método para obter vetor direção
    getDirectionVector(direction) {
        switch(direction) {
            case 'up': return {x: 0, y: -1};
            case 'down': return {x: 0, y: 1};
            case 'left': return {x: -1, y: 0};
            case 'right': return {x: 1, y: 0};
            default: return {x: 0, y: 0};
        }
    }

    findPathToFood() {
        const start = {
            x: this.game.snake.x,
            y: this.game.snake.y
        };
        const goal = {
            x: this.game.food.x,
            y: this.game.food.y
        };

        return this.aStarSearch(start, goal);
    }

    aStarSearch(start, goal) {
        const openSet = new Set([JSON.stringify(start)]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(JSON.stringify(start), 0);
        
        const fScore = new Map();
        fScore.set(JSON.stringify(start), this.heuristic(start, goal));

        while (openSet.size > 0) {
            let current = this.getLowestFScore(openSet, fScore);
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(JSON.stringify(current));

            for (const neighbor of this.getNeighbors(current)) {
                const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;

                if (!gScore.has(JSON.stringify(neighbor)) || 
                    tentativeGScore < gScore.get(JSON.stringify(neighbor))) {
                    
                    cameFrom.set(JSON.stringify(neighbor), current);
                    gScore.set(JSON.stringify(neighbor), tentativeGScore);
                    fScore.set(JSON.stringify(neighbor), 
                        tentativeGScore + this.heuristic(neighbor, goal));
                    
                    openSet.add(JSON.stringify(neighbor));
                }
            }
        }

        return null;
    }

    getNeighbors(pos) {
        const neighbors = [];
        const directions = [
            {dx: 0, dy: -1},  // cima
            {dx: 1, dy: 0},   // direita
            {dx: 0, dy: 1},   // baixo
            {dx: -1, dy: 0}   // esquerda
        ];

        for (const dir of directions) {
            const newPos = {
                x: pos.x + dir.dx,
                y: pos.y + dir.dy
            };

            if (this.isValidPosition(newPos)) {
                neighbors.push(newPos);
            }
        }

        return neighbors;
    }

    isValidPosition(pos) {
        // Verifica se está dentro dos limites
        if (pos.x < 0 || pos.x >= this.game.tileCount || 
            pos.y < 0 || pos.y >= this.game.tileCount) {
            return false;
        }

        // Verifica colisão com obstáculos
        if (this.game.obstacles.has(`${pos.x},${pos.y}`)) {
            return false;
        }

        // Verifica colisão com o próprio corpo
        return !this.game.snake.cells.some(cell => 
            cell.x === pos.x && cell.y === pos.y
        );
    }

    heuristic(pos, goal) {
        return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
    }

    getLowestFScore(openSet, fScore) {
        let lowest = Infinity;
        let lowestPos = null;

        for (const posStr of openSet) {
            const score = fScore.get(posStr);
            if (score < lowest) {
                lowest = score;
                lowestPos = JSON.parse(posStr);
            }
        }

        return lowestPos;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentStr = JSON.stringify(current);

        while (cameFrom.has(currentStr)) {
            current = cameFrom.get(currentStr);
            currentStr = JSON.stringify(current);
            path.unshift(current);
        }

        return path;
    }

    getDirectionFromPath(nextPos) {
        const dx = nextPos.x - this.game.snake.x;
        const dy = nextPos.y - this.game.snake.y;

        if (dx > 0) return 'right';
        if (dx < 0) return 'left';
        if (dy > 0) return 'down';
        if (dy < 0) return 'up';
        return null;
    }

    findSafeDirection() {
        const directions = ['up', 'right', 'down', 'left'];
        
        // Primeiro, tenta manter a direção atual se for segura
        const currentDirection = this.getCurrentDirection();
        if (currentDirection && this.isSafeDirection(currentDirection)) {
            return this.game.changeDirection(currentDirection);
        }

        // Se não for seguro, tenta outras direções
        for (const direction of directions) {
            if (this.isSafeDirection(direction)) {
                return this.game.changeDirection(direction);
            }
        }
    }

    getCurrentDirection() {
        const {dx, dy} = this.game.snake;
        if (dx === 1) return 'right';
        if (dx === -1) return 'left';
        if (dy === 1) return 'down';
        if (dy === -1) return 'up';
        return null;
    }
} 