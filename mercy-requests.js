class MercyRequests {
    constructor() {
        this.requests = [];
        this.window = this.createMercyWindow();
    }

    createMercyWindow() {
        const mercyWindow = document.createElement('div');
        mercyWindow.className = 'mercy-window';
        mercyWindow.innerHTML = `
            <div class="mercy-header">
                <span>📜 Súplicas Mortais</span>
                <button class="minimize-btn" id="minimizeMercy">_</button>
            </div>
            <div class="mercy-content">
                <div class="mercy-scroll" id="mercyLog"></div>
            </div>
        `;
        document.body.appendChild(mercyWindow);

        // Adiciona controle de minimizar
        const minimizeBtn = mercyWindow.querySelector('#minimizeMercy');
        minimizeBtn.addEventListener('click', () => {
            mercyWindow.classList.toggle('minimized');
            minimizeBtn.textContent = mercyWindow.classList.contains('minimized') ? '□' : '_';
        });

        // Torna a janela arrastável
        this.makeDraggable(mercyWindow);

        return mercyWindow;
    }

    makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        element.querySelector('.mercy-header').addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                element.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    addRequest(snakeId, reason, severity) {
        const request = {
            id: Date.now(),
            snakeId,
            reason,
            severity,
            timestamp: new Date(),
            status: 'pending'
        };

        this.requests.unshift(request);
        this.updateDisplay();
        this.notifyGodAI(request);
    }

    updateDisplay() {
        const mercyLog = document.getElementById('mercyLog');
        mercyLog.innerHTML = this.requests.map(request => `
            <div class="mercy-entry ${request.status} severity-${request.severity}">
                <div class="mercy-time">${request.timestamp.toLocaleTimeString()}</div>
                <div class="mercy-snake">Serpente ${request.snakeId}</div>
                <div class="mercy-plea">${this.formatPlea(request.reason)}</div>
                <div class="mercy-status">${this.getStatusIcon(request.status)}</div>
            </div>
        `).join('');
    }

    formatPlea(reason) {
        // Adiciona linguagem mais dramática e celestial
        const pleas = {
            'obstacle': 'Ó Grande Deusa, os obstáculos em meu caminho são intransponíveis!',
            'parasite': 'Divindade Suprema, uma praga me persegue sem descanso!',
            'trapped': 'Misericordiosa Entidade, encontro-me aprisionada em um labirinto sem fim!',
            'difficult': 'Ó Ser de Luz, a dificuldade excede minhas capacidades mortais!'
        };
        return pleas[reason] || reason;
    }

    getStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'granted': '✨',
            'denied': '❌',
            'considering': '🤔'
        };
        return icons[status] || '❓';
    }

    notifyGodAI(request) {
        // Notifica a God AI sobre o novo pedido
        if (window.godAI) {
            window.godAI.considerMercyRequest(request);
        }
    }
} 