let debugMode = true;

function setupFloatingControls() {
    const floatingControls = document.getElementById('floatingControls');
    const header = floatingControls.querySelector('.controls-header');
    const minimizeBtn = document.createElement('button');
    
    // Adiciona botão de minimizar
    minimizeBtn.className = 'minimize-btn';
    minimizeBtn.textContent = '_';
    header.insertBefore(minimizeBtn, header.firstChild);
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    // Função para atualizar a posição
    const setTranslate = (xPos, yPos) => {
        floatingControls.style.transform = `translate(${xPos}px, ${yPos}px)`;
    };

    // Eventos de mouse para arrastar
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            setTranslate(currentX, currentY);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });

    // Minimizar/Maximizar
    minimizeBtn.addEventListener('click', () => {
        const content = floatingControls.querySelector('.game-controls');
        content.style.display = content.style.display === 'none' ? 'flex' : 'none';
        minimizeBtn.textContent = content.style.display === 'none' ? '□' : '_';
    });
}

function setupDebugWindow() {
    const debugWindow = document.getElementById('aiDebugWindow');
    const minimizeBtn = document.getElementById('minimizeDebug');

    if (!debugWindow || !minimizeBtn) {
        console.error('Elementos de debug não encontrados');
        return;
    }

    // Configura o botão de minimizar
    minimizeBtn.addEventListener('click', () => {
        debugWindow.classList.toggle('minimized');
        minimizeBtn.textContent = debugWindow.classList.contains('minimized') ? '□' : '_';
    });

    // Resto da configuração da janela de debug...
    const tabs = debugWindow.querySelectorAll('.debug-tab');
    const visionMap = document.getElementById('visionMap');
    const decisionLog = document.getElementById('decisionLog');
    const planningLog = document.getElementById('planningLog');
    
    let currentIA = 1;

    // Alternar entre as IAs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const iaNumber = parseInt(tab.dataset.ia);
            currentIA = iaNumber;
            
            // Atualiza as tabs ativas
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Atualiza o conteúdo do debug
            updateDebugInfo(iaNumber);
        });
    });

    // Atualiza a cada 100ms
    setInterval(() => {
        if (currentIA && !debugWindow.classList.contains('minimized')) {
            updateDebugInfo(currentIA);
        }
    }, 100);

    console.log('Janela de debug configurada com sucesso');
}

function updateDebugInfo(iaNumber) {
    const game = iaNumber === 1 ? window.game1 : window.game2;
    if (!game || !game.ai) return;

    const visionMap = document.getElementById('visionMap');
    const decisionLog = document.getElementById('decisionLog');
    const planningLog = document.getElementById('planningLog');

    // Atualiza mapa de visão
    if (visionMap && game.ai.vision) {
        updateVisionMap(game.ai.vision, visionMap);
    }

    // Atualiza log de decisões
    if (decisionLog) {
        const decision = `[${new Date().toLocaleTimeString()}] Posição: (${game.snake.x}, ${game.snake.y})`;
        addLogEntry(decisionLog, decision);
    }

    // Atualiza log de planejamento
    if (planningLog) {
        const plan = `[${new Date().toLocaleTimeString()}] Estado: ${game.ai.currentState || 'Explorando'}`;
        addLogEntry(planningLog, plan);
    }
}

function updateVisionMap(vision, visionMap) {
    visionMap.innerHTML = '';
    const size = 21;
    const center = Math.floor(size / 2);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.className = 'vision-cell';
            
            // Célula central (posição da cobra)
            if (x === center && y === center) {
                cell.style.backgroundColor = '#00ff00';
            }
            
            visionMap.appendChild(cell);
        }
    }
}

function addLogEntry(logElement, text) {
    const entry = document.createElement('div');
    entry.textContent = text;
    logElement.insertBefore(entry, logElement.firstChild);

    // Limita o número de entradas
    while (logElement.children.length > 10) {
        logElement.removeChild(logElement.lastChild);
    }
}

