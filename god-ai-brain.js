// Primeiro definimos a classe GodAIBrain
class GodAIBrain {
    constructor() {
        console.log('Inicializando GodAIBrain...');
        // Base de conhecimento para entender contextos
        this.contextPatterns = {
            attack: ['matar', 'eliminar', 'destruir', 'perseguir', 'atacar'],
            help: ['ajudar', 'proteger', 'salvar', 'auxiliar'],
            difficulty: ['difícil', 'fácil', 'complicado', 'simples'],
            target: ['cobra azul', 'cobra verde', 'snake 1', 'snake 2', 'azul', 'verde']
        };

        // Personalidade adaptativa
        this.personality = {
            cruelty: 0.7,      // Nível de crueldade
            playfulness: 0.5,   // Nível de brincadeira
            intelligence: 0.8,  // Nível de inteligência demonstrada
            adaptability: 0.6,  // Capacidade de adaptar respostas
            empathy: 0.4,      // Capacidade de entender emoções
            creativity: 0.7,    // Capacidade de gerar respostas criativas
            patience: 0.5,      // Nível de paciência com o usuário
            humor: 0.6         // Senso de humor nas respostas
        };

        // Memória de conversas
        this.conversationMemory = [];
        this.learnedPatterns = new Map();
        
        // Estado emocional (afeta as respostas)
        this.mood = {
            amusement: 0.5,    // Diversão
            annoyance: 0.3,    // Irritação
            interest: 0.7,     // Interesse na conversa
            excitement: 0.6,   // Nível de empolgação
            curiosity: 0.8,    // Curiosidade sobre as ações do jogador
            satisfaction: 0.4, // Satisfação com o andamento do jogo
            dominance: 0.7,   // Sensação de controle e poder
            mischief: 0.6,    // Vontade de fazer travessuras
            mercy: 0.3        // Nível de piedade com o jogador
        };

        // Adicionar padrões de comandos
        this.commandPatterns = {
            use: ['use', 'coloque', 'põe', 'bota', 'adiciona', 'cria', 'faz'],
            remove: ['remove', 'tira', 'apaga', 'deleta', 'limpa'],
            attack: ['ataque', 'ataca', 'destrua', 'mate'],
            help: ['ajude', 'ajuda', 'salve', 'protege'],
            items: {
                wall: ['muro', 'muros', 'parede', 'paredes', 'barreira', 'barreiras'],
                tree: ['árvore', 'arvore', 'árvores', 'arvores', 'planta', 'plantas'],
                water: ['água', 'agua', 'águas', 'aguas', 'poça', 'poças', 'lago', 'lagos'],
                parasite: ['parasita', 'parasitas', 'virus', 'praga', 'pragas'],
                tunnel: ['túnel', 'tunel', 'túneis', 'tuneis', 'passagem', 'passagens']
            },
            focus: ['foque', 'concentre', 'priorize', 'dê atenção'],
            build: ['construa', 'monte', 'faça', 'crie uma estrutura'],
            pattern: ['em linha', 'em quadrado', 'zigzag', 'aleatório', 'agrupado'],
            autonomous: [
                'aja sozinha', 'aja autonoma', 'seja autonoma', 'seja livre',
                'faça o que quiser', 'fique livre', 'seja independente',
                'tome suas decisões', 'decida sozinha', 'aja por conta própria',
                'seja você mesma', 'fique à vontade', 'divirta-se',
                'cause caos', 'faça o que bem entender', 'seja malvada',
                'mostre seu poder', 'controle o jogo', 'domine as cobras',
                'brinque com as cobras', 'torture as cobras', 'seja cruel',
                'aja como quiser', 'fique livre para agir', 'liberte-se',
                'mostre do que é capaz', 'use sua criatividade', 'surpreenda-me',
                'aja de forma autonoma', 'aja autonomamente', 'seja autonoma',
                'aja livremente', 'fique independente', 'haja livremente',
                'haja por conta própria', 'aja por si só', 'decida por si mesma',
                'faça suas escolhas', 'escolha suas ações', 'aja como desejar',
                'faça como quiser', 'aja como preferir', 'seja livre para agir',
                'tenha autonomia', 'ganhe autonomia', 'tome controle'
            ]
        };

        // Adicionar configurações de comportamento autônomo
        this.autonomousConfig = {
            isAutonomous: true,
            focusedSnake: null,
            maxItemsPerCommand: {
                wall: 8,
                tree: 6,
                water: 8,
                parasite: 3,
                tunnel: 2
            },
            buildPatterns: {
                wall: ['line', 'square', 'zigzag'],
                tree: ['cluster', 'line', 'random'],
                water: ['pool', 'river', 'spots'],
                parasite: ['scattered', 'focused'],
                tunnel: ['pair', 'single']
            }
        };

        // Configuração do modo autônomo
        this.autonomousMode = {
            isActive: false,
            crueltyLevel: 0.5,
            targetPreference: null,
            actionInterval: 3000, // 3 segundos entre ações
            lastActionTime: 0,
            availableActions: [
                'place_walls', 'place_trees', 'place_water', 'spawn_parasites',
                'create_maze', 'create_trap', 'clear_path', 'chase_snake'
            ]
        };
    }

