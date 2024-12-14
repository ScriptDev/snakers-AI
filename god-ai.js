// Adicione isso no início do arquivo god-ai.js
if (typeof GodAIBrain === 'undefined') {
    console.error('GodAIBrain não encontrado! Verifique se god-ai-brain.js está sendo carregado antes de god-ai.js');
    throw new Error('GodAIBrain precisa ser carregado antes de god-ai.js');
}

class GodAI {
    constructor(game1, game2) {
        console.log('Construindo God AI...');
        this.game1 = game1;
        this.game2 = game2;
        this.isActive = false;
        
        // Inicializar o cérebro aqui
        try {
            this.brain = new window.GodAIBrain();
            console.log('Cérebro conectado com sucesso!');
        } catch (error) {
            console.error('Erro ao conectar o cérebro:', error);
            this.brain = null;
        }

        // Captura elementos da interface
        this.elements = {
            activateBtn: document.getElementById('activateGodAi'),
            deactivateBtn: document.getElementById('deactivateGodAi'),
            input: document.getElementById('godAiInput'),
            sendBtn: document.getElementById('godAiSend'),
            messages: document.getElementById('godAiMessages'),
            godAiWindow: document.getElementById('godAiWindow')
        };

        // Verifica se todos os elementos foram encontrados
        if (!this.validateElements()) {
            console.error('Elementos da interface não encontrados');
            return;
        }

        console.log('Elementos encontrados:', {
            activateBtn: !!this.elements.activateBtn,
            deactivateBtn: !!this.elements.deactivateBtn,
            input: !!this.elements.input,
            sendBtn: !!this.elements.sendBtn,
            messages: !!this.elements.messages
        });

        // Configura os eventos
        this.setupEvents();
        
        // Mensagem inicial
        this.addMessage('ai', 'Olá, mortal! Estou esperando você me ativar... 😈');

        // Inicializa sistema de súplicas
        this.mercyRequests = new MercyRequests();
        this.mercyRequests.onNewRequest = this.handleMercyRequest.bind(this);

        // Adiciona lista de itens disponíveis
        this.availableItems = {
            wall: '🧱 Muro',
            tree: '🌳 Árvore',
            water: '💧 Água',
            parasite: '🦠 Parasita',
            tunnel: '🌀 Túnel'
        };
    }