function setupGodAIWindow() {
    console.log('Configurando janela da God AI...');
    
    const godAiWindow = document.getElementById('godAiWindow');
    if (!godAiWindow) {
        console.error('Janela da God AI não encontrada!');
        return;
    }

    const header = godAiWindow.querySelector('.god-ai-header');
    const minimizeBtn = document.getElementById('minimizeGodAi');
    const activateBtn = document.getElementById('activateGodAi');
    const deactivateBtn = document.getElementById('deactivateGodAi');
    const chatInput = document.getElementById('godAiInput');
    const sendBtn = document.getElementById('godAiSend');

    console.log('Elementos encontrados:', {
        header: !!header,
        minimizeBtn: !!minimizeBtn,
        activateBtn: !!activateBtn,
        deactivateBtn: !!deactivateBtn,
        chatInput: !!chatInput,
        sendBtn: !!sendBtn
    });

    // Variáveis para arrastar
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX;
    let initialY;

    // Função para atualizar a posição
    const setTranslate = (xPos, yPos) => {
        godAiWindow.style.transform = `translate(${xPos}px, ${yPos}px)`;
    };

    // Eventos para arrastar
    if (header) {
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                setTranslate(currentX, currentY);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    }

    // Minimizar/Maximizar
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            godAiWindow.classList.toggle('minimized');
            minimizeBtn.textContent = godAiWindow.classList.contains('minimized') ? '□' : '_';
        });
    }

    // Botões de ativar/desativar
    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            console.log('Clique no botão ativar');
            if (window.godAI) {
                window.godAI.activate();
            }
        });
    }

    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', () => {
            console.log('Clique no botão desativar');
            if (window.godAI) {
                window.godAI.deactivate();
            }
        });
    }

    // Chat
    if (chatInput && sendBtn) {
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message && window.godAI) {
                window.godAI.processUserMessage(message);
                chatInput.value = '';
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Atualiza a barra de dificuldade
    const updateDifficultyBar = () => {
        const difficultyLevel = document.getElementById('difficultyLevel');
        if (window.godAI && difficultyLevel) {
            const difficulty = window.godAI.difficultyLevel * 100;
            difficultyLevel.style.width = `${difficulty}%`;
        }
    };

    // Atualiza a cada 100ms
    setInterval(updateDifficultyBar, 100);

    console.log('Configuração da janela da God AI concluída');
}