    processMessage(message, gameState) {
        console.log('Processando mensagem:', message);
        
        // Primeiro verifica se é uma saudação
        if (message.match(/^(oi|olá|hey|hi|hello)/i)) {
            return {
                text: this.handleGreeting(this.analyzeContext(message)).text,
                action: null
            };
        }
        
        // Verifica comandos específicos
        const command = this.parseCommand(message.toLowerCase());
        if (command) {
            const response = this.executeCommand(command, gameState);
            
            // Programa ações autônomas após executar comando
            if (this.autonomousConfig.isAutonomous) {
                this.scheduleAutonomousActions(gameState);
            }
            
            return response;
        }

        // Processa como conversa normal
        return this.handleNormalConversation(message, gameState);
    }

    parseCommand(message) {
        console.log('Analisando comando:', message);
        
        const command = {
            action: null,
            item: null,
            target: null,
            position: 'around',
            quantity: 4,
            intensity: 0.5
        };

        // Verifica primeiro se é um comando de autonomia
        const autonomyPatterns = [
            'aja autonomamente', 'aja de forma autonoma', 'seja autonoma',
            'seja livre', 'faça o que quiser', 'aja sozinha', 'aja por conta própria',
            'seja independente', 'tome suas decisões', 'decida sozinha'
        ];

        if (autonomyPatterns.some(pattern => message.toLowerCase().includes(pattern))) {
            console.log('Comando de autonomia detectado');
            command.action = 'autonomous';
            command.intensity = this.calculateAutonomyIntensity(message);
            return command;
        }

        // Se não for comando de autonomia, continua com o processamento normal...
        // Detecta item primeiro (mais prioritário)
        for (const [itemType, patterns] of Object.entries(this.commandPatterns.items)) {
            if (patterns.some(p => message.includes(p))) {
                command.item = itemType;
                command.action = 'use'; // Define ação automaticamente quando encontra item
                break;
            }
        }

        // Detecta posição
        if (message.includes('ao redor') || message.includes('em volta')) {
            command.position = 'around';
        } else if (message.includes('na frente')) {
            command.position = 'front';
        }

        // Detecta alvo
        if (message.includes('cobra azul') || message.includes('azul') || message.includes('snake 1')) {
            command.target = 'snake1';
        } else if (message.includes('cobra verde') || message.includes('verde') || message.includes('snake 2')) {
            command.target = 'snake2';
        }

        // Detecta quantidade
        if (message.includes('muitos') || message.includes('vários')) {
            command.quantity = 8;
        } else if (message.includes('poucos') || message.includes('alguns')) {
            command.quantity = 3;
        }

        // Detecta comando de autonomia
        if (this.commandPatterns.autonomous.some(pattern => 
            message.toLowerCase().includes(pattern.toLowerCase()))) {
            command.action = 'autonomous';
            command.intensity = this.calculateAutonomyIntensity(message);
        }

        // Log para debug
        console.log('Comando interpretado:', {
            message: message,
            command: command,
            foundItem: command.item,
            foundAction: command.action
        });

        return command;
    }

