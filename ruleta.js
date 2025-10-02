// Configuración unificada JSON
let wheelConfig = {
    prizes: [],
    colorPalette: ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'],
    theme: {
        backgroundColor: '#d6005d',
        textColor: '#ffffff'
    },
    consolationColors: {
        backgroundColor: '#000000',
        textColor: '#ffffff'
    },
    audio: {
        volume: 0.7,
        isMuted: false
    },
    display: {
        fullscreen: false
    },
    text: {
        congratsText: 'Felicidades Ganaste un/a:'
    },
    logo: {
        src: 'images/Auto Americana Logo.svg'
    },
    presets: {},
    version: '2.0.0'
};

// Variable para almacenar la configuración completa del JSON
let fullConfig = null;

// Configuración por defecto
const defaultConfig = {
    prizes: [
        { text: 'TANQUE LLENO', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'NEVERA', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'TINTADO', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'NEVERITA', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'US $300', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'US $100', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'ACEITE AUTO', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'ACCESORIO AUTO', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'LAVADO PREMIUM', quantity: 1, isNegative: false, inventory: 3 },
        { text: 'VUELVE A INTENTARLO', quantity: 3, isNegative: true },
        { text: 'MEJOR SUERTE', quantity: 2, isNegative: true },
        { text: 'INTÉNTALO OTRA VEZ', quantity: 4, isNegative: true }
    ],
    colorPalette: ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'],
    theme: {
        backgroundColor: '#d6005d',
        textColor: '#ffffff'
    },
    consolationColors: {
        backgroundColor: '#000000',
        textColor: '#ffffff'
    },
    grandPrizes: [
        {
            enabled: false,
            name: 'iPhone 15 Pro',
            probability: 5,
            colors: {
                backgroundColor: '#ffd700',
                textColor: '#000000'
            }
        }
    ],
    audio: {
        volume: 0.7,
        isMuted: false
    },
    text: {
        congratsText: 'Felicidades Ganaste un/a:'
    },
    logo: {
        src: 'images/Auto Americana Logo.svg'
    },
    presets: {},
    version: '2.0.0'
};

// Variables globales derivadas del JSON
let prizes = [];
let wheelColorPalette = ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'];
let wheelTextColor = '#ffffff';
let negativePrizesBgColor = '#000000';
let negativePrizesTextColor = '#ffffff';

// Variable para controlar guardado automático
let saveTimeout = null;
let isSaving = false;