function setupDraggableWindows() {
    const windows = [
        {
            element: document.getElementById('godAiWindow'),
            header: document.querySelector('.god-ai-header'),
            minimizeBtn: document.getElementById('minimizeGodAi')
        },
        {
            element: document.getElementById('aiDebugWindow'),
            header: document.querySelector('.debug-header'),
            minimizeBtn: document.getElementById('minimizeDebug')
        }
    ];

    windows.forEach(win => {
        if (!win.element || !win.header || !win.minimizeBtn) return;

        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX;
        let initialY;

        // Configuração de minimizar
        win.minimizeBtn.addEventListener('click', () => {
            win.element.classList.toggle('minimized');
            win.minimizeBtn.textContent = win.element.classList.contains('minimized') ? '□' : '_';
        });

        // Configuração de arrastar
        win.header.addEventListener('mousedown', (e) => {
            if (e.target === win.minimizeBtn) return;
            
            isDragging = true;
            
            // Se for o primeiro arrasto da God AI, ajusta a posição inicial
            if (win.element.id === 'godAiWindow' && !win.element.dataset.dragged) {
                win.element.style.top = '50%';
                win.element.style.left = '50%';
                win.element.style.transform = 'none';
                const rect = win.element.getBoundingClientRect();
                currentX = rect.left;
                currentY = rect.top;
                win.element.dataset.dragged = 'true';
            }
            
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            win.header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            win.element.style.transform = 'none';
            win.element.style.top = `${currentY}px`;
            win.element.style.left = `${currentX}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            win.header.style.cursor = 'grab';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os jogos
    window.game1 = new Game('gameCanvas1');
    window.game2 = new Game('gameCanvas2');

    // Conecta os jogos entre si
    game1.connectGames(game2);
    game2.connectGames(game1);

    // Configura os botões de IA
    const aiBtn1 = document.getElementById('aiBtn1');
    const aiBtn2 = document.getElementById('aiBtn2');

    aiBtn1.addEventListener('click', () => {
        game1.toggleAI();
        aiBtn1.classList.toggle('ai-active');
    });

    aiBtn2.addEventListener('click', () => {
        game2.toggleAI();
        aiBtn2.classList.toggle('ai-active');
    });

    // Configura o botão de iniciar ambos os jogos
    const startBothBtn = document.getElementById('startBothBtn');
    startBothBtn.addEventListener('click', () => {
        if (window.game1 && window.game2) {
            game1.start();
            game2.start();
            startBothBtn.textContent = 'Reiniciar Jogos';
        }
    });

    // Inicializa a God AI
    window.godAI = new GodAI(window.game1, window.game2);

    // Configura todas as janelas flutuantes
    setupFloatingWindows();

    // Inicializa o sistema de súplicas
    window.mercyRequests = new MercyRequests();
});

function setupFloatingWindows() {
    // Configuração das janelas flutuantes
    const windows = [
        {
            window: document.getElementById('chatWindow'),
            header: document.querySelector('.chat-header'),
            minimizeBtn: document.getElementById('minimizeChat')
        },
        {
            window: document.getElementById('aiDebugWindow'),
            header: document.querySelector('.debug-header'),
            minimizeBtn: document.getElementById('minimizeDebug')
        },
        {
            window: document.getElementById('godAiWindow'),
            header: document.querySelector('.god-ai-header'),
            minimizeBtn: document.getElementById('minimizeGodAi')
        }
    ];

    windows.forEach(config => {
        if (!config.window || !config.header || !config.minimizeBtn) {
            console.error('Elementos não encontrados para:', config);
            return;
        }

        // Configuração de minimizar
        config.minimizeBtn.addEventListener('click', () => {
            config.window.classList.toggle('minimized');
            config.minimizeBtn.textContent = config.window.classList.contains('minimized') ? '□' : '_';
        });

        // Configuração de arrastar
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX;
        let initialY;

        config.header.addEventListener('mousedown', (e) => {
            if (e.target === config.minimizeBtn) return;
            
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            config.header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            config.window.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            config.header.style.cursor = 'grab';
        });
    });

    console.log('Janelas flutuantes configuradas com sucesso');

    // Adiciona configuração específica para a janela de debug
    setupDebugWindow();
}

function setupPrompts() {
    // Debug Prompt
    const debugPrompt = document.getElementById('debugPrompt');
    const closeDebug = document.getElementById('closeDebug');
    const debugInfo = document.getElementById('debugInfo');

    closeDebug.addEventListener('click', () => {
        debugPrompt.classList.remove('prompt-show');
    });

    // Mercy Prompt
    const mercyPrompt = document.getElementById('mercyPrompt');
    const closeMercy = document.getElementById('closeMercy');
    const mercyContent = document.getElementById('mercyContent');

    closeMercy.addEventListener('click', () => {
        mercyPrompt.classList.remove('prompt-show');
    });

    // Atualiza informações de debug
    function updateDebugInfo(iaNumber) {
        const game = iaNumber === 1 ? window.game1 : window.game2;
        if (!game || !game.ai) return;

        debugPrompt.classList.add('prompt-show');
        debugInfo.innerHTML = `
            <div class="debug-info">
                <p>Posição: (${game.snake.x}, ${game.snake.y})</p>
                <p>Estado: ${game.ai.currentState || 'Explorando'}</p>
                <p>Pontuação: ${game.score}</p>
            </div>
        `;
    }

    // Atualiza a cada 100ms
    setInterval(() => {
        if (debugPrompt.classList.contains('prompt-show')) {
            const activeTab = document.querySelector('.debug-tabs .active');
            if (activeTab) {
                updateDebugInfo(parseInt(activeTab.dataset.ia));
            }
        }
    }, 100);

    return {
        showMercyPrompt: (request) => {
            mercyPrompt.classList.add('prompt-show');
            mercyContent.innerHTML = `
                <p>A cobra ${request.snakeId} implora por ajuda!</p>
                <p>Motivo: ${request.reason}</p>
                <p>Severidade: ${request.severity * 100}%</p>
            `;
        }
    };
} 