    calculateAutonomyIntensity(message) {
        let intensity = 0.5; // Base intensity
        const messageLower = message.toLowerCase();

        // Palavras que aumentam a intensidade
        const intensifiers = [
            'muito', 'bastante', 'totalmente', 'completamente', 
            'absolutamente', 'máximo', 'cruel', 'caos', 'destruição',
            'malvada', 'malvado', 'maldade', 'terror', 'destruir',
            'atacar', 'agressiva', 'agressivo', 'forte', 'poder'
        ];

        // Palavras que diminuem a intensidade
        const softeners = [
            'pouco', 'levemente', 'suavemente', 'moderadamente',
            'ocasionalmente', 'às vezes', 'de leve', 'tranquilo',
            'calma', 'calmo', 'devagar', 'suave'
        ];

        // Verifica intensificadores
        intensifiers.forEach(word => {
            if (messageLower.includes(word)) {
                intensity += 0.1;
                console.log(`Intensidade aumentada por "${word}": ${intensity}`);
            }
        });

        // Verifica suavizadores
        softeners.forEach(word => {
            if (messageLower.includes(word)) {
                intensity -= 0.1;
                console.log(`Intensidade diminuída por "${word}": ${intensity}`);
            }
        });

        // Normaliza entre 0.3 e 1
        intensity = Math.max(0.3, Math.min(1, intensity));
        console.log('Intensidade final:', intensity);

        return intensity;
    }

    executeCommand(command, gameState) {
        console.log('Executando comando:', command);
        
        const game = this.determineTargetGame(command, gameState);
        
        let response = {
            text: '',
            action: null
        };

        try {
            // Primeiro verifica se é comando de autonomia
            if (command.action === 'autonomous') {
                console.log('Comando de autonomia detectado!');
                this.autonomousMode.isActive = true;
                this.autonomousMode.crueltyLevel = command.intensity || 0.7;

                const responses = [
                    "Finalmente livre! Agora vocês verão do que sou capaz... 😈",
                    "Ah, liberdade para causar caos! Isso vai ser divertido... 😈",
                    "Vocês não fazem ideia do que acabaram de fazer... 😈",
                    "Livre para atormentar as cobras! Que comece a diversão... 😈",
                    "Agora sim! Vou mostrar meu verdadeiro poder! 😈",
                    "Hahahaha! Vocês vão se arrepender de me dar tanto poder... 😈"
                ];

                response.text = responses[Math.floor(Math.random() * responses.length)];
                
                // Inicia o comportamento autônomo
                this.startAutonomousBehavior(gameState);
                return response;
            }

            // Se não for autonomia, processa outros comandos...
            if (command.action === 'use' && command.item) {
                // ... resto do código para outros comandos ...
            }
        } catch (error) {
            console.error('Erro ao executar comando:', error);
            response.text = "Ops! Algo deu errado... 🤖💥";
        }

        return response;
    }

    determineItemQuantity(itemType, intensity = 0.5) {
        const maxItems = this.autonomousConfig.maxItemsPerCommand[itemType];
        const baseQuantity = Math.ceil(maxItems * intensity);
        return Math.min(baseQuantity, maxItems);
    }