// Funciones principales para manejar la configuración unificada
async function loadWheelConfig() {
    try {
        const response = await fetch('Conf/wheelCONF.JSON');
        if (response.ok) {
            const data = await response.json();
            fullConfig = data;
            
            // Usar configuración actual o default
            const sourceConfig = data.current || data.default || defaultConfig;
            
            // Cargar configuración
            wheelConfig.prizes = sourceConfig.prizes || [];
            wheelConfig.colorPalette = sourceConfig.colorPalette || ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
            wheelConfig.theme = sourceConfig.theme || defaultConfig.theme;
            wheelConfig.consolationColors = sourceConfig.consolationColors || defaultConfig.consolationColors;
            wheelConfig.audio = sourceConfig.audio || defaultConfig.audio;
            wheelConfig.text = sourceConfig.text || defaultConfig.text;
            wheelConfig.logo = sourceConfig.logo || defaultConfig.logo;
            wheelConfig.grandPrize = sourceConfig.grandPrize || defaultConfig.grandPrize;
            
            // Asegurar que todos los premios reales tengan inventario
            wheelConfig.prizes.forEach(prize => {
                if (!prize.isNegative && prize.inventory === undefined) {
                    prize.inventory = 3;
                }
            });
            
        } else {
            // Usar configuración por defecto
            wheelConfig = { ...defaultConfig };
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
        wheelConfig = { ...defaultConfig };
    }
    
    // Asegurar que todos los premios reales tengan inventario (para casos de error)
    wheelConfig.prizes.forEach(prize => {
        if (!prize.isNegative && prize.inventory === undefined) {
            prize.inventory = 3;
        }
    });
    
    // Sincronizar variables globales
    syncGlobalVariables();
}

function syncGlobalVariables() {
    // Sincronizar variables globales con wheelConfig
    prizes = wheelConfig.prizes || [];
    wheelColorPalette = wheelConfig.colorPalette || ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
    wheelTextColor = wheelConfig.theme?.textColor || '#ffffff';
    negativePrizesBgColor = wheelConfig.consolationColors?.backgroundColor || '#000000';
    negativePrizesTextColor = wheelConfig.consolationColors?.textColor || '#ffffff';
    
    // Actualizar instancia de ruleta si existe
    if (window.wheelInstance) {
        window.wheelInstance.volume = wheelConfig.audio?.volume || 0.7;
        window.wheelInstance.isMuted = wheelConfig.audio?.isMuted || false;
    }
    
}

// Función para distribuir premios con espaciado uniforme de consuelos
function distributePrizesWithConsolationSpacing(prizes) {
    const allPrizes = [];
    
    // Expandir premios según su cantidad
    prizes.forEach(prize => {
        // Para premios reales, verificar inventario
        if (!prize.isNegative) {
            // Solo incluir si hay inventario disponible
            if (prize.inventory > 0) {
                for (let i = 0; i < prize.quantity; i++) {
                    allPrizes.push({
                        text: prize.text,
                        isNegative: prize.isNegative,
                        textColor: '#ffffff',
                        originalPrize: prize // Referencia al premio original para actualizar inventario
                    });
                }
            }
        } else {
            // Premios de consuelo siempre se incluyen
            for (let i = 0; i < prize.quantity; i++) {
                allPrizes.push({
                    text: prize.text,
                    isNegative: prize.isNegative,
                    textColor: wheelConfig.consolationColors.textColor
                });
            }
        }
    });
    
    // Agregar gran premios si están habilitados
    if (wheelConfig.grandPrizes && wheelConfig.grandPrizes.length > 0) {
        wheelConfig.grandPrizes.forEach(grandPrize => {
            if (grandPrize.enabled) {
                // Calcular cuántos gran premios agregar basado en la probabilidad
                const totalPrizes = allPrizes.length;
                const grandPrizeCount = Math.round(totalPrizes * (grandPrize.probability / 100));
                
                // Agregar gran premios (siempre al menos 1 si está habilitado, pero con probabilidad 0% no se puede ganar)
                const actualGrandPrizeCount = Math.max(1, grandPrizeCount);
                
                for (let i = 0; i < actualGrandPrizeCount; i++) {
                    allPrizes.push({
                        text: grandPrize.name,
                        isNegative: false,
                        textColor: grandPrize.colors.textColor,
                        isGrandPrize: true,
                        canWin: grandPrize.probability > 0, // Solo se puede ganar si probabilidad > 0%
                        grandPrizeId: grandPrize.id || Math.random().toString(36).substr(2, 9) // ID único para cada grand prize
                    });
                }
            }
        });
    }
    
    // Separar premios regulares y de consuelo
    const regularPrizes = allPrizes.filter(p => !p.isNegative);
    const consolationPrizes = allPrizes.filter(p => p.isNegative);
    
    // Asignar colores a premios regulares
    const colors = wheelColorPalette.length > 0 ? wheelColorPalette : ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
    regularPrizes.forEach((prize, index) => {
        if (prize.isGrandPrize) {
            // Buscar el grand prize correspondiente para obtener sus colores
            const grandPrize = wheelConfig.grandPrizes.find(gp => gp.name === prize.text);
            if (grandPrize) {
                prize.bgColor = grandPrize.colors.backgroundColor;
            } else {
                // Fallback si no se encuentra el grand prize
                prize.bgColor = '#ffd700';
            }
        } else {
            // Premios regulares usan la paleta de colores
            prize.bgColor = colors[index % colors.length];
        }
    });
    
    // Asignar color negro a premios de consuelo
    consolationPrizes.forEach(prize => {
        prize.bgColor = wheelConfig.consolationColors.backgroundColor;
    });
    
    // Crear array final con distribución inteligente
    const totalSegments = allPrizes.length;
    const finalPrizes = new Array(totalSegments);
    
    if (consolationPrizes.length === 0) {
        // Si no hay premios de consuelo, usar solo premios regulares
        regularPrizes.forEach((prize, index) => {
            finalPrizes[index] = prize;
        });
    } else if (regularPrizes.length === 0) {
        // Si no hay premios regulares, usar solo premios de consuelo
        consolationPrizes.forEach((prize, index) => {
            finalPrizes[index] = prize;
        });
    } else {
        // Calcular espaciado ideal para opciones de consuelo
        const idealSpacing = totalSegments / consolationPrizes.length;
        
        // Colocar opciones de consuelo uniformemente espaciadas
        const consolationPositions = [];
        for (let i = 0; i < consolationPrizes.length; i++) {
            const position = Math.round(i * idealSpacing) % totalSegments;
            consolationPositions.push(position);
        }
        
        // Ordenar posiciones para evitar superposiciones
        consolationPositions.sort((a, b) => a - b);
        
        // Ajustar posiciones si hay superposiciones o están muy cerca
        for (let i = 1; i < consolationPositions.length; i++) {
            let currentPos = consolationPositions[i];
            let prevPos = consolationPositions[i-1];
            
            // Si están muy cerca (menos de 2 posiciones de diferencia), mover la actual
            if (currentPos - prevPos < 2) {
                currentPos = (prevPos + Math.max(2, Math.floor(idealSpacing))) % totalSegments;
                consolationPositions[i] = currentPos;
            }
        }
        
        // Verificar que no haya superposiciones al final
        for (let i = 0; i < consolationPositions.length; i++) {
            for (let j = i + 1; j < consolationPositions.length; j++) {
                if (consolationPositions[i] === consolationPositions[j]) {
                    consolationPositions[j] = (consolationPositions[j] + 1) % totalSegments;
                }
            }
        }
        
        // Colocar premios de consuelo en sus posiciones calculadas
        consolationPrizes.forEach((prize, index) => {
            const position = consolationPositions[index];
            finalPrizes[position] = prize;
        });
        
        // Llenar espacios restantes con premios regulares
        let regularIndex = 0;
        for (let i = 0; i < totalSegments; i++) {
            if (finalPrizes[i] === undefined && regularIndex < regularPrizes.length) {
                finalPrizes[i] = regularPrizes[regularIndex];
                regularIndex++;
            }
        }
    }
    
    // Verificar que no haya consuelos adyacentes (solo en modo debug)
    if (window.location.search.includes('debug=true')) {
        verifyConsolationSpacing(finalPrizes);
    }
    
    return finalPrizes;
}

// Función para detectar si un premio es negativo
function isNegativePrize(text) {
    const negativeKeywords = ['VUELVE A INTENTARLO', 'MEJOR SUERTE', 'INTÉNTALO OTRA VEZ', 'PERDISTE', 'INTENTAR', 'SUERTE', 'CONSUELO'];
    const upperText = text.toUpperCase();
    return negativeKeywords.some(keyword => upperText.includes(keyword));
}

// Función para verificar que no haya consuelos adyacentes
function verifyConsolationSpacing(prizes) {
    const consolationIndices = [];
    prizes.forEach((prize, index) => {
        if (prize.isNegative) {
            consolationIndices.push(index);
        }
    });
    
    // Verificar adyacencia
    for (let i = 0; i < consolationIndices.length - 1; i++) {
        const current = consolationIndices[i];
        const next = consolationIndices[i + 1];
        const diff = Math.abs(next - current);
        
        // Verificar si están adyacentes (considerando wraparound)
        const isAdjacent = diff === 1 || diff === prizes.length - 1;
        
        if (isAdjacent) {
            return false;
        }
    }
    
    return true;
}

// Cargar configuración unificada (asíncrona)
loadWheelConfig().then(() => {
}).catch(error => {
    console.error('❌ Error cargando configuración:', error);
});

class PrizeWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.wheelCenter = document.getElementById('wheelCenter');
        this.modal = document.getElementById('resultModal');
        this.modalPrize = document.getElementById('modalPrize');
        this.modalIcon = document.getElementById('modalIcon');
        this.modalClose = document.getElementById('modalClose');
        
        // Variables de física
        this.currentRotation = 0;
        this.angularVelocity = 0;
        this.friction = 0.988; // Fricción más suave para desaceleración más lenta
        this.isSpinning = false;
        this.lightCounter = 0;
        this.isPlayingWinSound = false;
        this.numLights = 24;
        this.tickFrequency = 1;
        this.hasWon = false;
        this.confettiInterval = null;
        
        // Variables para drag
        this.isDragging = false;
        this.lastDragAngle = 0;
        this.dragVelocity = 0;
        
        // Variables para transición suave del grand prize
        this.justLeftGrandPrize = false;
        this.grandPrizeTransitionFrames = 0;
        
        // Configuración de audio
        this.isMuted = localStorage.getItem('wheelMuted') === 'true' || false;
        this.volume = parseFloat(localStorage.getItem('wheelVolume')) || 0.7;
        
        // AudioContext compartido para mejor rendimiento
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.audioContext = null;
        }
        
        this.setupCanvas();
        this.createTextures();
        this.setupEventListeners();
        this.startAnimation();
    }
    
    // Método público para inicializar después de cargar configuración
    init() {
        this.drawWheel();
    }
    
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 45;
    }
    
    createTextures() {
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCanvas.width = 100;
        this.noiseCanvas.height = 100;
        const noiseCtx = this.noiseCanvas.getContext('2d');
        
        const imageData = noiseCtx.createImageData(100, 100);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 15;
            imageData.data[i] = noise;
            imageData.data[i + 1] = noise;
            imageData.data[i + 2] = noise;
            imageData.data[i + 3] = 30;
        }
        noiseCtx.putImageData(imageData, 0, 0);
        this.noisePattern = this.ctx.createPattern(this.noiseCanvas, 'repeat');
    }
    
    drawWheel() {
        const ctx = this.ctx;
        const rect = this.canvas.getBoundingClientRect();
        
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.currentRotation);
        
        // Borde exterior NEGRO SÓLIDO MUCHO MÁS GRUESO
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 35, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        // Anillo blanco decorativo con luces
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Luces decorativas en el borde blanco - 24 luces fijas
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const x = Math.cos(angle) * (this.radius + 12);
            const y = Math.sin(angle) * (this.radius + 12);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            const lightGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            lightGradient.addColorStop(0, '#ffdd00');
            lightGradient.addColorStop(1, '#ff8800');
            ctx.fillStyle = lightGradient;
            ctx.fill();
        }
        
        // Anillo rojo decorativo
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
        const redGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        redGradient.addColorStop(0, '#cc0000');
        redGradient.addColorStop(0.5, '#aa0000');
        redGradient.addColorStop(1, '#880000');
        ctx.fillStyle = redGradient;
        ctx.fill();
        
        // Usar el nuevo algoritmo de distribución inteligente
        const wheelPrizes = distributePrizesWithConsolationSpacing(wheelConfig.prizes);
        
        // Dibujar segmentos
        const segmentAngle = (Math.PI * 2) / wheelPrizes.length;
        
        // Dibujar todos los segmentos primero
        wheelPrizes.forEach((prize, index) => {
            const startAngle = index * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;
            
            // Usar color del premio directamente
            const prizeColor = prize.bgColor || '#dc143c';
            
            // Dibujar segmento con color sólido
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = prizeColor;
            ctx.fill();
        });
        
        // Restaurar opacidad completa
        ctx.globalAlpha = 1;
        
        // Dibujar todas las líneas divisorias después (para evitar superposiciones)
        const borderWidth = this.radius * 0.015;
        wheelPrizes.forEach((prize, index) => {
            const startAngle = index * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;
            
            // Línea divisoria NEGRA
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(endAngle) * this.radius,
                Math.sin(endAngle) * this.radius
            );
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = borderWidth;
            ctx.lineCap = 'butt';
            ctx.stroke();
            
            // Dibujar texto
            ctx.save();
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = prize.textColor;
            const fontSize = this.radius * 0.08;
            ctx.font = `400 ${fontSize}px "Oswald"`;
            
            const text = prize.text;
            const textRadius = this.radius * 0.65;
            
            ctx.fillText(text, textRadius, 0);
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    setupEventListeners() {
        this.wheelCenter.addEventListener('click', () => this.spin());
        this.modalClose.addEventListener('click', () => this.closeModal());
        
        // Cerrar modal al hacer click en el overlay
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        
        // Drag en el canvas - Mouse
        this.canvas.addEventListener('mousedown', (e) => this.onDragStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.onDragMove(e));
        this.canvas.addEventListener('mouseup', () => this.onDragEnd());
        this.canvas.addEventListener('mouseleave', () => this.onDragEnd());
        
        // Touch para móviles - Optimizado
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.onTouchStart(e.touches[0]);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.onTouchMove(e.touches[0]);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onTouchEnd();
        }, { passive: false });
        
        // Click en el centro para touch
        this.wheelCenter.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.spin();
        }, { passive: false });
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawWheel();
        });
    }
    
    onDragStart(e) {
        if (this.isSpinning) return;
        
        this.isDragging = true;
        this.hasWon = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.centerX;
        const y = e.clientY - rect.top - this.centerY;
        this.lastDragAngle = Math.atan2(y, x);
        this.dragVelocity = 0;
        this.canvas.style.cursor = 'grabbing';
    }
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.centerX;
        const y = e.clientY - rect.top - this.centerY;
        const currentAngle = Math.atan2(y, x);
        
        let deltaAngle = currentAngle - this.lastDragAngle;
        
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        
        this.currentRotation += deltaAngle;
        this.dragVelocity = deltaAngle;
        this.lastDragAngle = currentAngle;
    }
    
    onDragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        
        if (Math.abs(this.dragVelocity) > 0.01) {
            this.angularVelocity = this.dragVelocity * 10;
            this.isSpinning = true;
            this.lightCounter = 0;
        } else {
            this.hasWon = false;
        }
    }
    
    // Métodos optimizados para touch - CON MÁS RESISTENCIA
    onTouchStart(e) {
        if (this.isSpinning) return;
        
        this.isDragging = true;
        this.hasWon = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.centerX;
        const y = e.clientY - rect.top - this.centerY;
        this.lastDragAngle = Math.atan2(y, x);
        this.dragVelocity = 0;
        
        // Resistencia aumentada para touch (menos sensible)
        this.touchSensitivity = 0.6;
    }
    
    onTouchMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.centerX;
        const y = e.clientY - rect.top - this.centerY;
        const currentAngle = Math.atan2(y, x);
        
        let deltaAngle = currentAngle - this.lastDragAngle;
        
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        
        // Aplicar resistencia aumentada para touch (menos sensible)
        deltaAngle *= this.touchSensitivity;
        
        this.currentRotation += deltaAngle;
        this.dragVelocity = deltaAngle;
        this.lastDragAngle = currentAngle;
    }
    
    onTouchEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Umbral más alto para touch (menos sensible)
        if (Math.abs(this.dragVelocity) > 0.02) {
            // Multiplicador reducido para touch (más resistencia)
            this.angularVelocity = this.dragVelocity * 8;
            this.isSpinning = true;
            this.lightCounter = 0;
        } else {
            this.hasWon = false;
        }
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.angularVelocity = 0.35 + Math.random() * 0.25;
        this.isSpinning = true;
        
        this.lightCounter = 0;
        
        gsap.to('.wheel-center-static', {
            scale: 0.9,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
        
        this.playSpinSound();
    }
    
    startAnimation() {
        const animate = () => {
            if (this.isSpinning) {
                this.angularVelocity *= this.friction;
                this.currentRotation += this.angularVelocity;
                
                const lightAngle = (Math.PI * 2) / this.numLights;
                const totalLightsPassed = Math.floor(this.currentRotation / lightAngle);
                
                if (this.angularVelocity > 0.15) {
                    this.tickFrequency = 1;
                } else if (this.angularVelocity > 0.08) {
                    this.tickFrequency = 2;
                } else if (this.angularVelocity > 0.04) {
                    this.tickFrequency = 3;
                } else if (this.angularVelocity > 0.02) {
                    this.tickFrequency = 4;
                } else {
                    this.tickFrequency = 6;
                }
                
                if (totalLightsPassed > this.lightCounter) {
                    if (totalLightsPassed % this.tickFrequency === 0) {
                        this.playTickSound();
                    }
                    this.lightCounter = totalLightsPassed;
                }
                
                // Detectar si está cerca de un grand prize con probabilidad 0
                if (this.angularVelocity < 0.01 && this.angularVelocity > 0.001) {
                    this.checkForGrandPrizeAvoidance();
                }
                
                if (this.angularVelocity < 0.001) {
                    this.angularVelocity = 0;
                    this.isSpinning = false;
                    this.hasWon = true;
                    
                    // Esperar 1500ms antes de mostrar el popup
                    setTimeout(() => {
                        this.onSpinComplete();
                    }, 1500);
                }
            } else if (!this.hasWon) {
                this.currentRotation += 0.002;
            }
            
            this.drawWheel();
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    checkForGrandPrizeAvoidance() {
        // Verificar si hay grand prizes habilitados con probabilidad 0
        const grandPrizesWithZeroProbability = wheelConfig.grandPrizes?.filter(gp => gp.enabled && gp.probability === 0) || [];
        
        if (grandPrizesWithZeroProbability.length === 0) {
            // Restaurar fricción normal si no hay grand prizes con probabilidad 0
            this.friction = 0.988;
            return;
        }
        
        const wheelPrizes = distributePrizesWithConsolationSpacing(wheelConfig.prizes);
        const segmentAngle = (Math.PI * 2) / wheelPrizes.length;
        
        let normalizedRotation = this.currentRotation % (Math.PI * 2);
        if (normalizedRotation < 0) {
            normalizedRotation += Math.PI * 2;
        }
        
        const pointerPosition = (Math.PI * 2) - normalizedRotation;
        const adjustedAngle = (pointerPosition + Math.PI / 2) % (Math.PI * 2);
        
        let currentIndex = Math.floor(adjustedAngle / segmentAngle);
        currentIndex = currentIndex % wheelPrizes.length;
        if (currentIndex < 0) {
            currentIndex += wheelPrizes.length;
        }
        
        const currentPrize = wheelPrizes[currentIndex];
        
        // Si estamos en un grand prize que no se puede ganar, dar un pequeño impulso
        if (currentPrize.isGrandPrize && !currentPrize.canWin) {
            // Dar un impulso más suave y lento para continuar el movimiento
            this.angularVelocity = Math.max(this.angularVelocity, 0.003 + Math.random() * 0.002);
            
            // Ajustar la fricción para que sea más suave temporalmente
            this.friction = 0.995;
            
            // Marcar que acabamos de salir del grand prize para transición suave
            this.justLeftGrandPrize = true;
            this.grandPrizeTransitionFrames = 0;
        } else {
            // Si acabamos de salir del grand prize, hacer transición gradual
            if (this.justLeftGrandPrize) {
                this.grandPrizeTransitionFrames++;
                
                // Transición gradual durante 40 frames (aproximadamente 2/3 de segundo)
                if (this.grandPrizeTransitionFrames < 40) {
                    // Fricción intermedia para transición suave usando curva de ease-out
                    const progress = this.grandPrizeTransitionFrames / 40;
                    const easeOut = 1 - Math.pow(1 - progress, 3); // Curva cúbica ease-out
                    this.friction = 0.988 + (0.007 * easeOut);
                } else {
                    // Restaurar fricción normal después de la transición
                    this.friction = 0.988;
                    this.justLeftGrandPrize = false;
                    this.grandPrizeTransitionFrames = 0;
                }
            } else {
                // Restaurar fricción normal cuando no estamos en grand prize
                this.friction = 0.988;
            }
        }
    }
    
    onSpinComplete() {
        const wheelPrizes = distributePrizesWithConsolationSpacing(wheelConfig.prizes);
        const segmentAngle = (Math.PI * 2) / wheelPrizes.length;
        
        let normalizedRotation = this.currentRotation % (Math.PI * 2);
        if (normalizedRotation < 0) {
            normalizedRotation += Math.PI * 2;
        }
        
        const pointerPosition = (Math.PI * 2) - normalizedRotation;
        const adjustedAngle = (pointerPosition + Math.PI / 2) % (Math.PI * 2);
        
        let winningIndex = Math.floor(adjustedAngle / segmentAngle);
        winningIndex = winningIndex % wheelPrizes.length;
        if (winningIndex < 0) {
            winningIndex += wheelPrizes.length;
        }
        
        const winningPrize = wheelPrizes[winningIndex];
        
        // Verificar si el gran premio se puede ganar
        if (winningPrize.isGrandPrize && !winningPrize.canWin) {
            // Marcar que estamos continuando desde gran premio
            this.isContinuingFromGrandPrize = true;
            
            // Calcular una velocidad de continuación más natural
            // Si la velocidad actual es muy baja, darle un pequeño impulso
            if (this.angularVelocity < 0.005) {
                this.angularVelocity = 0.008 + Math.random() * 0.004; // Impulso suave y aleatorio
            } else {
                // Mantener la velocidad actual pero con fricción más suave
                this.angularVelocity = Math.max(this.angularVelocity * 0.98, 0.003);
            }
            
            this.isSpinning = true;
            
            // Continuar la animación natural sin pausa
            const animate = () => {
                this.currentRotation += this.angularVelocity;
                this.angularVelocity *= 0.992; // Fricción más suave para movimiento natural
                
                // Continuar hasta que se detenga naturalmente
                if (this.angularVelocity < 0.001) {
                    this.isSpinning = false;
                    // Llamar a onSpinComplete nuevamente para verificar el nuevo premio
                    this.onSpinComplete();
                    return;
                }
                
                this.drawWheel();
                requestAnimationFrame(animate);
            };
            
            animate();
            return; // No mostrar resultado del gran premio
        }
        
        // Solo mostrar resultado si no es gran premio con probabilidad 0%
        this.showResult(winningPrize);
    }
    
    
    showResult(prize) {
        this.modalPrize.textContent = prize.text;
        
        if (!prize.isNegative) {
            // Buscar el premio original en wheelConfig.prizes
            const originalPrizeIndex = wheelConfig.prizes.findIndex(p => p.text === prize.text);
            if (originalPrizeIndex !== -1) {
                // Restar del inventario
                wheelConfig.prizes[originalPrizeIndex].inventory = Math.max(0, wheelConfig.prizes[originalPrizeIndex].inventory - 1);
                
                // Guardar en localStorage
                localStorage.setItem('wheelConfig', JSON.stringify(wheelConfig));
                
                // Sincronizar variables globales
                syncGlobalVariables();
                
                // Redibujar la ruleta (esto actualizará qué premios están disponibles)
                this.drawWheel();
                
            }
        }
        
        const icons = {
            'TANQUE LLENO': '⛽',
            'TINTADO': '🚗',
            'NEVERITA': '❄️',
            'NEVERA': '🧊',
            'US $300': '💵',
            'US $100': '💵',
            'ACEITE AUTO': '🛢️',
            'ACCESORIO AUTO': '🔧',
            'LAVADO PREMIUM': '💎',
            'VUELVE A INTENTARLO': '🔄',
            'MEJOR SUERTE': '😔',
            'INTÉNTALO OTRA VEZ': '🎯'
        };
        
        this.modalIcon.textContent = icons[prize.text] || '🏆';
        
        const modalTitle = document.getElementById('modalTitle');
        if (prize.isNegative) {
            modalTitle.textContent = 'Mejor suerte la próxima vez';
        } else {
            modalTitle.textContent = 'Felicidades Ganaste un/a:';
        }
        
        // Solo reproducir sonido si no viene de gran premio
        if (!this.isContinuingFromGrandPrize) {
            this.playWinSound();
        }
        
        // Resetear la bandera
        this.isContinuingFromGrandPrize = false;
        
        this.modal.classList.add('show');
        
        setTimeout(() => {
            this.launchConfetti();
        }, 100);
    }
    
    launchConfetti() {
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
        }
        
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        this.confettiInterval = setInterval(() => {
            confetti(Object.assign({}, defaults, {
                particleCount: 15,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#ffd100', '#f89500', '#ffb300', '#0056a0', '#2e804b', '#dc2626', '#7c2d8e']
            }));
            confetti(Object.assign({}, defaults, {
                particleCount: 15,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#ffd100', '#f89500', '#ffb300', '#0056a0', '#2e804b', '#dc2626', '#7c2d8e']
            }));
        }, 250);
    }
    
    closeModal() {
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
            this.confettiInterval = null;
        }
        
        this.modal.classList.remove('show');
        this.hasWon = false;
    }
    
    playSpinSound() {
        if (!this.audioContext || this.isMuted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.25 * this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.25);
        } catch (e) {
            // Silenciosamente falla
        }
    }
    
    playTickSound() {
        if (!this.audioContext || this.isMuted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 1200;
            gainNode.gain.setValueAtTime(0.1 * this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            // Silenciosamente falla
        }
    }
    
    playWinSound() {
        if (this.isMuted || this.isPlayingWinSound) return;
        
        this.isPlayingWinSound = true;
        
        try {
            const audio = new Audio('sounds/Victory.mp3');
            audio.volume = this.volume;
            audio.play()
                .then(() => {
                    this.isPlayingWinSound = false;
                })
                .catch(e => {
                    console.error('❌ Error al reproducir:', e);
                    this.isPlayingWinSound = false;
                });
        } catch (e) {
            console.error('❌ Audio not available:', e);
            this.isPlayingWinSound = false;
        }
    }
}

