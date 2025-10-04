// Módulo de audio para la ruleta
// Maneja todos los sonidos y efectos de audio

class AudioManager {
    constructor() {
        this.isMuted = localStorage.getItem('wheelMuted') === 'true' || false;
        this.volume = parseFloat(localStorage.getItem('wheelVolume')) || 0.7;
        this.isPlayingWinSound = false;
        
        // AudioContext compartido para mejor rendimiento
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.audioContext = null;
        }
    }
    
    // Reproducir sonido de giro
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
    
    // Reproducir sonido de tick durante el giro
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
    
    // Reproducir sonido de victoria
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
    
    // Reproducir sonido de pérdida/consuelo
    playLoseSound() {
        if (this.isMuted || this.isPlayingWinSound) return;
        
        this.isPlayingWinSound = true;
        
        try {
            // Crear un sonido de pérdida usando Web Audio API para generar un tono triste
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Frecuencia baja para sonido triste
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.8);
            
            // Volumen que decae
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            // Tipo de onda para sonido más suave
            oscillator.type = 'sine';
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            
            // Resetear bandera después del sonido
            setTimeout(() => {
                this.isPlayingWinSound = false;
            }, 800);
            
        } catch (e) {
            console.error('❌ Audio de pérdida no disponible:', e);
            this.isPlayingWinSound = false;
        }
    }
    
    // Actualizar volumen
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('wheelVolume', this.volume.toString());
    }
    
    // Alternar silencio
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('wheelMuted', this.isMuted.toString());
    }
    
    // Establecer silencio
    setMuted(muted) {
        this.isMuted = muted;
        localStorage.setItem('wheelMuted', this.isMuted.toString());
    }
    
    // Obtener estado del audio
    getAudioState() {
        return {
            isMuted: this.isMuted,
            volume: this.volume,
            isPlayingWinSound: this.isPlayingWinSound
        };
    }
}

// Crear instancia global del AudioManager
let audioManager = null;

// Función para inicializar el AudioManager
function initAudioManager() {
    if (!audioManager) {
        audioManager = new AudioManager();
    }
    return audioManager;
}

// Función para obtener la instancia del AudioManager
function getAudioManager() {
    if (!audioManager) {
        audioManager = new AudioManager();
    }
    return audioManager;
}

// Funciones de conveniencia para uso global
function playSpinSound() {
    const manager = getAudioManager();
    manager.playSpinSound();
}

function playTickSound() {
    const manager = getAudioManager();
    manager.playTickSound();
}

function playWinSound() {
    const manager = getAudioManager();
    manager.playWinSound();
}

function playLoseSound() {
    const manager = getAudioManager();
    manager.playLoseSound();
}

function setAudioVolume(volume) {
    const manager = getAudioManager();
    manager.setVolume(volume);
}

function setAudioMuted(muted) {
    const manager = getAudioManager();
    manager.setMuted(muted);
}

function toggleAudioMute() {
    const manager = getAudioManager();
    manager.toggleMute();
}

// Exportar funciones y clase para uso en otros módulos
window.AudioModule = {
    AudioManager,
    initAudioManager,
    getAudioManager,
    playSpinSound,
    playTickSound,
    playWinSound,
    playLoseSound,
    setAudioVolume,
    setAudioMuted,
    toggleAudioMute
};