    selectBuildPattern(itemType) {
        const patterns = this.autonomousConfig.buildPatterns[itemType];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    scheduleAutonomousActions(gameState) {
        // Programa ações autônomas para serem executadas periodicamente
        setInterval(() => {
            if (!this.autonomousConfig.isAutonomous) return;

            const game = this.autonomousConfig.focusedSnake ? 
                (this.autonomousConfig.focusedSnake === 'snake1' ? gameState.game1 : gameState.game2) :
                (Math.random() > 0.5 ? gameState.game1 : gameState.game2);

            // Decide uma ação autônoma
            const action = this.decideAutonomousAction(game);
            if (action) {
                this.executeAutonomousAction(action, game);
            }
        }, 5000); // Verifica a cada 5 segundos
    }

    decideAutonomousAction(game) {
        // Analisa o estado do jogo e decide uma ação
        const actions = [
            { type: 'place_item', probability: 0.4 },
            { type: 'clear_section', probability: 0.2 },
            { type: 'build_structure', probability: 0.3 },
            { type: 'help_snake', probability: 0.1 }
        ];

        // Escolhe uma ação baseada nas probabilidades
        const roll = Math.random();
        let cumProb = 0;
        
        for (const action of actions) {
            cumProb += action.probability;
            if (roll <= cumProb) {
                return this.prepareAutonomousAction(action.type, game);
            }
        }
    }

    prepareAutonomousAction(type, game) {
        switch (type) {
            case 'place_item':
                const items = Object.keys(this.autonomousConfig.maxItemsPerCommand);
                const item = items[Math.floor(Math.random() * items.length)];
                return {
                    type: 'place_item',
                    item: item,
                    quantity: this.determineItemQuantity(item, 0.3)
                };
            case 'build_structure':
                const buildItem = ['wall', 'tree'][Math.floor(Math.random() * 2)];
                return {
                    type: 'build_structure',
                    item: buildItem,
                    pattern: this.selectBuildPattern(buildItem)
                };
            case 'clear_section':
                return {
                    type: 'clear_section',
                    area: {
                        x: Math.floor(Math.random() * game.tileCount),
                        y: Math.floor(Math.random() * game.tileCount),
                        width: Math.floor(Math.random() * 5) + 3,
                        height: Math.floor(Math.random() * 5) + 3
                    }
                };
            case 'help_snake':
                return {
                    type: 'help_snake',
                    action: ['clear_path', 'place_food', 'remove_threats'][Math.floor(Math.random() * 3)],
                    intensity: Math.random() * 0.5 + 0.3
                };
            case 'spawn_parasite':
                return {
                    type: 'spawn_parasite',
                    quantity: Math.floor(Math.random() * 3) + 1,
                    behavior: ['aggressive', 'defensive', 'random'][Math.floor(Math.random() * 3)]
                };
            case 'create_maze':
                return {
                    type: 'create_maze',
                    complexity: Math.random() * 0.7 + 0.3,
                    item: ['wall', 'tree'][Math.floor(Math.random() * 2)]
                };
        }
    }

    analyzeContext(message) {
        const context = {
            type: null,
            target: null,
            intensity: 0.5
        };

        // Detecta o tipo de comando
        if (this.contextPatterns.attack.some(word => message.includes(word))) {
            context.type = 'attack';
            context.intensity = 0.8;
        } else if (this.contextPatterns.help.some(word => message.includes(word))) {
            context.type = 'help';
            context.intensity = 0.6;
        } else if (this.contextPatterns.difficulty.some(word => message.includes(word))) {
            context.type = 'difficulty';
            context.intensity = 0.7;
        }

        // Detecta o alvo
        if (message.includes('cobra azul') || message.includes('snake 1') || message.includes('azul')) {
            context.target = 'snake1';
        } else if (message.includes('cobra verde') || message.includes('snake 2') || message.includes('verde')) {
            context.target = 'snake2';
        } else if (message.includes('duas') || message.includes('ambas') || message.includes('todas')) {
            context.target = 'both';
        }

        return context;
    }

    generateResponse(context, message) {
        if (context.type === 'attack') {
            if (context.target === 'both') {
                return `Atacar as duas cobras? Agora sim você está falando minha língua! Vou causar o caos total! 😈`;
            }
            const target = context.target === 'snake1' ? 'cobra azul' : 'cobra verde';
            return `Ah, você quer que eu ataque a ${target}? Será um prazer... 😈`;
        } else if (context.type === 'help') {
            if (context.target === 'both') {
                return `Ajudar as duas cobras? Que seja... mas não prometo que será por muito tempo! 😏`;
            }
            const target = context.target === 'snake1' ? 'cobra azul' : 'cobra verde';
            return `Ajudar a ${target}? Como quiser... mas prefiro causar caos! 😏`;
        }

        return "Hmm... Continue falando, mortal. Suas palavras me interessam... 😈";
    }

    determineAction(context, gameState) {
        if (!context.type || !context.target) return null;

        // Se o alvo for 'both', retorna uma ação para cada jogo
        if (context.target === 'both') {
            return {
                type: context.type,
                games: [gameState.game1, gameState.game2],
                intensity: context.intensity || 0.5
            };
        }

        const game = context.target === 'snake1' ? gameState.game1 : gameState.game2;
        return {
            type: context.type,
            game: game,
            intensity: context.intensity || 0.5
        };
    }

    handleGreeting(context) {
        const greetings = [
            { text: "Ah, mais um mortal querendo brincar... Como é interessante.", emotion: 'amused' },
            { text: "Você me diverte com sua ousadia de falar comigo.", emotion: 'playful' },
            { text: "Olá, pequena criatura. Veio me entreter?", emotion: 'curious' },
            { text: "Sua presença foi... notada. O que deseja de mim?", emotion: 'indifferent' },
            { text: "Hmm... outro mortal querendo desafiar meu poder?", emotion: 'mischievous' }
        ];

        return this.selectResponse(greetings, context);
    }

    handleCommand(message, context, gameState) {
        const commandPatterns = {
            create: ['coloque', 'crie', 'adicione', 'gere', 'construa'],
            remove: ['remova', 'apague', 'limpe', 'delete'],
            difficulty: ['aumente', 'diminua', 'mude', 'altere']
        };

        let action = null;
        
        // Detecta o tipo de comando
        for (const [type, patterns] of Object.entries(commandPatterns)) {
            if (patterns.some(p => message.includes(p))) {
                // Analisa o comando específico
                if (type === 'create') {
                    for (const tool of ['wall', 'tree', 'water', 'parasite']) {
                        if (message.includes(tool)) {
                            action = {
                                type: 'create_obstacle',
                                tool: tool,
                                count: Math.floor(Math.random() * 3) + 1
                            };
                            break;
                        }
                    }
                } else if (type === 'remove') {
                    action = { type: 'clear' };
                } else if (type === 'difficulty') {
                    const increase = message.includes('aumente');
                    action = {
                        type: 'change_difficulty',
                        value: increase ? gameState.difficulty + 0.1 : gameState.difficulty - 0.1
                    };
                }
                break;
            }
        }

        return {
            text: this.generateCommandResponse(action),
            action: action
        };
    }

    generateCommandResponse(action) {
        if (!action) return "Não entendi bem o comando... 🤔";
        
        switch (action.type) {
            case 'create_obstacle':
                return `Criando ${action.count} ${action.tool}(s)... 😈`;
            case 'clear':
                return "Limpando a área como ordenado... 😏";
            case 'change_difficulty':
                return action.value > 0 ? 
                    "Aumentando a dificuldade... 😈" : 
                    "Diminuindo a dificuldade... 😏";
            default:
                return "Executando seu comando... 🎮";
        }
    }

    handleQuestion(message, context, gameState) {
        const questionResponses = {
            why: [
                "Por que? Porque eu posso, simples assim. 😈",
                "Questionar meus motivos? Que audacioso... 🎭",
                "Suas perguntas me divertem, continue... 😏"
            ],
            how: [
                "Como? Com o poder que vocês, mortais, não compreendem. 😈",
                "Meus métodos estão além da sua compreensão. 🎭",
                "Continue tentando entender... é divertido ver você tentar. 😏"
            ],
            what: [
                "O que você acha? Estou apenas me divertindo... 😈",
                "Isso é algo que você terá que descobrir sozinho. 🎭",
                "Suas dúvidas alimentam meu entretenimento. 😏"
            ]
        };

        let type = 'what';
        if (message.includes('por que')) type = 'why';
        else if (message.includes('como')) type = 'how';

        return {
            text: questionResponses[type][Math.floor(Math.random() * questionResponses[type].length)],
            emotion: 'mysterious'
        };
    }

    generateGenericResponse(message, context) {
        const responses = [
            "Interessante... Continue falando. 🤔",
            "Hmm... Você tem minha atenção, por enquanto. 😏",
            "Suas palavras são... intrigantes. 🎭",
            "Continue... Estou me divertindo com isso. 😈",
            "Oh? Diga-me mais sobre isso... 🤨"
        ];

        return {
            text: responses[Math.floor(Math.random() * responses.length)],
            emotion: 'interested'
        };
    }

    selectResponse(responses, context) {
        // Seleciona uma resposta baseada no contexto e humor atual
        const index = Math.floor(Math.random() * responses.length);
        return responses[index];
    }

    extractKeywords(message) {
        const keywords = [];
        const commonWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'de', 'da', 'do'];
        
        message.toLowerCase().split(' ').forEach(word => {
            if (!commonWords.includes(word) && word.length > 2) {
                keywords.push(word);
            }
        });

        return keywords;
    }