// Inicializar
let wheelInstance;
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que se cargue la configuración
    await loadWheelConfig();
    
    // Aplicar texto de felicitaciones desde la configuración
    const congratsText = wheelConfig.text.congratsText || 'Felicidades Ganaste un/a:';
    document.getElementById('modalTitle').textContent = congratsText;
    
    // Aplicar color desde la configuración
    const bgColor = wheelConfig.theme.backgroundColor || '#d6005d';
    const raysBackground = document.querySelector('.rays-background');
    if (raysBackground) {
        // Establecer el color de fondo principal
        raysBackground.style.backgroundColor = bgColor;
        
        // Aplicar color de rayas con formato rgba
        const raysGradient = generateRaysGradient(bgColor);
        raysBackground.style.background = `${raysGradient}, ${bgColor}`;
    }
    
    // Aplicar logo desde la configuración
    const logo = document.querySelector('.center-logo');
    if (logo) {
        logo.src = wheelConfig.logo.src;
    }
    
    // Inicializar favicon
    updateFavicon(wheelConfig.logo.src);
    
    wheelInstance = new PrizeWheel();
    wheelInstance.init();
    window.wheelInstance = wheelInstance;
    initSettings();
});

// Funciones auxiliares para cálculo de color
function hexToHSLInit(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHexInit(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    
    const toHex = (val) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function calculateRaysColorInit(baseColor) {
    const hsl = hexToHSLInit(baseColor);
    const newL = Math.max(0, hsl.l - 20);
    return hslToHexInit(hsl.h, hsl.s, newL);
}

// Generar formato de rayos con RGBA y contraste mejorado
function generateRaysGradient(baseColor) {
    // Convertir hex a HSL para calcular color más oscuro
    const hsl = hexToHSLInit(baseColor);
    const darkerL = Math.max(0, hsl.l - 16);
    const darkerRgb = hslToRgb(hsl.h, hsl.s, darkerL);
    
    // Convertir hex a RGB para color base
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `repeating-conic-gradient(
        from 0deg,
        rgba(${r}, ${g}, ${b}, 0.8) 0deg,
        rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 0.9) 3deg,
        rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 1.0) 6deg,
        rgba(${r}, ${g}, ${b}, 0.9) 9deg
    )`;
}

// Convertir HSL a RGB
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// Sistema de configuración integrado
function initSettings() {
    const settingsBtn = document.getElementById("settingsBtn");
    const configModal = document.getElementById("configModal");
    const configClose = document.getElementById("configClose");
    
    // Abrir modal de configuración
    settingsBtn.addEventListener("click", () => {
        configModal.classList.add("show");
        loadCurrentSettings();
    });
    
    // Cerrar modal de configuración
    configClose.addEventListener("click", () => {
        closeConfigModal();
    });
    
    // Cerrar modal al hacer click en el overlay
    configModal.querySelector('.modal-overlay').addEventListener('click', () => {
        closeConfigModal();
    });
    
    // Configurar event listeners del modal
    setupConfigEventListeners();
}

// Cerrar modal de configuración
function closeConfigModal() {
    const configModal = document.getElementById("configModal");
    configModal.classList.remove("show");
}

// Funciones de fullscreen
function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Detectar cambios de fullscreen
document.addEventListener('fullscreenchange', updateFullscreenState);
document.addEventListener('webkitfullscreenchange', updateFullscreenState);
document.addEventListener('msfullscreenchange', updateFullscreenState);

function updateFullscreenState() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
    if (fullscreenCheckbox) {
        fullscreenCheckbox.checked = isFullscreen;
    }
    wheelConfig.display.fullscreen = isFullscreen;
}

// Listener para actualizaciones de configuración desde la página de configuración
window.addEventListener('message', function(event) {
    if (event.data.type === 'CONFIG_UPDATED') {
        // Actualizar configuración
        wheelConfig = event.data.config;
        syncGlobalVariables();
        
        // Aplicar cambios visuales
        const app = document.querySelector('.ruleta-app');
        if (app) {
            app.style.backgroundColor = wheelConfig.theme.backgroundColor;
        }
        
        // Actualizar logo
        const logo = document.querySelector('.center-logo');
        if (logo) {
            logo.src = wheelConfig.logo.src;
        }
        
        // Actualizar texto de felicitaciones
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = wheelConfig.text.congratsText;
        }
        
        // Redibujar la ruleta
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        console.log('✅ Configuración actualizada desde página de configuración');
    }
});

