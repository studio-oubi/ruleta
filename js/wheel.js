// Módulo de la clase PrizeWheel
// Maneja la lógica principal de la ruleta, animación y física

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
        const wheelConfig = window.ConfigModule?.wheelConfig;
        if (!wheelConfig) {
            console.error('❌ wheelConfig no disponible en drawWheel');
            return;
        }
        
        console.log('🎯 drawWheel - wheelConfig:', wheelConfig);
        console.log('🎯 drawWheel - prizes:', wheelConfig.prizes);
        
        const wheelPrizes = window.PrizesModule?.distributePrizesWithConsolationSpacing(wheelConfig.prizes) || [];
        console.log('🎯 drawWheel - wheelPrizes resultantes:', wheelPrizes);
        
        // Verificar que hay premios para dibujar
        if (!wheelPrizes || wheelPrizes.length === 0) {
            console.error('❌ No hay premios para dibujar en la ruleta');
            return;
        }
        
        // Dibujar segmentos
        const segmentAngle = (Math.PI * 2) / wheelPrizes.length;
        
        // Dibujar todos los segmentos primero
        wheelPrizes.forEach((prize, index) => {
            const startAngle = index * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;
            
            // Usar color del premio directamente
            const prizeColor = prize.bgColor || '#dc143c';
            
            console.log(`🎯 Segmento ${index}:`, {
                text: prize.text,
                color: prizeColor,
                startAngle: startAngle,
                endAngle: endAngle,
                isNegative: prize.isNegative
            });
            
            // Crear degradado para el segmento (con fallback a color sólido)
            let fillStyle = prizeColor; // Fallback por defecto
            
            try {
                // Verificar si es un Grand Prize con degradado dorado
                    if (prize.useGoldenGradient && window.UtilsModule?.createGoldenGradient) {
                        const goldenGradient = window.UtilsModule.createGoldenGradient(ctx, 0, 0, this.radius);
                        if (goldenGradient) {
                            fillStyle = goldenGradient;
                        }
                    } else if (window.UtilsModule?.createWheelSegmentGradient) {
                        const gradient = window.UtilsModule.createWheelSegmentGradient(ctx, 0, 0, prizeColor, this.radius);
                        if (gradient) {
                            fillStyle = gradient;
                        }
                    }
            } catch (error) {
                console.error(`❌ Error creando gradiente para segmento ${index}:`, error);
                fillStyle = prizeColor; // Fallback en caso de error
            }
            
            // Dibujar segmento
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.radius, startAngle, endAngle);
            ctx.closePath();
            
            // Aplicar color o degradado
            ctx.fillStyle = fillStyle;
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
            
            // Dibujar texto (solo si no es premio de consolación con texto oculto)
            const wheelConfig = window.ConfigModule?.wheelConfig;
            const shouldHideText = prize.isNegative && (prize.hideText || wheelConfig?.consolationColors?.hideText);
            
            if (!shouldHideText) {
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
            }
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
        const wheelConfig = window.ConfigModule?.wheelConfig;
        const grandPrizesWithZeroProbability = wheelConfig?.grandPrizes?.filter(gp => gp.enabled && gp.probability === 0) || [];
        
        if (grandPrizesWithZeroProbability.length === 0) {
            // Restaurar fricción normal si no hay grand prizes con probabilidad 0
            this.friction = 0.988;
            return;
        }
        
        const wheelPrizes = window.PrizesModule?.distributePrizesWithConsolationSpacing(wheelConfig.prizes) || [];
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
        const wheelConfig = window.ConfigModule?.wheelConfig;
        if (!wheelConfig) return;
        
        const wheelPrizes = window.PrizesModule?.distributePrizesWithConsolationSpacing(wheelConfig.prizes) || [];
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
            // Actualizar inventario usando el módulo de premios
            if (window.PrizesModule?.updatePrizeInventory) {
                window.PrizesModule.updatePrizeInventory(prize.text);
            }
            
            // Redibujar la ruleta (esto actualizará qué premios están disponibles)
            this.drawWheel();
        }
        
        // Obtener icono usando el módulo de premios
        if (window.PrizesModule?.getPrizeIcon) {
            this.modalIcon.textContent = window.PrizesModule.getPrizeIcon(prize.text);
        } else {
            this.modalIcon.textContent = '🏆';
        }
        
        // Obtener título usando el módulo de premios
        const modalTitle = document.getElementById('modalTitle');
        if (window.PrizesModule?.getModalTitle) {
            modalTitle.textContent = window.PrizesModule.getModalTitle(prize);
        } else {
            modalTitle.textContent = prize.isNegative ? 'Mejor suerte la próxima vez' : 'Felicidades Ganaste un/a:';
        }
        
        // Solo reproducir sonido si no viene de gran premio
        if (!this.isContinuingFromGrandPrize) {
            if (prize.isNegative) {
                // Reproducir sonido de pérdida para premios de consuelo
                window.AudioModule?.playLoseSound();
            } else {
                // Reproducir sonido de victoria para premios reales
                this.playWinSound();
            }
        }
        
        // Resetear la bandera
        this.isContinuingFromGrandPrize = false;
        
        this.modal.classList.add('show');
        
        // Solo mostrar confeti para premios reales (no de consuelo)
        if (!prize.isNegative) {
            setTimeout(() => {
                this.launchConfetti();
            }, 100);
        }
    }
    
    launchConfetti() {
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
        }
        
        if (window.UtilsModule?.launchConfetti) {
            this.confettiInterval = window.UtilsModule.launchConfetti();
        }
    }
    
    closeModal() {
        if (this.confettiInterval) {
            if (window.UtilsModule?.clearConfetti) {
                window.UtilsModule.clearConfetti(this.confettiInterval);
            }
            this.confettiInterval = null;
        }
        
        this.modal.classList.remove('show');
        this.hasWon = false;
    }
    
    playSpinSound() {
        if (window.AudioModule?.playSpinSound) {
            window.AudioModule.playSpinSound();
        }
    }
    
    playTickSound() {
        if (window.AudioModule?.playTickSound) {
            window.AudioModule.playTickSound();
        }
    }
    
    playWinSound() {
        if (window.AudioModule?.playWinSound) {
            window.AudioModule.playWinSound();
        }
    }
}

// Exportar la clase para uso en otros módulos
window.WheelModule = {
    PrizeWheel
};