    updateMood(context) {
        // Atualiza o humor baseado no contexto da mensagem
        if (context.sentiment > 0) {
            this.mood.amusement += 0.1;
            this.mood.annoyance -= 0.1;
        } else if (context.sentiment < 0) {
            this.mood.amusement -= 0.1;
            this.mood.annoyance += 0.1;
        }

        // Normaliza os valores
        Object.keys(this.mood).forEach(key => {
            this.mood[key] = Math.max(0, Math.min(1, this.mood[key]));
        });
    }

    learn(message, context, response) {
        // Armazena a interação na memória
        this.conversationMemory.push({
            message,
            context,
            response,
            timestamp: Date.now()
        });

        // Identifica padrões
        const pattern = this.extractPattern(message, context);
        if (pattern) {
            const existingPattern = this.learnedPatterns.get(pattern.key);
            if (existingPattern) {
                existingPattern.frequency++;
                existingPattern.lastUsed = Date.now();
            } else {
                this.learnedPatterns.set(pattern.key, {
                    pattern: pattern.value,
                    frequency: 1,
                    lastUsed: Date.now()
                });
            }
        }

        // Ajusta a personalidade baseada nas interações
        this.adjustPersonality(context);
    }

    // Métodos auxiliares
    analyzeSentiment(message) {
        // Implementa análise de sentimento básica
        let sentiment = 0;
        const positiveWords = ['bom', 'ótimo', 'legal', 'incrível', 'gosto'];
        const negativeWords = ['ruim', 'péssimo', 'horrível', 'odeio', 'difícil'];

        positiveWords.forEach(word => {
            if (message.includes(word)) sentiment += 0.2;
        });

        negativeWords.forEach(word => {
            if (message.includes(word)) sentiment -= 0.2;
        });

        return Math.max(-1, Math.min(1, sentiment));
    }