// Configurar event listeners del modal
function setupConfigEventListeners() {
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            document.getElementById('volumeValue').textContent = this.value + '%';
            // Aplicar volumen en tiempo real
            if (window.wheelInstance) {
                window.wheelInstance.volume = parseFloat(this.value) / 100;
            }
        });
    }

    // Fullscreen checkbox
    const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
    if (fullscreenCheckbox) {
        fullscreenCheckbox.addEventListener('change', function() {
            if (this.checked) {
                enterFullscreen();
            } else {
                exitFullscreen();
            }
        });
    }

    // Color pickers con cambios en tiempo real
    setupColorPicker('bgColorInput', 'bgColorSwatch', () => {
        const color = document.getElementById('bgColorInput').value;
        const raysBackground = document.querySelector('.rays-background');
        if (raysBackground) {
            // Establecer el color de fondo principal
            raysBackground.style.backgroundColor = color;
            
            // Aplicar rayos con formato rgba
            const raysGradient = generateRaysGradient(color);
            raysBackground.style.background = `${raysGradient}, ${color}`;
        }
    });
    
    setupColorPicker('textColorInput', 'textColorSwatch', () => {
        const color = document.getElementById('textColorInput').value;
        const textElements = document.querySelectorAll('.wheel-text, .center-text');
        textElements.forEach(element => {
            element.style.color = color;
        });
    });
    
    setupColorPicker('consolationBgInput', 'consolationBgSwatch');
    setupColorPicker('consolationTextInput', 'consolationTextSwatch');
    setupColorPicker('grandPrizeBgInput', 'grandPrizeBgSwatch');
    setupColorPicker('grandPrizeTextInput', 'grandPrizeTextSwatch');

    // Grand prize toggle
    const grandPrizeEnabled = document.getElementById('grandPrizeEnabled');
    if (grandPrizeEnabled) {
        grandPrizeEnabled.addEventListener('change', function() {
            const config = document.getElementById('grandPrizeConfig');
            if (config) {
                config.style.display = this.checked ? 'block' : 'none';
            }
            // Actualizar la configuración inmediatamente
            if (wheelConfig.grandPrize) {
                wheelConfig.grandPrize.enabled = this.checked;
            }
        });
    }

    // Logo upload
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const logoUrl = event.target.result;
                    
                    // Actualizar preview
                    document.getElementById('logoPreview').src = logoUrl;
                    
                    // Aplicar logo en tiempo real
                    const logo = document.querySelector('.center-logo');
                    if (logo) {
                        logo.src = logoUrl;
                    }
                    
                    // Actualizar favicon en tiempo real
                    updateFavicon(logoUrl);
                    
                    // Actualizar configuración
                    wheelConfig.logo.src = logoUrl;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Texto de felicitaciones en tiempo real
    const congratsText = document.getElementById('congratsText');
    if (congratsText) {
        congratsText.addEventListener('input', function() {
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = this.value || 'Felicidades Ganaste un/a:';
            }
        });
    }
}