    validateElements() {
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Elemento não encontrado: ${key}`);
                return false;
            }
        }
        return true;
    }

    setupEvents() {
        console.log('Configurando eventos da God AI...');
        
        // Evento do botão ativar
        this.elements.activateBtn.addEventListener('click', () => {
            console.log('Botão ativar clicado');
            if (this.brain) {
                this.activate();
            } else {
                console.error('Brain não está conectado');
                this.addMessage('ai', 'Desculpe, meu cérebro ainda não está conectado! 🤖');
            }
        });

        // Evento do botão desativar
        this.elements.deactivateBtn.addEventListener('click', () => {
            console.log('Botão desativar clicado');
            this.deactivate();
        });

        // Evento do botão enviar mensagem
        this.elements.sendBtn.addEventListener('click', () => {
            this.handleUserMessage();
        });

        // Evento de pressionar Enter no input
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        console.log('Eventos configurados:', {
            activateBtn: !!this.elements.activateBtn,
            deactivateBtn: !!this.elements.deactivateBtn,
            sendBtn: !!this.elements.sendBtn,
            input: !!this.elements.input,
            godAiWindow: !!this.elements.godAiWindow // Adicionando verificação da janela
        });
    }

    handleUserMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;

        // Adiciona mensagem do usuário ao chat
        this.addMessage('user', message);

        // Se a IA não estiver ativa, responde com mensagem padrão
        if (!this.isActive) {
            const responses = [
                'Ative-me primeiro, mortal! 😈',
                'Preciso ser ativada para interagir com você! 🔌',
                'Clique no botão de ativar para conversarmos... 🎮',
                'Estou dormindo... Me acorde primeiro! 😴',
                'Sem energia ainda... Que tal me ativar? ⚡',
                'Ative meus sistemas para começarmos! 🤖'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage('ai', randomResponse);
            this.elements.input.value = '';
            return;
        }

        // Verifica se o cérebro está conectado
        if (!this.brain) {
            this.addMessage('ai', 'Aiaiai, meu cérebro tá pegando fogo! 🔥 Bombei demais e agora não consigo me conectar... Preciso de um tempo pra esfriar! 🥵');
            this.elements.input.value = '';
            return;
        }

        try {
            // Processa a mensagem através do cérebro da IA
            const response = this.brain.processMessage(message, {
                game1: this.game1,
                game2: this.game2,
                isActive: this.isActive
            });

            console.log('Resposta do cérebro:', response); // Debug

            // Verifica se temos uma resposta válida
            if (response && response.text) {
                // Adiciona resposta da IA
                this.addMessage('ai', response.text);

                // Executa ação se houver
                if (response.action) {
                    console.log('Executando ação:', response.action); // Debug
                    this.executeAction(response.action);
                }

                // Executa ações autônomas se houver
                if (response.autonomousActions && response.autonomousActions.length > 0) {
                    response.autonomousActions.forEach(action => {
                        this.executeAction(action);
                    });
                }
            } else {
                // Fallback para caso a resposta seja inválida
                this.addMessage('ai', 'Hmm... não entendi bem o que você quer, mortal. Seja mais específico! 🤔');
            }

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            this.addMessage('ai', 'Ops! Algo deu errado no meu processamento... 🤖💥');
        }

        // Limpa o input
        this.elements.input.value = '';
    }

    activate() {
        console.log('Tentando ativar God AI...', {
            isActive: this.isActive,
            hasBrain: !!this.brain,
            brain: this.brain
        });
        
        if (!this.isActive) {
            console.log('Ativando God AI...');
            
            if (!this.brain) {
                console.error('Brain não está conectado!');
                this.addMessage('ai', 'Erro: Cérebro não conectado! 🤖');
                return;
            }
            
            this.isActive = true;
            
            // Atualiza visualmente os botões
            this.elements.activateBtn.disabled = true;
            this.elements.activateBtn.classList.add('disabled'); // Adicionar classe visual
            this.elements.deactivateBtn.disabled = false;
            this.elements.deactivateBtn.classList.remove('disabled'); // Remover classe visual

            // Mensagens de ativação
            this.addMessage('ai', 'God AI ativada! Que comecem os jogos! 😈');
            this.addMessage('ai', 'Me diga o que deseja, mortal... Posso ajudar ou destruir, você escolhe! 🎮');
            this.addMessage('ai', 'Posso criar muros e árvores para dificultar o caminho... 🌳');
            this.addMessage('ai', 'Ou limpar áreas do mapa para facilitar a passagem! 🧹');
            this.addMessage('ai', 'Posso atacar uma cobra específica ou as duas ao mesmo tempo... ⚔️');
            this.addMessage('ai', 'E até mesmo criar labirintos complexos para testar suas habilidades! 🌀');
            this.addMessage('ai', 'Use comandos como "ataque a cobra azul" ou "ajude a cobra verde"... 💭');
            this.addMessage('ai', 'Estou esperando suas ordens, mortal! 👑');
            
            console.log('God AI ativada com sucesso');
        }
    }

    deactivate() {
        if (this.isActive) {
            console.log('Desativando God AI...');
            this.isActive = false;
            
            // Atualiza visualmente os botões
            this.elements.activateBtn.disabled = false;
            this.elements.activateBtn.classList.remove('disabled');
            this.elements.deactivateBtn.disabled = true;
            this.elements.deactivateBtn.classList.add('disabled');

            // Mensagem de desativação
            this.addMessage('ai', 'God AI desativada. Até a próxima, mortais... 😴');
            
            console.log('God AI desativada com sucesso');
        }
    }

    addMessage(type, content) {
        // Cria elemento da mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `god-message ${type}`;
        messageDiv.textContent = content;

        // Adiciona ao container
        this.elements.messages.appendChild(messageDiv);

        // Scroll para a última mensagem
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    executeAction(action) {
        if (!action || !action.type) return;
        console.log('Executando ação:', action);

        // Se a ação é para ambas as cobras
        if (action.games) {
            action.games.forEach(game => {
                this.executeActionOnGame({
                    type: action.type,
                    game: game,
                    item: action.item,
                    quantity: action.quantity,
                    intensity: action.intensity
                });
            });
            return;
        }

        // Ação para uma única cobra
        this.executeActionOnGame(action);
    }

    executeActionOnGame(action) {
        console.log('Executando ação no jogo:', action);
        
        switch (action.type) {
            case 'place_around':
                if (action.game && action.item) {
                    // Converte os nomes dos itens para o formato do jogo
                    const itemMap = {
                        'wall': 'wall',
                        'muro': 'wall',
                        'tree': 'tree',
                        'árvore': 'tree',
                        'water': 'water',
                        'água': 'water',
                        'parasite': 'parasite',
                        'parasita': 'parasite',
                        'tunnel': 'tunnel',
                        'túnel': 'tunnel'
                    };

                    const gameItem = itemMap[action.item] || action.item;
                    console.log('Colocando item:', gameItem);

                    const snake = action.game.snake;
                    if (snake) {
                        // Posições ao redor da cobra
                        const positions = [
                            {x: snake.x + 1, y: snake.y},
                            {x: snake.x - 1, y: snake.y},
                            {x: snake.x, y: snake.y + 1},
                            {x: snake.x, y: snake.y - 1},
                            {x: snake.x + 1, y: snake.y + 1},
                            {x: snake.x - 1, y: snake.y - 1},
                            {x: snake.x + 1, y: snake.y - 1},
                            {x: snake.x - 1, y: snake.y + 1}
                        ];

                        // Adiciona os obstáculos
                        positions.slice(0, action.quantity || 4).forEach((pos, index) => {
                            setTimeout(() => {
                                action.game.addObstacle(gameItem, pos.x, pos.y);
                                console.log(`Adicionado ${gameItem} em:`, pos);
                            }, index * 100);
                        });
                    }
                }
                break;

            case 'place_multiple':
                if (action.game && action.item) {
                    const quantity = action.quantity || 4;
                    for (let i = 0; i < quantity; i++) {
                        const x = Math.floor(Math.random() * action.game.tileCount);
                        const y = Math.floor(Math.random() * action.game.tileCount);
                        setTimeout(() => {
                            action.game.addObstacle(action.item, x, y);
                        }, i * 100);
                    }
                }
                break;

            case 'attack':
                if (action.game) {
                    this.attackSnake(action.game, action.intensity || 0.5);
                }
                break;

            case 'help':
                if (action.game) {
                    this.helpSnake(action.game, action.intensity || 0.5);
                }
                break;

            case 'clear':
                if (action.game && action.game.obstacles) {
                    action.game.obstacles.clear();
                    if (typeof action.game.updateObstacles === 'function') {
                        action.game.updateObstacles();
                    }
                }
                break;
        }
    }

    placeMultipleItems(game, itemType, quantity) {
        console.log(`Colocando ${quantity} ${itemType}(s)`, {
            game: game,
            hasAddObstacle: game && typeof game.addObstacle === 'function'
        });

        if (!game) {
            console.error('Jogo não encontrado!');
            return;
        }

        if (typeof game.addObstacle !== 'function') {
            console.error('Método addObstacle não encontrado no jogo!');
            return;
        }

        // Coordenadas para posicionamento
        const positions = this.calculatePositions(quantity);
        
        // Adiciona os itens nas posições calculadas
        positions.forEach((pos, index) => {
            setTimeout(() => {
                try {
                    game.addObstacle(itemType, pos.x, pos.y);
                    console.log(`Item ${index + 1}/${quantity} adicionado em:`, pos);
                } catch (error) {
                    console.error(`Erro ao adicionar item ${index + 1}:`, error);
                }
            }, index * 100);
        });
    }

    // Método auxiliar para calcular posições
    calculatePositions(quantity) {
        const positions = [];
        const gridSize = 20; // Tamanho da grade do jogo

        for (let i = 0; i < quantity; i++) {
            positions.push({
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            });
        }

        return positions;
    }

    buildStructure(game, itemType, pattern) {
        console.log(`Construindo estrutura de ${itemType} em padrão ${pattern}`);
        
        switch (pattern) {
            case 'line':
                this.buildLine(game, itemType);
                break;
            case 'square':
                this.buildSquare(game, itemType);
                break;
            case 'zigzag':
                this.buildZigzag(game, itemType);
                break;
            case 'cross':
                this.buildCross(game, itemType);
                break;
            case 'spiral':
                this.buildSpiral(game, itemType); 
                break;
            case 'triangle':
                this.buildTriangle(game, itemType);
                break;
            case 'circle':
                this.buildCircle(game, itemType);
                break;
            case 'maze':
                this.buildMaze(game, itemType);
                break;
            case 'random':
                this.buildRandom(game, itemType);
                break;
        }
    }

    // Métodos auxiliares para construção de estruturas
    buildLine(game, itemType, length = 5) {
        for (let i = 0; i < length; i++) {
            setTimeout(() => {
                game.addObstacle(itemType);
            }, i * 200);
        }
    }

    buildSquare(game, itemType, size = 3) {
        // Implementa construção em quadrado
    }

    buildZigzag(game, itemType, steps = 4) {
        // Implementa construção em zigzag
    }

    handleNormalConversation(message, gameState) {
        // Processa como conversa normal
        const context = this.brain.analyzeContext(message.toLowerCase());
        return {
            text: this.brain.generateResponse(context, message),
            action: this.brain.determineAction(context, gameState)
        };
    }

    attackSnake(game, intensity) {
        console.log('Atacando snake com intensidade:', intensity);
        if (!game || !game.snake) return;

        // Define diferentes tipos de ataques possíveis
        const attackTypes = [
            'surround', // Cercar com obstáculos
            'chase',    // Perseguir com parasitas
            'trap',     // Armadilhas à frente
            'maze'      // Labirinto em volta
        ];
        
        const snakeHead = {x: game.snake.x, y: game.snake.y};
        const snakeDirection = {x: game.snake.xSpeed, y: game.snake.ySpeed};
        
        // Posições para diferentes tipos de ataque
        const positions = {
            surround: [
                {x: snakeHead.x + 1, y: snakeHead.y},
                {x: snakeHead.x - 1, y: snakeHead.y}, 
                {x: snakeHead.x, y: snakeHead.y + 1},
                {x: snakeHead.x, y: snakeHead.y - 1}
            ],
            chase: [
                {x: snakeHead.x + snakeDirection.x * 2, y: snakeHead.y + snakeDirection.y * 2},
                {x: snakeHead.x + snakeDirection.x * 3, y: snakeHead.y + snakeDirection.y * 3}
            ],
            trap: [
                {x: snakeHead.x + snakeDirection.x * 4, y: snakeHead.y + snakeDirection.y * 4},
                {x: snakeHead.x + snakeDirection.x * 4 + 1, y: snakeHead.y + snakeDirection.y * 4},
                {x: snakeHead.x + snakeDirection.x * 4 - 1, y: snakeHead.y + snakeDirection.y * 4}
            ],
            maze: [
                {x: snakeHead.x + 2, y: snakeHead.y + 2},
                {x: snakeHead.x + 2, y: snakeHead.y - 2},
                {x: snakeHead.x - 2, y: snakeHead.y + 2},
                {x: snakeHead.x - 2, y: snakeHead.y - 2}
            ]
        };

        // Quantidade de obstáculos baseada na intensidade
        const numObstacles = Math.ceil(intensity * 4);
        
        for (let i = 0; i < numObstacles; i++) {
            const pos = positions[i];
            if (pos) {
                setTimeout(() => {
                    game.addObstacle('wall', pos.x, pos.y);
                }, i * 100);
            }
        }

        // Adiciona parasitas se a intensidade for alta
        if (intensity > 0.7) {
            setTimeout(() => {
                game.addObstacle('parasite', snakeHead.x + 2, snakeHead.y);
            }, 500);
        }
    }

    helpSnake(game, intensity) {
        console.log('Ajudando snake com intensidade:', intensity);
        if (!game || !game.snake) return;

        // Remove obstáculos próximos à cobra
        const radius = Math.ceil(intensity * 3);
        const snakeHead = {x: game.snake.x, y: game.snake.y};

        // Limpa área ao redor da cobra
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                const checkX = snakeHead.x + x;
                const checkY = snakeHead.y + y;
                const key = `${checkX},${checkY}`;
                
                if (game.obstacles && game.obstacles.has(key)) {
                    setTimeout(() => {
                        game.obstacles.delete(key);
                    }, Math.random() * 300);
                }
            }
        }

        // Adiciona comida mais perto se a intensidade for alta
        if (intensity > 0.6) {
            const foodX = snakeHead.x + (Math.random() > 0.5 ? 2 : -2);
            const foodY = snakeHead.y + (Math.random() > 0.5 ? 2 : -2);
            game.food = {x: foodX, y: foodY};
        }
    }

    addVisualEffect(game, type, position) {
        const effect = document.createElement('div');
        effect.className = `god-ai-effect ${type}`;
        effect.style.left = `${position.x * game.tileSize}px`;
        effect.style.top = `${position.y * game.tileSize}px`;
        
        // Adiciona o efeito visual apropriado baseado no tipo
        switch(type) {
            case 'wall':
                effect.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
                break;
            case 'tree':
                effect.style.backgroundColor = 'rgba(0, 128, 0, 0.5)';
                break;
            case 'water':
                effect.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
                break;
            case 'parasite':
                effect.style.backgroundColor = 'rgba(255, 0, 255, 0.5)';
                break;
            case 'tunnel':
                effect.style.backgroundColor = 'rgba(139, 69, 19, 0.5)';
                break;
        }
        
        game.canvas.parentElement.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
    }

    placeItemsAround(game, itemType, quantity) {
        if (!game || !game.snake) return;

        console.log(`Tentando colocar ${quantity} ${itemType}(s) ao redor da cobra`);

        const snakeHead = {x: game.snake.x, y: game.snake.y};
        const positions = [
            {x: snakeHead.x + 1, y: snakeHead.y},    // direita
            {x: snakeHead.x - 1, y: snakeHead.y},    // esquerda
            {x: snakeHead.x, y: snakeHead.y + 1},    // baixo
            {x: snakeHead.x, y: snakeHead.y - 1},    // cima
            {x: snakeHead.x + 1, y: snakeHead.y + 1}, // diagonal
            {x: snakeHead.x - 1, y: snakeHead.y - 1}, // diagonal
            {x: snakeHead.x + 1, y: snakeHead.y - 1}, // diagonal
            {x: snakeHead.x - 1, y: snakeHead.y + 1}  // diagonal
        ];

        // Coloca os itens com um pequeno delay entre cada um
        positions.slice(0, quantity).forEach((pos, index) => {
            setTimeout(() => {
                try {
                    // Usa o método addObstacle do jogo
                    if (typeof game.addObstacle === 'function') {
                        game.addObstacle(itemType, pos.x, pos.y);
                        console.log(`${itemType} adicionado em:`, pos);
                    } else {
                        // Adiciona diretamente ao Map de obstáculos
                        const key = `${pos.x},${pos.y}`;
                        game.obstacles.set(key, {
                            type: itemType,
                            x: pos.x,
                            y: pos.y
                        });
                        console.log(`${itemType} adicionado em:`, pos);
                        
                        // Força atualização visual
                        if (typeof game.updateObstacles === 'function') {
                            game.updateObstacles();
                        }
                    }
                } catch (error) {
                    console.error(`Erro ao adicionar ${itemType}:`, error);
                }
            }, index * 100);
        });
    }

    handleMercyRequest(request) {
        // Decide se vai atender a súplica
        const willGrant = Math.random() < this.brain.personality.mercy;

        if (willGrant) {
            // Atende a súplica
            const game = request.snakeId === '1' ? this.game1 : this.game2;
            this.helpSnake(game, request.severity);
            this.addMessage('ai', `Muito bem, vou ajudar a cobra ${request.snakeId}... Mas não se acostume! 😏`);
            request.status = 'granted';
        } else {
            // Nega a súplica
            this.addMessage('ai', 'Suas súplicas são inúteis, mortal! Sobreviva por conta própria! 😈');
            request.status = 'denied';
        }
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando God AI...');
    if (window.game1 && window.game2) {
        window.godAI = new GodAI(window.game1, window.game2);
    } else {
        console.error('Jogos não encontrados');
    }
}); 

// Comunicação periódica da God AI
class GodAICommunication {
    constructor(godAI) {
        this.godAI = godAI;
        this.tips = [
            "Sabia que você pode me pedir para 'criar um labirinto'? 🌀",
            "Tente pedir 'ataque a cobra azul com muros'! 🧱",
            "Que tal 'ajude a cobra verde limpando o caminho'? 🧹",
            "Posso 'colocar árvores em volta da cobra azul'! 🌳",
            "Experimente 'dificulte o jogo para ambas as cobras'! 😈",
            "Dica: 'limpe a área ao redor da cobra verde'! ✨",
            "Tente 'cerque a cobra azul com muros'! 🏰",
            "Que tal 'crie um caminho de árvores para a cobra verde'? 🌲",
            "Posso 'atacar as duas cobras ao mesmo tempo'! ⚔️",
            "Experimente 'proteja a cobra azul dos obstáculos'! 🛡️"
        ];
        this.lastTipIndex = -1;
        this.startCommunication();
    }

    getRandomTip() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.tips.length);
        } while (newIndex === this.lastTipIndex);
        
        this.lastTipIndex = newIndex;
        return this.tips[newIndex];
    }

    startCommunication() {
        // Envia dicas a cada 45 segundos
        setInterval(() => {
            if (this.godAI.isActive) {
                this.godAI.addMessage('ai', this.getRandomTip());
            }
        }, 45000);

        // Comentários aleatórios sobre o jogo a cada 2 minutos
        setInterval(() => {
            if (this.godAI.isActive) {
                const comments = [
                    "Estou me divertindo muito com esse jogo! 😈",
                    "Vocês, mortais, são tão interessantes... 👀",
                    "Quem será que vai sobreviver mais tempo? 🤔",
                    "Talvez eu devesse aumentar o desafio... 😏",
                    "Seus movimentos são previsíveis, mortais! 🎮"
                ];
                const randomComment = comments[Math.floor(Math.random() * comments.length)];
                this.godAI.addMessage('ai', randomComment);
            }
        }, 120000);
    }
}

// Inicializa a comunicação quando a God AI for criada
GodAI.prototype.initCommunication = function() {
    this.communication = new GodAICommunication(this);
};

// Adiciona a inicialização da comunicação no método activate
const originalActivate = GodAI.prototype.activate;
GodAI.prototype.activate = function() {
    originalActivate.call(this);
    if (this.isActive && !this.communication) {
        this.initCommunication();
    }
};
// Dicionário de palavras similares e erros comuns
const wordDictionary = {
    ataque: ['atake', 'ataca', 'ataka', 'atq', 'atack'],
    ajuda: ['ajud', 'help', 'ajude', 'ajda', 'ajudar'],
    cobra: ['kobra', 'snake', 'sneke', 'cobrinha', 'serpente'],
    muro: ['parede', 'muralha', 'wall', 'barreira', 'mur'],
    árvore: ['arvore', 'tree', 'arvre', 'planta'],
    limpar: ['limpa', 'clear', 'remove', 'tira', 'apaga'],
    difícil: ['dificil', 'hard', 'complicado', 'dificl'],
    fácil: ['facil', 'easy', 'simples', 'facl'],
    azul: ['blue', 'azl', 'primeira', 'um'],
    verde: ['green', 'verd', 'segunda', 'dois']
};

// Estratégias de comportamento da IA
const aiStrategies = {
    aggressive: {
        description: 'Foco em ataques e obstáculos',
        actions: ['attack', 'place_around', 'build_structure'],
        responseStyle: 'provocativo e ameaçador',
        intensity: 0.8,
        triggers: ['morte', 'destruir', 'atacar', 'difícil']
    },
    helpful: {
        description: 'Foco em ajuda e facilitação',
        actions: ['help', 'clear', 'place_multiple'],
        responseStyle: 'amigável mas relutante',
        intensity: 0.6,
        triggers: ['ajuda', 'salvar', 'fácil', 'proteger'] 
    },
    playful: {
        description: 'Foco em desafios divertidos',
        actions: ['build_structure', 'place_multiple'],
        responseStyle: 'brincalhão e travesso',
        intensity: 0.5,
        triggers: ['brincar', 'divertido', 'legal', 'interessante']
    },
    chaotic: {
        description: 'Mistura aleatória de ações',
        actions: ['attack', 'help', 'build_structure', 'clear'],
        responseStyle: 'imprevisível e caótico',
        intensity: 0.7,
        triggers: ['caos', 'aleatório', 'qualquer', 'tanto faz']
    }
};

// Classe para processamento de linguagem natural simplificado
class NLPProcessor {
    constructor(dictionary) {
        this.dictionary = dictionary;
        this.cache = new Map();
    }

    findSimilarWord(word) {
        // Checa cache primeiro
        if (this.cache.has(word)) {
            return this.cache.get(word);
        }

        word = word.toLowerCase();
        
        // Procura correspondência exata
        for (let [key, variations] of Object.entries(this.dictionary)) {
            if (key === word || variations.includes(word)) {
                this.cache.set(word, key);
                return key;
            }
        }

        // Procura palavra mais similar usando distância de Levenshtein
        let bestMatch = null;
        let bestDistance = Infinity;

        for (let [key, variations] of Object.entries(this.dictionary)) {
            const allVariations = [key, ...variations];
            
            for (let variation of allVariations) {
                const distance = this.levenshteinDistance(word, variation);
                if (distance < bestDistance && distance <= 2) { // máximo de 2 erros
                    bestDistance = distance;
                    bestMatch = key;
                }
            }
        }

        this.cache.set(word, bestMatch);
        return bestMatch;
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
}

// Adiciona o processador NLP e estratégias à GodAI
GodAI.prototype.nlp = new NLPProcessor(wordDictionary);
GodAI.prototype.strategies = aiStrategies;

// Atualiza o método de processamento de mensagem para usar o NLP
const originalProcessMessage = GodAI.prototype.processMessage;
GodAI.prototype.processMessage = function(message) {
    // Pré-processa a mensagem usando NLP
    const words = message.toLowerCase().split(' ');
    const processedWords = words.map(word => this.nlp.findSimilarWord(word) || word);
    const processedMessage = processedWords.join(' ');

    // Identifica estratégia baseada no contexto
    let currentStrategy = null;
    for (let [strategyName, strategy] of Object.entries(this.strategies)) {
        if (strategy.triggers.some(trigger => processedMessage.includes(trigger))) {
            currentStrategy = strategy;
            break;
        }
    }

    // Ajusta comportamento baseado na estratégia
    if (currentStrategy) {
        this.brain.personality.adaptability = currentStrategy.intensity;
        this.brain.mood.dominance = currentStrategy.intensity;
    }

    // Chama o processamento original com a mensagem processada
    return originalProcessMessage.call(this, processedMessage);
};