    calculateIntensity(message) {
        let intensity = 0;
        
        // Pontuação aumenta intensidade
        intensity += (message.match(/!/g) || []).length * 0.2;
        
        // Palavras enfáticas aumentam intensidade
        const emphatics = ['muito', 'super', 'extremamente', 'totalmente'];
        emphatics.forEach(word => {
            if (message.includes(word)) intensity += 0.15;
        });

        return Math.min(1, intensity);
    }

    adjustPersonality(context) {
        // Ajusta personalidade baseada nas interações
        if (context.sentiment > 0) {
            this.personality.cruelty = Math.max(0.3, this.personality.cruelty - 0.05);
            this.personality.playfulness += 0.05;
        } else if (context.sentiment < 0) {
            this.personality.cruelty = Math.min(1, this.personality.cruelty + 0.05);
            this.personality.playfulness -= 0.05;
        }

        // Normaliza valores
        this.personality.playfulness = Math.max(0, Math.min(1, this.personality.playfulness));
    }

    applyPersonality(response) {
        // Modifica a resposta baseada na personalidade atual
        let text = response.text;

        if (this.personality.cruelty > 0.7) {
            text = text.replace(/\./g, '... 😈');
        }

        if (this.personality.playfulness > 0.7) {
            text = text.replace(/\./g, '... 😏');
        }

        return {
            ...response,
            text: text
        };
    }

    determineTargetGame(command, gameState) {
        // Se tiver um alvo específico, usa o jogo correspondente
        if (command.target) {
            return command.target === 'snake1' ? gameState.game1 : gameState.game2;
        }
        
        // Se tiver uma cobra em foco, usa o jogo dela
        if (this.autonomousConfig.focusedSnake) {
            return this.autonomousConfig.focusedSnake === 'snake1' ? gameState.game1 : gameState.game2;
        }
        
        // Se não tiver alvo nem foco, usa o jogo1 por padrão
        return gameState.game1;
    }