// Configurar color picker
function setupColorPicker(inputId, swatchId, onColorChange = null) {
    const input = document.getElementById(inputId);
    const swatch = document.getElementById(swatchId);
    
    if (input && swatch) {
        swatch.addEventListener('click', () => input.click());
        input.addEventListener('change', function() {
            swatch.style.backgroundColor = this.value;
            if (this.value === '#ffffff' || this.value === '#fff') {
                swatch.style.border = '2px solid #e5e7eb';
            } else {
                swatch.style.border = '2px solid white';
            }
            
            // Ejecutar callback si existe
            if (onColorChange && typeof onColorChange === 'function') {
                onColorChange();
            }
        });
    }
}

// Cargar configuración actual en la interfaz
function loadCurrentSettings() {
    // Audio
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const muteCheckbox = document.getElementById('muteCheckbox');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.value = Math.round(wheelConfig.audio.volume * 100);
        volumeValue.textContent = Math.round(wheelConfig.audio.volume * 100) + '%';
    }
    
    if (muteCheckbox) {
        muteCheckbox.checked = wheelConfig.audio.isMuted;
    }

    // Display
    const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
    if (fullscreenCheckbox) {
        fullscreenCheckbox.checked = wheelConfig.display?.fullscreen || false;
    }

    // Tema
    const bgColorInput = document.getElementById('bgColorInput');
    const bgColorSwatch = document.getElementById('bgColorSwatch');
    const textColorInput = document.getElementById('textColorInput');
    const textColorSwatch = document.getElementById('textColorSwatch');
    
    if (bgColorInput && bgColorSwatch) {
        bgColorInput.value = wheelConfig.theme.backgroundColor;
        bgColorSwatch.style.backgroundColor = wheelConfig.theme.backgroundColor;
    }
    
    if (textColorInput && textColorSwatch) {
        textColorInput.value = wheelConfig.theme.textColor;
        textColorSwatch.style.backgroundColor = wheelConfig.theme.textColor;
        if (wheelConfig.theme.textColor === '#ffffff' || wheelConfig.theme.textColor === '#fff') {
            textColorSwatch.style.border = '2px solid #e5e7eb';
        }
    }

    // Colores de consuelo
    const consolationBgInput = document.getElementById('consolationBgInput');
    const consolationBgSwatch = document.getElementById('consolationBgSwatch');
    const consolationTextInput = document.getElementById('consolationTextInput');
    const consolationTextSwatch = document.getElementById('consolationTextSwatch');
    
    if (consolationBgInput && consolationBgSwatch) {
        consolationBgInput.value = wheelConfig.consolationColors.backgroundColor;
        consolationBgSwatch.style.backgroundColor = wheelConfig.consolationColors.backgroundColor;
    }
    
    if (consolationTextInput && consolationTextSwatch) {
        consolationTextInput.value = wheelConfig.consolationColors.textColor;
        consolationTextSwatch.style.backgroundColor = wheelConfig.consolationColors.textColor;
        if (wheelConfig.consolationColors.textColor === '#ffffff' || wheelConfig.consolationColors.textColor === '#fff') {
            consolationTextSwatch.style.border = '2px solid #e5e7eb';
        }
    }

    // Gran premios - renderizar lista
    renderGrandPrizes();

    // Contenido
    const congratsText = document.getElementById('congratsText');
    if (congratsText) {
        congratsText.value = wheelConfig.text.congratsText;
    }

    // Renderizar paleta de colores
    renderColorPalette();

    // Renderizar premios
    renderPrizes();

    // Cargar presets
    loadPresetList();
}

