class SnakeChat {
    constructor() {
        this.messages = [];
        this.chatElement = document.getElementById('chatMessages');
        this.chatWindow = document.getElementById('chatWindow');
        this.personalities = {
            snake1: {
                name: "Blue Snake",
                style: "competitiva e arrogante",
                emoji: "💙"
            },
            snake2: {
                name: "Green Snake",
                style: "provocadora e brincalhona",
                emoji: "💚"
            }
        };

        // Frases para diferentes situações
        this.phrases = {
            foodCollected: [
                "Haha! Mais 20 gold pra minha coleção!",
                "Você viu essa jogada?",
                "Muito fácil!",
                "Nem precisei me esforçar",
                "Mais uma comida pra conta!",
                "Essa foi moleza!",
                "Ninguém me segura quando estou com fome!",
                "Gold é vida, gold é tudo!",
                "Mais rico a cada mordida!",
                "Essa comida tava com meu nome!"
            ],
            levelUp: [
                "LEVEL UP! Quero ver me alcançar agora!",
                "Cada vez mais forte!",
                "Evolução constante, baby!", 
                "Mais um level, mais poder!",
                "Agora sim estou ficando poderosa!",
                "Ninguém vai me parar agora!",
                "Subindo de nível como uma verdadeira campeã!",
                "Mais um passo rumo ao topo!",
                "Evolução é meu sobrenome!",
                "Quem disse que o céu é o limite?"
            ],
            death: [
                "Ah não! Foi só um descuido...",
                "Isso não é justo!",
                "Na próxima eu mostro meu verdadeiro poder",
                "Você não vai ter tanta sorte da próxima vez"
            ],
            taunts: [
                "Você não é páreo para mim, amadora!",
                "Patética! Nem consegue me acompanhar!",
                "Desista logo, você nunca vai me alcançar!",
                "Sua incompetência me diverte!",
                "Você chama isso de jogar? Que vergonha!",
                "Nem nos seus melhores sonhos você me vence!",
                "Sua presença aqui é uma perda de tempo!"
            ]
        };
    }

    addMessage(snakeId, type, customMessage = null) {
        const snake = this.personalities[`snake${snakeId}`];
        let message = customMessage;

        if (!customMessage) {
            const phrases = this.phrases[type];
            message = phrases[Math.floor(Math.random() * phrases.length)];
        }

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message snake${snakeId}-message`;
        messageElement.innerHTML = `${snake.emoji} <strong>${snake.name}:</strong> ${message}`;

        this.chatElement.appendChild(messageElement);
        this.chatElement.scrollTop = this.chatElement.scrollHeight;

        // Limita o número de mensagens
        while (this.chatElement.children.length > 50) {
            this.chatElement.removeChild(this.chatElement.firstChild);
        }
    }

    addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message system-message';
        messageElement.innerHTML = `🔧 <i>${message}</i>`;

        this.chatElement.appendChild(messageElement);
        this.chatElement.scrollTop = this.chatElement.scrollHeight;
    }

    // Métodos para diferentes tipos de interações
    onFoodCollected(snakeId, gold) {
        this.addMessage(snakeId, 'foodCollected');
        if (Math.random() < 0.3) { // 30% de chance de provocar
            setTimeout(() => {
                const otherId = snakeId === 1 ? 2 : 1;
                this.addMessage(otherId, 'taunts');
            }, 1000);
        }
    }

    onLevelUp(snakeId, level) {
        this.addMessage(snakeId, 'levelUp');
        this.addSystemMessage(`Snake ${snakeId} alcançou o nível ${level}!`);
    }

    onDeath(snakeId, gold) {
        this.addMessage(snakeId, 'death');
        this.addSystemMessage(`Snake ${snakeId} morreu com ${gold} gold!`);
        
        const otherId = snakeId === 1 ? 2 : 1;
        setTimeout(() => {
            this.addMessage(otherId, 'taunts');
        }, 1000);
    }

    onObstacleAvoid(snakeId) {
        if (Math.random() < 0.2) { // 20% de chance de comentar
            this.addMessage(snakeId, null, "Essa foi por pouco! 😅");
        }
    }

    onParasiteSpotted(snakeId) {
        this.addMessage(snakeId, null, "Cuidado! Parasita à vista! 🦠");
    }

    onParasiteHit(snakeId, goldLost) {
        this.addMessage(snakeId, null, `Droga! Perdi ${goldLost} gold! 😠`);
        const otherId = snakeId === 1 ? 2 : 1;
        setTimeout(() => {
            this.addMessage(otherId, null, "HAHAHAHA! Bem feito! 😈");
        }, 1000);
    }
} 