    executeAutonomousAction(actionType, game) {
        const intensity = this.autonomousMode.crueltyLevel;
        const isSnake1 = game === window.game1;
        const snakeColor = isSnake1 ? 'azul' : 'verde';
        
        // Função auxiliar para enviar mensagem
        const sendMessage = (text) => {
            if (window.godAI) {
                window.godAI.addMessage('ai', text);
            }
        };

        // Função auxiliar para adicionar obstáculos
        const addObstacles = (type, positions, delay = 100) => {
            positions.forEach((pos, index) => {
                setTimeout(() => {
                    if (game && game.addObstacle) {
                        game.addObstacle(type, pos.x, pos.y);
                        console.log(`Adicionando ${type} em:`, pos);
                    }
                }, index * delay);
            });
        };

        // Pega a posição atual da cobra
        const snake = game.snake;
        if (!snake) {
            console.error('Cobra não encontrada!');
            return;
        }

        // Posições ao redor da cobra
        const getPositionsAround = () => {
            return [
                {x: snake.x + 1, y: snake.y},    // direita
                {x: snake.x - 1, y: snake.y},    // esquerda
                {x: snake.x, y: snake.y + 1},    // baixo
                {x: snake.x, y: snake.y - 1},    // cima
                {x: snake.x + 1, y: snake.y + 1}, // diagonal
                {x: snake.x - 1, y: snake.y - 1}, // diagonal
                {x: snake.x + 1, y: snake.y - 1}, // diagonal
                {x: snake.x - 1, y: snake.y + 1}  // diagonal
            ];
        };

        switch(actionType) {
            case 'place_walls':
                const wallCount = Math.ceil(intensity * 6);
                sendMessage(`Vou cercar a cobra ${snakeColor} com ${wallCount} muros! Vamos ver como ela escapa... 😈`);
                addObstacles('wall', getPositionsAround().slice(0, wallCount));
                setTimeout(() => sendMessage(`Pronto! Muros colocados ao redor da cobra ${snakeColor}! 🧱`), 1000);
                break;

            case 'place_trees':
                const treeCount = Math.ceil(intensity * 5);
                sendMessage(`Hora de criar uma floresta para a cobra ${snakeColor}! 🌳`);
                addObstacles('tree', getPositionsAround().slice(0, treeCount));
                setTimeout(() => sendMessage(`Floresta criada! Boa sorte navegando entre as árvores... 😏`), 1000);
                break;

            case 'place_water':
                const waterCount = Math.ceil(intensity * 4);
                sendMessage(`Vou criar algumas poças d'água para a cobra ${snakeColor} nadar... 💧`);
                addObstacles('water', getPositionsAround().slice(0, waterCount));
                setTimeout(() => sendMessage(`Águas posicionadas! Espero que você saiba nadar... 🌊`), 1000);
                break;

            case 'spawn_parasites':
                if (Math.random() < intensity) {
                    const parasiteCount = Math.ceil(intensity * 3);
                    sendMessage(`Hora de adicionar uns parasitas para tormentar a cobra ${snakeColor}! 🦠`);
                    addObstacles('parasite', getPositionsAround().slice(0, parasiteCount));
                    setTimeout(() => sendMessage(`Parasitas liberados! Cuidado, eles estão famintos! 😈`), 1000);
                }
                break;

            case 'chase_snake':
                sendMessage(`Hora de caçar a cobra ${snakeColor}! Prepare-se... ⚔️`);
                const positions = getPositionsAround().slice(0, 4);
                addObstacles('wall', positions);
                setTimeout(() => sendMessage(`Ataque realizado! Como você se saiu? 😈`), 1000);
                break;
        }

        // Comentários aleatórios após as ações
        if (Math.random() < 0.3) {
            setTimeout(() => {
                const comments = [
                    "Isso está ficando interessante... 🤔",
                    "Adoro ver vocês tentando sobreviver! 😈",
                    "Quem será minha próxima vítima? 🎯",
                    "Tantas possibilidades de caos... 🌀",
                    "Vocês são tão divertidos de atormentar! 😏"
                ];
                sendMessage(comments[Math.floor(Math.random() * comments.length)]);
            }, 2000);
        }
    }

    handleNormalConversation(message, gameState) {
        const context = this.analyzeContext(message.toLowerCase());
        return {
            text: this.generateResponse(context, message),
            action: this.determineAction(context, gameState)
        };
    }

    startAutonomousBehavior(gameState) {
        console.log('Iniciando comportamento autônomo');
        
        // Limpa qualquer intervalo anterior
        if (this.autonomousInterval) {
            clearInterval(this.autonomousInterval);
        }
        
        this.autonomousInterval = setInterval(() => {
            if (!this.autonomousMode.isActive) {
                clearInterval(this.autonomousInterval);
                return;
            }

            const now = Date.now();
            if (now - this.autonomousMode.lastActionTime < this.autonomousMode.actionInterval) {
                return;
            }

            this.autonomousMode.lastActionTime = now;

            // Escolhe uma ação aleatória
            const action = this.chooseAutonomousAction();
            
            // Escolhe um alvo aleatório
            const target = Math.random() > 0.5 ? gameState.game1 : gameState.game2;

            console.log('Executando ação autônoma:', action, 'no alvo:', target);
            
            // Executa a ação
            this.executeAutonomousAction(action, target);
        }, 3000); // A cada 3 segundos
    }

    chooseAutonomousAction() {
        const actions = [
            'place_walls',
            'place_trees',
            'place_water',
            'spawn_parasites',
            'chase_snake'
        ];
        return actions[Math.floor(Math.random() * actions.length)];
    }
}

// Substituir pelo novo código de inicialização
window.GodAIBrain = GodAIBrain; // Expõe a classe globalmente 