// Renderizar paleta de colores
function renderColorPalette() {
    const container = document.getElementById('colorPaletteList');
    if (!container) return;
    
    container.innerHTML = '';

    wheelConfig.colorPalette.forEach((color, index) => {
        const item = document.createElement('div');
        item.className = 'palette-color-item';
        item.innerHTML = `
            <div class="palette-color-preview" style="background-color: ${color}" onclick="document.getElementById('paletteColor${index}').click()"></div>
            <input type="color" id="paletteColor${index}" value="${color}" style="display: none;" onchange="updatePaletteColor(${index}, this.value)">
            <button class="palette-color-remove" onclick="removeColorFromPalette(${index})">×</button>
        `;
        container.appendChild(item);
    });
}

// Actualizar color en paleta
function updatePaletteColor(index, newColor) {
    wheelConfig.colorPalette[index] = newColor;
    renderColorPalette();
    
    // Aplicar cambios inmediatamente
    syncGlobalVariables();
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Agregar color a paleta
function addColorToPalette() {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    wheelConfig.colorPalette.push(randomColor);
    renderColorPalette();
    
    // Aplicar cambios inmediatamente
    syncGlobalVariables();
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Remover color de paleta
function removeColorFromPalette(index) {
    if (wheelConfig.colorPalette.length > 1) {
        wheelConfig.colorPalette.splice(index, 1);
        renderColorPalette();
        
        // Aplicar cambios inmediatamente
        syncGlobalVariables();
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}

// Renderizar premios
function renderPrizes() {
    const realPrizes = wheelConfig.prizes.filter(prize => !prize.isNegative);
    const negativePrizes = wheelConfig.prizes.filter(prize => prize.isNegative);

    renderPrizeList('realPrizesList', realPrizes, false);
    renderPrizeList('negativePrizesList', negativePrizes, true);
    
    // Mostrar resumen de premios
    updatePrizeSummary();
}

// Actualizar resumen de premios
function updatePrizeSummary() {
    const realPrizes = wheelConfig.prizes.filter(p => !p.isNegative);
    const totalRealPrizes = realPrizes.reduce((sum, p) => sum + p.quantity, 0);
    const totalNegativePrizes = wheelConfig.prizes.filter(p => p.isNegative).reduce((sum, p) => sum + p.quantity, 0);
    const totalPrizes = totalRealPrizes + totalNegativePrizes;
    
    // Calcular inventario disponible
    const availableInventory = realPrizes.reduce((sum, p) => sum + (p.inventory || 0), 0);
    const totalInventory = realPrizes.reduce((sum, p) => sum + (p.inventory || 0), 0);
    
    console.log('📊 Resumen de premios:', {
        premiosReales: totalRealPrizes,
        premiosConsuelo: totalNegativePrizes,
        total: totalPrizes,
        inventarioDisponible: availableInventory
    });
    
    // Actualizar títulos de secciones si existen
    const realPrizesTitle = document.querySelector('#realPrizesList').previousElementSibling;
    const negativePrizesTitle = document.querySelector('#negativePrizesList').previousElementSibling;
    
    if (realPrizesTitle && realPrizesTitle.classList.contains('prizes-section-title')) {
        realPrizesTitle.innerHTML = `🎁 Premios Reales (${totalRealPrizes} total) - 📦 Inventario: ${availableInventory}`;
    }
    
    if (negativePrizesTitle && negativePrizesTitle.classList.contains('prizes-section-title')) {
        negativePrizesTitle.innerHTML = `🔄 Opciones de Consuelo (${totalNegativePrizes} total)`;
    }
}

// Renderizar lista de premios
function renderPrizeList(containerId, prizes, isNegative) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';

    prizes.forEach((prize, index) => {
        // Encontrar el índice real en wheelConfig.prizes
        const realIndex = wheelConfig.prizes.findIndex(p => p === prize);
        
        const item = document.createElement('div');
        item.className = 'prize-item';
        
        // Inicializar inventario solo si no existe (undefined o null)
        if ((prize.inventory === undefined || prize.inventory === null) && !isNegative) {
            prize.inventory = 3;
        }
        
        // HTML diferente para premios reales (con inventario) y consuelo
        let htmlContent;
        if (isNegative) {
            // Premios de consuelo - sin inventario
            htmlContent = `
                <input type="text" value="${prize.text}" placeholder="Nombre del premio" onchange="updatePrize(${realIndex}, 'text', this.value)" style="flex: 2;">
                <input type="number" value="${prize.quantity}" placeholder="Cantidad" min="1" max="999" step="1" onchange="updatePrize(${realIndex}, 'quantity', parseInt(this.value) || 1)" style="flex: 1; text-align: center;">
                <button onclick="removePrize(${realIndex})" style="flex: 0 0 auto; width: 40px;">×</button>
            `;
        } else {
            // Premios reales - con inventario
            htmlContent = `
                <input type="text" value="${prize.text}" placeholder="Nombre del premio" onchange="updatePrize(${realIndex}, 'text', this.value)" style="flex: 2;">
                <input type="number" value="${prize.quantity}" placeholder="Cantidad" min="1" max="999" step="1" onchange="updatePrize(${realIndex}, 'quantity', parseInt(this.value) || 1)" style="flex: 1; text-align: center;">
                <input type="number" value="${prize.inventory || 0}" placeholder="Inventario" min="0" max="999" step="1" onchange="updatePrize(${realIndex}, 'inventory', parseInt(this.value) || 0)" style="flex: 1; text-align: center;" title="Inventario disponible">
                <button onclick="removePrize(${realIndex})" style="flex: 0 0 auto; width: 40px;">×</button>
            `;
        }
        
        item.innerHTML = htmlContent;
        container.appendChild(item);
    });
}

// Actualizar premio
function updatePrize(index, field, value) {
    if (index >= 0 && index < wheelConfig.prizes.length) {
        // Validar valores
        if (field === 'quantity') {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                value = 1; // Valor por defecto
            } else if (numValue > 999) {
                value = 999; // Valor máximo
            } else {
                value = numValue;
            }
        }
        
        wheelConfig.prizes[index][field] = value;
        
        // Aplicar cambios inmediatamente
        syncGlobalVariables();
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        console.log(`🎁 Premio actualizado: ${field} = ${value}`, wheelConfig.prizes[index]);
        
        // Mostrar feedback visual
        showStatus(`Premio actualizado: ${field} = ${value}`, 'success');
    }
}

// Agregar premio
function addPrize(isNegative) {
    const newPrize = {
        text: isNegative ? 'VUELVE A INTENTARLO' : '',
        quantity: isNegative ? 3 : 1,
        isNegative: isNegative
    };
    wheelConfig.prizes.push(newPrize);
    renderPrizes();
    
    // Aplicar cambios inmediatamente
    syncGlobalVariables();
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    console.log('🎁 Premio agregado:', newPrize);
}

// Remover premio
function removePrize(index) {
    if (index >= 0 && index < wheelConfig.prizes.length) {
        const removedPrize = wheelConfig.prizes[index];
        wheelConfig.prizes.splice(index, 1);
        renderPrizes();
        
        // Aplicar cambios inmediatamente
        syncGlobalVariables();
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        console.log('🗑️ Premio eliminado:', removedPrize);
    }
}

// Cargar lista de presets
function loadPresetList() {
    const select = document.getElementById('presetSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar preset...</option>';
    
    Object.keys(wheelConfig.presets || {}).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Guardar preset
function savePreset() {
    const name = document.getElementById('presetName').value.trim();
    if (!name) {
        showStatus('Por favor ingresa un nombre para el preset', 'error');
        return;
    }
    
    if (!wheelConfig.presets) {
        wheelConfig.presets = {};
    }
    
    wheelConfig.presets[name] = JSON.parse(JSON.stringify(wheelConfig));
    loadPresetList();
    document.getElementById('presetName').value = '';
    showStatus(`Preset "${name}" guardado exitosamente`, 'success');
}

// Cargar preset
function loadPreset() {
    const select = document.getElementById('presetSelect');
    const selectedName = select.value;
    if (!selectedName) {
        showStatus('Por favor selecciona un preset', 'error');
        return;
    }
    
    const preset = wheelConfig.presets[selectedName];
    if (!preset) {
        showStatus('Preset no encontrado', 'error');
        return;
    }
    
    wheelConfig = { ...wheelConfig, ...preset };
    loadCurrentSettings();
    showStatus(`Preset "${selectedName}" cargado exitosamente`, 'success');
}

// Eliminar preset
function deletePreset() {
    const select = document.getElementById('presetSelect');
    const selectedName = select.value;
    if (!selectedName) {
        showStatus('Por favor selecciona un preset para eliminar', 'error');
        return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el preset "${selectedName}"?`)) {
        return;
    }
    
    delete wheelConfig.presets[selectedName];
    loadPresetList();
    showStatus(`Preset "${selectedName}" eliminado exitosamente`, 'success');
}

// Restaurar defaults
function restoreDefaults() {
    if (!confirm('¿Estás seguro de que quieres restaurar todos los valores por defecto?')) {
        return;
    }
    
    // Restaurar configuración por defecto
    wheelConfig = {
        prizes: [
            { text: 'TANQUE LLENO', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'NEVERA', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'TINTADO', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'NEVERITA', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'US $300', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'US $100', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'ACEITE AUTO', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'ACCESORIO AUTO', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'LAVADO PREMIUM', quantity: 1, isNegative: false, inventory: 3 },
            { text: 'VUELVE A INTENTARLO', quantity: 3, isNegative: true },
            { text: 'MEJOR SUERTE', quantity: 2, isNegative: true },
            { text: 'INTÉNTALO OTRA VEZ', quantity: 4, isNegative: true }
        ],
        colorPalette: ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'],
        theme: {
            backgroundColor: '#d6005d',
            textColor: '#ffffff'
        },
        consolationColors: {
            backgroundColor: '#000000',
            textColor: '#ffffff'
        },
        grandPrize: {
            enabled: false,
            name: 'iPhone 15 Pro',
            probability: 5,
            colors: {
                backgroundColor: '#ffd700',
                textColor: '#000000'
            }
        },
        audio: {
            volume: 0.7,
            isMuted: false
        },
        text: {
            congratsText: 'Felicidades Ganaste un/a:'
        },
        logo: {
            src: 'images/Auto Americana Logo.svg'
        },
        presets: wheelConfig.presets || {}, // Mantener presets existentes
        version: '2.0.0'
    };
    
    loadCurrentSettings();
    showStatus('Configuración restaurada a valores por defecto', 'success');
}

// Establecer como default
function setAsDefault() {
    if (!confirm('¿Estás seguro de que quieres establecer la configuración actual como la nueva configuración por defecto?')) {
        return;
    }
    
    showStatus('Configuración actual establecida como nueva configuración por defecto', 'success');
}

// Descargar configuración
function downloadConfig() {
    const jsonString = JSON.stringify(wheelConfig, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wheelCONF.JSON';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showStatus('Archivo JSON descargado', 'success');
}

// Resetear logo
function resetLogo() {
    if (confirm('¿Estás seguro de que quieres restaurar el logo original?')) {
        const originalLogo = 'images/Auto Americana Logo.svg';
        
        // Actualizar preview
        document.getElementById('logoPreview').src = originalLogo;
        document.getElementById('logoInput').value = '';
        
        // Actualizar logo en la ruleta
        const logo = document.querySelector('.center-logo');
        if (logo) {
            logo.src = originalLogo;
        }
        
        // Actualizar favicon
        updateFavicon(originalLogo);
        
        // Actualizar configuración
        wheelConfig.logo.src = originalLogo;
        
        showStatus('Logo restaurado al original', 'success');
    }
}

// Guardar toda la configuración
function saveAllSettings() {
    try {
        // Recopilar todos los datos del formulario
        wheelConfig.audio.volume = parseFloat(document.getElementById('volumeSlider').value) / 100;
        wheelConfig.audio.isMuted = document.getElementById('muteCheckbox').checked;
        
        // Inicializar display si no existe
        if (!wheelConfig.display) {
            wheelConfig.display = { fullscreen: false };
        }
        wheelConfig.display.fullscreen = document.getElementById('fullscreenCheckbox').checked;
        
        wheelConfig.theme.backgroundColor = document.getElementById('bgColorInput').value;
        wheelConfig.theme.textColor = document.getElementById('textColorInput').value;
        
        wheelConfig.consolationColors.backgroundColor = document.getElementById('consolationBgInput').value;
        wheelConfig.consolationColors.textColor = document.getElementById('consolationTextInput').value;
        
        // Inicializar grandPrize si no existe
        if (!wheelConfig.grandPrize) {
            wheelConfig.grandPrize = {
                enabled: false,
                name: 'iPhone 15 Pro',
                probability: 5,
                colors: {
                    backgroundColor: '#ffd700',
                    textColor: '#000000'
                }
            };
        }
        
        const grandPrizeEnabled = document.getElementById('grandPrizeEnabled');
        const grandPrizeName = document.getElementById('grandPrizeName');
        const grandPrizeProbability = document.getElementById('grandPrizeProbability');
        const grandPrizeBgInput = document.getElementById('grandPrizeBgInput');
        const grandPrizeTextInput = document.getElementById('grandPrizeTextInput');
        
        wheelConfig.grandPrize.enabled = grandPrizeEnabled ? grandPrizeEnabled.checked : false;
        wheelConfig.grandPrize.name = grandPrizeName ? grandPrizeName.value : 'iPhone 15 Pro';
        
        // Manejar probabilidad 0 correctamente
        if (grandPrizeProbability) {
            const probValue = parseFloat(grandPrizeProbability.value);
            wheelConfig.grandPrize.probability = isNaN(probValue) ? 5 : probValue;
        } else {
            wheelConfig.grandPrize.probability = 5;
        }
        wheelConfig.grandPrize.colors.backgroundColor = grandPrizeBgInput ? grandPrizeBgInput.value : '#ffd700';
        wheelConfig.grandPrize.colors.textColor = grandPrizeTextInput ? grandPrizeTextInput.value : '#000000';
        
        wheelConfig.text.congratsText = document.getElementById('congratsText').value || 'Felicidades Ganaste un/a:';
        
        // Guardar en localStorage como respaldo
        localStorage.setItem('wheelConfig', JSON.stringify(wheelConfig));
        
        // Sincronizar variables globales
        syncGlobalVariables();
        
        // Aplicar cambios visuales inmediatamente
        applyVisualChanges();
        
        // Redibujar la ruleta
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        showStatus('✅ Configuración guardada exitosamente', 'success');
        closeConfigModal();
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        showStatus('❌ Error al guardar configuración', 'error');
    }
}

// Aplicar cambios visuales
function applyVisualChanges() {
    // Aplicar color de fondo a rays-background (no a ruleta-app)
    const raysBackground = document.querySelector('.rays-background');
    if (raysBackground) {
        // Establecer el color de fondo principal
        raysBackground.style.backgroundColor = wheelConfig.theme.backgroundColor;
        
        // Aplicar rayos con formato rgba
        const raysGradient = generateRaysGradient(wheelConfig.theme.backgroundColor);
        raysBackground.style.background = `${raysGradient}, ${wheelConfig.theme.backgroundColor}`;
    }
    
    // Actualizar logo
    const logo = document.querySelector('.center-logo');
    if (logo) {
        logo.src = wheelConfig.logo.src;
    }
    
    // Actualizar favicon dinámicamente
    updateFavicon(wheelConfig.logo.src);
    
    // Actualizar texto de felicitaciones
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = wheelConfig.text.congratsText;
    }
    
    // Aplicar colores de texto
    const textElements = document.querySelectorAll('.wheel-text, .center-text');
    textElements.forEach(element => {
        element.style.color = wheelConfig.theme.textColor;
    });
    
    console.log('🎨 Cambios visuales aplicados:', {
        backgroundColor: wheelConfig.theme.backgroundColor,
        textColor: wheelConfig.theme.textColor,
        congratsText: wheelConfig.text.congratsText,
        logo: wheelConfig.logo.src
    });
}

// Actualizar favicon dinámicamente
function updateFavicon(logoUrl) {
    try {
        // Obtener elementos del favicon
        const favicon = document.getElementById('dynamicFavicon');
        const faviconShortcut = document.getElementById('dynamicFaviconShortcut');
        
        if (favicon && faviconShortcut) {
            // Actualizar href de los favicons
            favicon.href = logoUrl;
            faviconShortcut.href = logoUrl;
            
            // Forzar actualización del favicon en el navegador
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            link.href = logoUrl + '?v=' + Date.now(); // Cache busting
            document.head.appendChild(link);
            
            // Remover el link temporal después de un momento
            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            }, 100);
            
            console.log('🔄 Favicon actualizado:', logoUrl);
        }
    } catch (error) {
        console.error('❌ Error actualizando favicon:', error);
    }
}

// Mostrar mensaje de estado
function showStatus(message, type) {
    // Crear elemento de estado si no existe
    let statusDiv = document.getElementById('statusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'statusMessage';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusDiv);
    }
    
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
        statusDiv.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        statusDiv.style.backgroundColor = '#ef4444';
    }
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// ===== FUNCIONES PARA MÚLTIPLES GRAND PRIZES =====

// Renderizar lista de grand prizes
function renderGrandPrizes() {
    const container = document.getElementById('grandPrizesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Asegurar que wheelConfig.grandPrizes existe
    if (!wheelConfig.grandPrizes) {
        wheelConfig.grandPrizes = [];
    }
    
    wheelConfig.grandPrizes.forEach((grandPrize, index) => {
        const item = document.createElement('div');
        item.className = 'grand-prize-item';
        item.innerHTML = `
            <input type="text" value="${grandPrize.name}" placeholder="Nombre del Grand Prize" onchange="updateGrandPrize(${index}, 'name', this.value)">
            <input type="number" value="${grandPrize.probability}" placeholder="Probabilidad (0-100)" min="0" max="100" step="0.1" onchange="updateGrandPrize(${index}, 'probability', parseFloat(this.value) || 0)">
            <div class="color-picker-container">
                <div class="color-swatch" id="grandPrizeBgSwatch${index}" style="background-color: ${grandPrize.colors.backgroundColor};" onclick="document.getElementById('grandPrizeBgInput${index}').click()"></div>
                <input type="color" id="grandPrizeBgInput${index}" value="${grandPrize.colors.backgroundColor}" onchange="updateGrandPrize(${index}, 'backgroundColor', this.value)">
            </div>
            <div class="color-picker-container">
                <div class="color-swatch" id="grandPrizeTextSwatch${index}" style="background-color: ${grandPrize.colors.textColor};" onclick="document.getElementById('grandPrizeTextInput${index}').click()"></div>
                <input type="color" id="grandPrizeTextInput${index}" value="${grandPrize.colors.textColor}" onchange="updateGrandPrize(${index}, 'textColor', this.value)">
            </div>
            <button onclick="removeGrandPrize(${index})" class="remove-btn">×</button>
        `;
        container.appendChild(item);
    });
}


// Actualizar grand prize
function updateGrandPrize(index, field, value) {
    if (wheelConfig.grandPrizes[index]) {
        if (field === 'backgroundColor' || field === 'textColor') {
            wheelConfig.grandPrizes[index].colors[field] = value;
        } else {
            wheelConfig.grandPrizes[index][field] = value;
        }
        
        // Aplicar cambios inmediatamente
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}

// Agregar grand prize
function addGrandPrize() {
    const newGrandPrize = {
        enabled: true,
        name: 'Nuevo Grand Prize',
        probability: 5,
        colors: {
            backgroundColor: '#ffd700',
            textColor: '#000000'
        }
    };
    
    wheelConfig.grandPrizes.push(newGrandPrize);
    renderGrandPrizes();
    
    // Aplicar cambios inmediatamente
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Remover grand prize
function removeGrandPrize(index) {
    if (wheelConfig.grandPrizes.length > 1) {
        wheelConfig.grandPrizes.splice(index, 1);
        renderGrandPrizes();
        
        // Aplicar cambios inmediatamente
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}
