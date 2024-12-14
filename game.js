class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Ajusta o tamanho do canvas para ser quadrado
        const size = Math.min(500, Math.min(window.innerWidth * 0.4, window.innerHeight * 0.7));
        this.canvas.width = size;
        this.canvas.height = size;
        
        this.tileCount = 50;
        this.tileSize = size / this.tileCount;
        
        // Inicializa a cobra com algumas células
        this.snake = {
            x: 15,
            y: 15,
            dx: 1,
            dy: 0,
            cells: [{x: 15, y: 15}, {x: 14, y: 15}, {x: 13, y: 15}, {x: 12, y: 15}],
            maxCells: 4,
            growthCounter: 0
        };
        
        // Inicialização da comida
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        this.gold = 0;
        this.xp = 0;
        this.level = 1;
        this.gameLoop = null;
        
        // Inicializa a IA
        this.ai = new SnakeAI(this);
        this.aiButton = document.getElementById(`aiBtn${canvasId.slice(-1)}`);

        // Adiciona sistema de obstáculos
        this.obstacles = new Map();
        this.currentTool = 'wall';
        this.isDrawing = false;
        this.setupObstacleControls();

        // Atualiza as estatísticas iniciais
        this.updateStats();

        // Inicializa a lista de parasitas (modifique esta parte)
        this.parasites = [];

        // Timer para remover o parasita após 30 segundos quando ele spawnar
        this.parasiteTimer = null;
        this.parasiteTimeLeft = 30;
        this.spawnParasite();

        // Inicializa o chat se ainda não existir
        if (!window.snakeChat) {
            window.snakeChat = new SnakeChat();
        }
        this.chat = window.snakeChat;

        // Adiciona sistema de túneis
        this.tunnels = new Map();
        this.otherGame = null; // Referência ao outro jogo

        // Adiciona sistema de súplicas
        this.mercySystem = window.mercyRequests;
        this.lastMercyRequest = 0; // Timestamp do último pedido
        this.mercyRequestCooldown = 10000; // 10 segundos entre pedidos
    }

    setupObstacleControls() {
        // Eventos do mouse para desenhar obstáculos
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Seletor de ferramentas
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.draw(e);
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        // Corrige o cálculo da posição considerando o scroll e a escala
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.tileSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.tileSize);
        
        // Verifica se a posição está dentro dos limites do canvas
        if (x >= 0 && x < this.tileCount && y >= 0 && y < this.tileCount) {
            const key = `${x},${y}`;

            if (this.currentTool === 'eraser') {
                this.obstacles.delete(key);
                this.tunnels.delete(key);
                if (this.otherGame) {
                    this.otherGame.tunnels.delete(key);
                }
                // Remove também parasitas se houver
                if (this.parasites) {
                    this.parasites = this.parasites.filter(p => p.x !== x || p.y !== y);
                }
            } else if (this.currentTool === 'parasite') {
                // Adiciona um novo parasita
                if (!this.parasites) {
                    this.parasites = [];
                }
                // Remove parasita existente na mesma posição
                this.parasites = this.parasites.filter(p => p.x !== x || p.y !== y);
                // Adiciona novo parasita
                this.parasites.push({
                    x: x,
                    y: y,
                    active: true,
                    timeLeft: 30,
                    speed: 0.8,
                    startTime: Date.now()
                });
            } else if (this.currentTool === 'tunnel') {
                if (!this.tunnels.has(key)) {
                    const tunnel = {
                        x: x,
                        y: y,
                        type: 'tunnel',
                        connectedTo: this.otherGame ? this.otherGame.canvas.id : null
                    };
                    this.tunnels.set(key, tunnel);
                    
                    // Cria o túnel correspondente no outro jogo
                    if (this.otherGame) {
                        this.otherGame.tunnels.set(key, {
                            x: x,
                            y: y,
                            type: 'tunnel',
                            connectedTo: this.canvas.id
                        });
                    }
                }
            } else if (!this.isOccupied(x, y)) {
                this.obstacles.set(key, {
                    type: this.currentTool,
                    x: x,
                    y: y
                });
            }
        }
    }

    isOccupied(x, y) {
        // Verifica se a posição está ocupada pela cobra ou comida
        if (this.food.x === x && this.food.y === y) return true;
        return this.snake.cells.some(cell => cell.x === x && cell.y === y);
    }

    drawObstacles() {
        // Desenha obstáculos normais
        this.obstacles.forEach(obstacle => {
            this.ctx.save();
            switch(obstacle.type) {
                case 'wall':
                    this.ctx.fillStyle = '#8B4513';
                    this.ctx.fillRect(
                        obstacle.x * this.tileSize,
                        obstacle.y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                    break;
                case 'tree':
                    this.ctx.fillStyle = '#228B22';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        obstacle.x * this.tileSize + this.tileSize/2,
                        obstacle.y * this.tileSize + this.tileSize/2,
                        this.tileSize/2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    break;
                case 'water':
                    this.ctx.fillStyle = '#4169E1';
                    this.ctx.fillRect(
                        obstacle.x * this.tileSize,
                        obstacle.y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                    break;
            }
            this.ctx.restore();
        });

        // Desenha parasitas
        if (this.parasites) {
            this.parasites.forEach(parasite => {
                if (parasite.active) {
                    this.ctx.save();
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.shadowColor = '#FF0000';
                    this.ctx.shadowBlur = 15;
                    
                    // Efeito pulsante
                    const pulseSize = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
                    const size = this.tileSize * pulseSize;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(
                        parasite.x * this.tileSize + this.tileSize/2,
                        parasite.y * this.tileSize + this.tileSize/2,
                        size/2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    this.ctx.restore();
                }
            });
        }

        // Desenha túneis
        this.tunnels.forEach(tunnel => {
            this.ctx.save();
            // Gradiente circular para efeito de portal
            const gradient = this.ctx.createRadialGradient(
                tunnel.x * this.tileSize + this.tileSize/2,
                tunnel.y * this.tileSize + this.tileSize/2,
                0,
                tunnel.x * this.tileSize + this.tileSize/2,
                tunnel.y * this.tileSize + this.tileSize/2,
                this.tileSize
            );
            gradient.addColorStop(0, '#4B0082'); // Índigo no centro
            gradient.addColorStop(0.6, '#8A2BE2'); // Violeta
            gradient.addColorStop(1, '#4B0082'); // Índigo na borda

            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#8A2BE2';
            this.ctx.shadowBlur = 15;
            
            // Desenha o portal com animação de rotação
            this.ctx.beginPath();
            this.ctx.arc(
                tunnel.x * this.tileSize + this.tileSize/2,
                tunnel.y * this.tileSize + this.tileSize/2,
                this.tileSize/2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Adiciona efeito de espiral
            const time = Date.now() * 0.003;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2) + time;
                const radius = this.tileSize/3;
                this.ctx.moveTo(
                    tunnel.x * this.tileSize + this.tileSize/2,
                    tunnel.y * this.tileSize + this.tileSize/2
                );
                this.ctx.lineTo(
                    tunnel.x * this.tileSize + this.tileSize/2 + Math.cos(angle) * radius,
                    tunnel.y * this.tileSize + this.tileSize/2 + Math.sin(angle) * radius
                );
            }
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    toggleAI() {
        if (!this.gameLoop) {
            console.log('Inicie o jogo primeiro!');
            return;
        }

        this.ai.toggle();
        const gameNumber = this.canvas.id.slice(-1);
        const aiButton = document.getElementById(`aiBtn${gameNumber}`);
        
        if (this.ai.isActive) {
            aiButton.textContent = `IA ${gameNumber} ON`;
            aiButton.classList.add('ai-active');
            this.chat.addSystemMessage(`IA ${gameNumber} ativada! 🤖`);
        } else {
            aiButton.textContent = `IA ${gameNumber}`;
            aiButton.classList.remove('ai-active');
            this.chat.addSystemMessage(`IA ${gameNumber} desativada! 🔌`);
        }
    }

    // Limpa o canvas
    clear() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Desenha a comida
    drawFood() {
        this.ctx.save();
        this.ctx.fillStyle = '#00f7ff';
        this.ctx.shadowColor = '#00f7ff';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.tileSize + this.tileSize/2,
            this.food.y * this.tileSize + this.tileSize/2,
            this.tileSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.restore();
    }

    // Desenha a cobra com cores diferentes para cada jogo
    drawSnake() {
        this.ctx.save();
        
        // Desenha a cobra principal
        const isBlue = this.canvas.id === 'gameCanvas1';
        this.ctx.fillStyle = isBlue ? '#00f7ff' : '#39FF14';
        this.ctx.shadowColor = isBlue ? '#00f7ff' : '#39FF14';
        this.ctx.shadowBlur = 20;
        
        this.snake.cells.forEach(cell => {
            this.ctx.fillRect(
                cell.x * this.tileSize,
                cell.y * this.tileSize,
                this.tileSize - 1,
                this.tileSize - 1
            );
        });

        // Desenha as cobras visitantes
        if (this.visitors && this.visitors.length > 0) {
            this.visitors.forEach(visitor => {
                this.ctx.fillStyle = visitor.isBlue ? '#00f7ff' : '#39FF14';
                this.ctx.shadowColor = visitor.isBlue ? '#00f7ff' : '#39FF14';
                this.ctx.shadowBlur = 20;
                
                visitor.cells.forEach(cell => {
                    this.ctx.fillRect(
                        cell.x * this.tileSize,
                        cell.y * this.tileSize,
                        this.tileSize - 1,
                        this.tileSize - 1
                    );
                });
            });
        }

        this.ctx.restore();
    }

    // Move a cobra
    moveSnake() {
        // Verifica túnel e teleporte
        const initialNextX = this.snake.x + this.snake.dx;
        const initialNextY = this.snake.y + this.snake.dy;
        const tunnelPos = `${initialNextX},${initialNextY}`;

        // Verifica se há um túnel na próxima posição
        if (this.tunnels.has(tunnelPos) && this.otherGame) {
            const gameNumber = this.canvas.id.slice(-1);
            
            // Cria uma nova cobra no outro jogo mantendo sua IA e comportamento
            const teleportedSnake = {
                x: initialNextX,
                y: initialNextY,
                dx: this.snake.dx,
                dy: this.snake.dy,
                cells: [...this.snake.cells],
                maxCells: this.snake.maxCells,
                growthCounter: this.snake.growthCounter,
                isBlue: gameNumber === '1', // Mantém a identidade da cor
                isVisitor: true, // Marca como cobra visitante
                ai: this.ai // Mantém a mesma IA
            };

            // Adiciona a cobra teleportada ao outro jogo
            if (!this.otherGame.visitors) {
                this.otherGame.visitors = [];
            }
            this.otherGame.visitors.push(teleportedSnake);

            // Remove a cobra do jogo atual
            this.snake.cells = [];
            
            // Notifica o chat sobre o teleporte
            const fromGame = this.canvas.id.slice(-1);
            const toGame = this.otherGame.canvas.id.slice(-1);
            this.chat.addSystemMessage(`Snake ${fromGame} teleportou para a tela ${toGame}! 🌀`);
            
            return;
        }

        // Verifica colisão com obstáculos
        if (this.obstacles.has(tunnelPos)) {
            this.gameOver();
            return;
        }

        // Move a cobra
        this.snake.x += this.snake.dx;
        this.snake.y += this.snake.dy;

        // Wrap around nas bordas
        if (this.snake.x < 0) {
            this.snake.x = this.tileCount - 1;
        } else if (this.snake.x >= this.tileCount) {
            this.snake.x = 0;
        }
        if (this.snake.y < 0) {
            this.snake.y = this.tileCount - 1;
        } else if (this.snake.y >= this.tileCount) {
            this.snake.y = 0;
        }

        // Atualiza o corpo da cobra
        this.snake.cells.unshift({x: this.snake.x, y: this.snake.y});

        // Remove a última célula se necessário
        if (this.snake.cells.length > this.snake.maxCells) {
            this.snake.cells.pop();
        }
    }

    // Verifica colisão com a comida
    checkFoodCollision() {
        if (this.snake.x === this.food.x && this.snake.y === this.food.y) {
            // Incrementa o contador de crescimento
            this.snake.growthCounter++;
            
            // Cresce a cada 3 comidas
            if (this.snake.growthCounter >= 3) {
                this.snake.maxCells++;
                this.snake.growthCounter = 0;
            }
            
            // Aumenta o gold e XP
            this.gold += 20;
            this.xp += 33.33;
            
            // Verifica se subiu de nível
            if (this.xp >= 100) {
                this.levelUp();
            }
            
            // Atualiza a interface
            this.updateStats();
            
            // Nova posição da comida
            this.spawnFood(); // Usa o novo método de spawn

            const gameNumber = this.canvas.id.slice(-1);
            this.chat.onFoodCollected(gameNumber, this.gold);
        }
    }

    // Verifica colisão com o próprio corpo
    checkCollision() {
        // Verifica colisão com obstáculos
        const currentPos = `${this.snake.x},${this.snake.y}`;
        if (this.obstacles.has(currentPos)) {
            return true;
        }

        // Verifica colisão com o próprio corpo
        for (let i = 1; i < this.snake.cells.length; i++) {
            if (this.snake.x === this.snake.cells[i].x && 
                this.snake.y === this.snake.cells[i].y) {
                return true;
            }
        }
        return false;
    }

    // Loop principal do jogo
    update() {
        if (this.ai.isActive) {
            this.ai.makeDecision();
        }
        
        this.moveSnake();
        
        // Atualiza parasitas
        if (this.parasites && this.parasites.length > 0) {
            this.parasites = this.parasites.filter(parasite => {
                if (parasite.active) {
                    this.updateParasitePosition(parasite);
                    this.checkParasiteCollision(parasite);
                    return parasite.active;
                }
                return false;
            });
        }
        
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }

        this.checkFoodCollision();
        
        // Limpa e desenha tudo na ordem correta
        this.clear();
        this.drawFood();
        this.drawSnake(); // Garante que a cobra seja desenhada
        this.drawObstacles(); // Desenha obstáculos e parasitas por último
    }

    // Inicia o jogo
    start() {
        console.log(`Iniciando jogo ${this.canvas.id}...`);

        // Limpa o loop anterior se existir
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        // Reinicia a cobra com algumas células
        this.snake = {
            x: 15,
            y: 15,
            dx: 1,
            dy: 0,
            cells: [{x: 15, y: 15}, {x: 14, y: 15}, {x: 13, y: 15}, {x: 12, y: 15}],
            maxCells: 4,
            growthCounter: 0
        };
        
        // Reinicia valores
        this.gold = 0;
        this.xp = 0;
        this.level = 1;
        this.obstacles = new Map();
        this.parasites = [];

        // Nova posição para a comida
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };

        // Atualiza a interface
        this.updateStats();

        // Força um desenho inicial
        this.clear();
        this.drawFood();
        this.drawSnake();

        // Inicia o loop do jogo
        this.gameLoop = setInterval(() => {
            this.update();
        }, 100);

        console.log(`Jogo ${this.canvas.id} iniciado com sucesso`);
    }

    // Game Over
    gameOver() {
        // Para o loop do jogo
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        const gameNumber = this.canvas.id.slice(-1);
        
        // Desativa a IA se estiver ativa
        if (this.ai.isActive) {
            this.ai.learn(this.calculateFinalScore());
            this.ai.toggle();
            document.getElementById(`aiBtn${gameNumber}`).textContent = 'IA ' + gameNumber;
            document.getElementById(`aiBtn${gameNumber}`).classList.remove('ai-active');
        }
        
        // Cria o botão de reiniciar
        const gameContainer = document.getElementById(`game${gameNumber}`);
        if (gameContainer) {
            // Remove botão anterior se existir
            const existingButton = gameContainer.querySelector('.restart-button');
            if (existingButton) {
                existingButton.remove();
            }

            // Cria novo botão
            const restartButton = document.createElement('button');
            restartButton.className = 'restart-button';
            restartButton.textContent = `Reiniciar Jogo ${gameNumber}`;
            restartButton.onclick = () => {
                restartButton.remove(); // Remove o botão ao clicar
                this.start(); // Reinicia o jogo
            };

            // Adiciona o botão ao container do jogo
            gameContainer.appendChild(restartButton);

            // Adiciona mensagem ao chat
            this.chat.onDeath(gameNumber, this.gold);
            this.chat.addSystemMessage(`Snake ${gameNumber} morreu! Clique no botão para reiniciar.`);
        }
    }

    // Adicione o método restart
    restart() {
        // Remove o botão de reiniciar
        const gameNumber = this.canvas.id.slice(-1);
        const gameContainer = document.getElementById(`game${gameNumber}`);
        const restartButton = gameContainer.querySelector('.restart-button');
        if (restartButton) {
            restartButton.remove();
        }

        // Reinicia apenas este jogo
        this.snake = {
            x: 15,
            y: 15,
            dx: 1,
            dy: 0,
            cells: [{x: 15, y: 15}, {x: 14, y: 15}, {x: 13, y: 15}, {x: 12, y: 15}],
            maxCells: 4,
            growthCounter: 0
        };
        
        // Reinicia valores
        this.gold = 0;
        this.xp = 0;
        this.level = 1;
        this.obstacles = new Map();

        // Nova posição para a comida
        this.spawnFood();

        // Atualiza a interface
        this.updateStats();

        // Inicia o loop do jogo
        this.gameLoop = setInterval(() => this.update(), 100);

        // Notifica o chat
        this.chat.addSystemMessage(`Snake ${gameNumber} reiniciou o jogo! 🔄`);
    }

    // Muda a direção da cobra
    changeDirection(direction) {
        switch(direction) {
            case 'up':
                if (this.snake.dy === 0) {
                    this.snake.dx = 0;
                    this.snake.dy = -1;
                }
                break;
            case 'down':
                if (this.snake.dy === 0) {
                    this.snake.dx = 0;
                    this.snake.dy = 1;
                }
                break;
            case 'left':
                if (this.snake.dx === 0) {
                    this.snake.dx = -1;
                    this.snake.dy = 0;
                }
                break;
            case 'right':
                if (this.snake.dx === 0) {
                    this.snake.dx = 1;
                    this.snake.dy = 0;
                }
                break;
        }
    }

    // Atualiza o método isValidMove para considerar os obstáculos
    isValidMove(pos) {
        return pos.x >= 0 && pos.x < this.tileCount &&
               pos.y >= 0 && pos.y < this.tileCount &&
               !this.obstacles.has(`${pos.x},${pos.y}`) &&
               !this.snake.cells.some(cell => cell.x === pos.x && cell.y === pos.y);
    }

    // Novo método para calcular pontuação final
    calculateFinalScore() {
        return {
            gold: this.gold,
            length: this.snake.cells.length,
            moves: this.ai.moveCount,
            efficiency: this.gold / (this.ai.moveCount || 1)
        };
    }

    // Novo método para subir de nível
    levelUp() {
        this.level++;
        this.xp = 0;
        
        // Benefícios básicos por subir de nível
        this.snake.maxCells += 2;
        
        // Evoluções especiais baseadas no nível
        switch(this.level) {
            case 6: // Mais volume
                this.snake.maxCells += 5;
                this.chat.addSystemMessage(`Snake ${this.canvas.id.slice(-1)} evoluiu: Volume aumentado! 🐍`);
                break;
            
            case 8: // Mais velocidade
                if (this.gameLoop) {
                    clearInterval(this.gameLoop);
                    // Aumenta a velocidade reduzindo o intervalo do loop
                    this.gameLoop = setInterval(() => this.update(), 80);
                }
                this.chat.addSystemMessage(`Snake ${this.canvas.id.slice(-1)} evoluiu: Velocidade aumentada! ⚡`);
                break;
            
            case 10: // Visão mais aguçada
                this.ai.vision.viewDistance = this.tileCount; // Aumenta o alcance da visão
                this.ai.vision.detectionPrecision = 1.5; // Aumenta a precisão da detecção
                this.chat.addSystemMessage(`Snake ${this.canvas.id.slice(-1)} evoluiu: Visão aprimorada! 👁️`);
                break;
            
            case 15: // Previsão de comida
                this.foodPredictionChance = 0.1; // 10% de chance de prever
                this.chat.addSystemMessage(`Snake ${this.canvas.id.slice(-1)} evoluiu: Previsão de comida desbloqueada! 🔮`);
                break;
            
            case 20: // Especialização
                this.showSpecializationChoice();
                break;
        }
        
        // Efeito visual de level up
        this.showLevelUpEffect();
        
        // Atualiza interface
        this.updateStats();

        const gameNumber = this.canvas.id.slice(-1);
        this.chat.onLevelUp(gameNumber, this.level);
    }

    // Atualiza o método showSpecializationChoice para decisão autônoma da IA
    showSpecializationChoice() {
        const gameNumber = this.canvas.id.slice(-1);
        
        // Análise da IA para escolher especialização
        const analysis = {
            speedEfficiency: 0,
            predictionSuccess: 0
        };

        // Analisa últimas 100 jogadas
        const recentMoves = this.ai.memory.slice(-100);
        recentMoves.forEach(move => {
            // Verifica eficiência de velocidade
            if (move.timeToFood && move.timeToFood < 50) {
                analysis.speedEfficiency++;
            }
            // Verifica sucesso em previsões
            if (move.predictedFood && move.foundFood) {
                analysis.predictionSuccess++;
            }
        });

        // IA decide baseada em sua experiência
        let decision;
        if (analysis.speedEfficiency > analysis.predictionSuccess) {
            // Escolhe velocidade se foi mais eficiente com movimentos rápidos
            decision = 'speed';
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), 60);
            }
            this.chat.addSystemMessage(`🤖 Snake ${gameNumber} analisou seu desempenho e escolheu: Especialização em Velocidade! ⚡⚡⚡`);
            this.chat.addSystemMessage(`📊 Análise: Eficiência em velocidade: ${analysis.speedEfficiency}%, Sucesso em previsões: ${analysis.predictionSuccess}%`);
        } else {
            // Escolhe previsão se foi melhor em prever padrões
            decision = 'prediction';
            this.foodPredictionChance = 0.25;
            this.chat.addSystemMessage(`🤖 Snake ${gameNumber} analisou seu desempenho e escolheu: Especialização em Previsão! 🔮✨`);
            this.chat.addSystemMessage(`📊 Análise: Eficiência em velocidade: ${analysis.speedEfficiency}%, Sucesso em previsões: ${analysis.predictionSuccess}%`);
        }

        // Atualiza o comportamento da IA baseado na escolha
        this.ai.updateBehavior(decision);
    }

    // Método para atualizar todas as estatísticas
    updateStats() {
        const gameNumber = this.canvas.id.slice(-1); // Pega o número do jogo (1 ou 2)
        document.getElementById(`gold${gameNumber}`).textContent = this.gold;
        document.getElementById(`xp${gameNumber}`).textContent = Math.floor(this.xp);
        document.getElementById(`level${gameNumber}`).textContent = this.level;
        document.getElementById(`xp-bar${gameNumber}`).style.width = `${this.xp}%`;
    }

    // Efeito visual de level up
    showLevelUpEffect() {
        const gameNumber = this.canvas.id.slice(-1);
        const levelUpText = document.createElement('div');
        levelUpText.className = 'level-up-text';
        levelUpText.textContent = 'LEVEL UP!';
        document.getElementById(`game${gameNumber}`).appendChild(levelUpText);

        // Remove o elemento após a animação
        setTimeout(() => {
            levelUpText.remove();
        }, 2000);
    }

    // Novo método para spawnar o parasita
    spawnParasite() {
        if (!this.parasites) {
            this.parasites = [];
        }

        // Chance de 30% de spawnar um parasita
        if (Math.random() < 0.3) {
            // Encontra uma posição aleatória longe da cobra
            let x, y;
            do {
                x = Math.floor(Math.random() * this.tileCount);
                y = Math.floor(Math.random() * this.tileCount);
            } while (this.isNearSnake(x, y, 5)); // Mantém distância mínima de 5 tiles da cobra

            this.parasites.push({
                x: x,
                y: y,
                active: true,
                timeLeft: 30,
                speed: 0.2, // Velocidade reduzida para dar chance à cobra
                startTime: Date.now()
            });

            // Notifica no chat
            this.chat.addSystemMessage(`Um parasita apareceu no jogo ${this.canvas.id.slice(-1)}! 🦠`);
        }
    }

    // Adicione este método auxiliar
    isNearSnake(x, y, minDistance) {
        return Math.abs(x - this.snake.x) < minDistance && 
               Math.abs(y - this.snake.y) < minDistance;
    }

    // Atualiza o método de spawn da comida
    spawnFood() {
        const validPositions = this.getValidPositions();
        if (validPositions.length > 0) {
            const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
            this.food.x = pos.x;
            this.food.y = pos.y;

            // Se tem habilidade de previsão, mostra a próxima posição
            if (this.foodPredictionChance && Math.random() < this.foodPredictionChance) {
                const nextValidPositions = validPositions.filter(p => 
                    p.x !== pos.x || p.y !== pos.y
                );
                if (nextValidPositions.length > 0) {
                    const nextPos = nextValidPositions[Math.floor(Math.random() * nextValidPositions.length)];
                    this.showFoodPrediction(nextPos);
                    this.chat.addSystemMessage(`Snake ${this.canvas.id.slice(-1)} previu a próxima comida! 🔮`);
                }
            }
        }
    }

    // Novo método para mostrar previsão de comida
    showFoodPrediction(pos) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(
            pos.x * this.tileSize + this.tileSize/2,
            pos.y * this.tileSize + this.tileSize/2,
            this.tileSize/3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.restore();
    }

    // Método para atualizar posição do parasita
    updateParasitePosition(parasite) {
        if (!parasite.active) return;

        // Calcula a direção para a cobra
        const dx = this.snake.x - parasite.x;
        const dy = this.snake.y - parasite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Normaliza a direção e aplica a velocidade
            const moveX = (dx / distance) * parasite.speed;
            const moveY = (dy / distance) * parasite.speed;

            // Atualiza a posição do parasita
            parasite.x += moveX;
            parasite.y += moveY;
        }

        // Verifica se o tempo do parasita expirou
        const timeElapsed = (Date.now() - parasite.startTime) / 1000;
        if (timeElapsed >= 30) { // 30 segundos
            parasite.active = false;
            return;
        }
    }

    // Método para verificar colisão com parasita
    checkParasiteCollision(parasite) {
        // Calcula a distância entre o parasita e a cabeça da cobra
        const dx = parasite.x - this.snake.x;
        const dy = parasite.y - this.snake.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Se o parasita estiver muito próximo (menos de 1 tile de distância)
        if (distance < 1) {
            this.gold = Math.max(0, this.gold - 100);
            this.updateStats();
            parasite.active = false;

            const gameNumber = this.canvas.id.slice(-1);
            this.chat.onParasiteHit(gameNumber, 100);
        }
    }

    // Atualiza o método de visão para incluir detecção de parasitas
    checkParasiteProximity() {
        if (!this.parasites) return null;
        
        for (const parasite of this.parasites) {
            const dx = parasite.x - this.snake.x;
            const dy = parasite.y - this.snake.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 10) { // Distância de detecção
                return {
                    direction: {
                        x: dx / distance,
                        y: dy / distance
                    },
                    distance: distance
                };
            }
        }
        return null;
    }

    // Método para conectar os jogos
    connectGames(otherGame) {
        this.otherGame = otherGame;
    }

    // Novo método para verificar colisões das cobras visitantes
    checkVisitorCollision(visitor) {
        // Verifica colisão com paredes
        if (visitor.x < 0 || visitor.x >= this.tileCount ||
            visitor.y < 0 || visitor.y >= this.tileCount) {
            return true;
        }

        // Verifica colisão com obstáculos
        const pos = `${visitor.x},${visitor.y}`;
        if (this.obstacles.has(pos)) {
            return true;
        }

        // Verifica colisão com outras cobras
        const collidesWithSnake = this.snake.cells.some(cell => 
            cell.x === visitor.x && cell.y === visitor.y
        );

        return collidesWithSnake;
    }

    addObstacle(type, x, y) {
        console.log('Adicionando obstáculo:', type, 'em:', x, y);
        
        // Verifica se a posição está dentro do canvas
        if (x < 0 || x >= this.tileCount || y < 0 || y >= this.tileCount) {
            console.log('Posição fora do canvas:', x, y);
            return false;
        }

        const key = `${x},${y}`;
        
        // Adiciona o obstáculo ao Map
        this.obstacles.set(key, {
            type: type,
            x: x,
            y: y
        });

        // Força atualização visual
        this.updateObstacles();
        
        console.log('Obstáculo adicionado com sucesso');
        return true;
    }

    updateObstacles() {
        // Limpa o canvas primeiro
        this.clear();
        
        // Redesenha todos os obstáculos
        this.obstacles.forEach((obstacle, key) => {
            const [x, y] = key.split(',').map(Number);
            
            switch(obstacle.type) {
                case 'wall':
                    this.ctx.fillStyle = '#808080';
                    break;
                case 'tree':
                    this.ctx.fillStyle = '#228B22';
                    break;
                case 'water':
                    this.ctx.fillStyle = '#4169E1';
                    break;
                case 'parasite':
                    this.ctx.fillStyle = '#800080';
                    break;
                case 'tunnel':
                    this.ctx.fillStyle = '#8B4513';
                    break;
            }

            this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        });

        // Redesenha outros elementos do jogo
        this.drawFood();
        this.drawSnake();
    }

    checkDifficultSituation() {
        const now = Date.now();
        if (now - this.lastMercyRequest < this.mercyRequestCooldown) return;

        // Verifica situações difíceis
        const surroundingObstacles = this.countSurroundingObstacles();
        const nearbyParasites = this.countNearbyParasites();
        const isTrapped = this.checkIfTrapped();

        // Faz uma súplica se necessário
        if (surroundingObstacles > 5) {
            this.mercySystem.addRequest(this.canvasId.slice(-1), 'obstacle', 0.8);
            this.lastMercyRequest = now;
        } else if (nearbyParasites > 2) {
            this.mercySystem.addRequest(this.canvasId.slice(-1), 'parasite', 0.7);
            this.lastMercyRequest = now;
        } else if (isTrapped) {
            this.mercySystem.addRequest(this.canvasId.slice(-1), 'trapped', 0.9);
            this.lastMercyRequest = now;
        }
    }
}

// Remove o evento de redimensionamento que estava causando problemas
// window.addEventListener('resize', () => {
//     const game = new Game('gameCanvas');
// }); 