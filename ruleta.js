// ===== ARCHIVO PRINCIPAL DE LA RULETA =====
// Coordina todos los módulos y maneja la inicialización

// Importar todos los módulos
// Nota: Los módulos se cargan en el HTML antes de este archivo

// Variables globales para compatibilidad
let wheelInstance;

// Función principal de inicialización
async function initializeWheel() {
    try {
        // Cargar configuración
        if (window.ConfigModule?.loadWheelConfig) {
            await window.ConfigModule.loadWheelConfig();
        }
        
        // Aplicar texto de felicitaciones desde la configuración
        const wheelConfig = window.ConfigModule?.wheelConfig;
        if (wheelConfig) {
            const congratsText = wheelConfig.text?.congratsText || 'Felicidades Ganaste un/a:';
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = congratsText;
            }
            
            // Aplicar color desde la configuración
            const bgColor = wheelConfig.theme?.backgroundColor || '#d6005d';
            const raysBackground = document.querySelector('.rays-background');
            if (raysBackground && window.UtilsModule?.generateRaysGradient) {
                // Establecer el color de fondo principal
                raysBackground.style.backgroundColor = bgColor;
                
                // Aplicar color de rayas con formato rgba
                const raysGradient = window.UtilsModule.generateRaysGradient(bgColor);
                raysBackground.style.background = `${raysGradient}, ${bgColor}`;
            }
            
            // Aplicar logo desde la configuración
            const logo = document.querySelector('.center-logo');
            if (logo) {
                logo.src = wheelConfig.logo?.src || 'images/Auto Americana Logo.svg';
            }
            
            // Inicializar favicon
            if (window.UtilsModule?.updateFavicon) {
                window.UtilsModule.updateFavicon(wheelConfig.logo?.src || 'images/Auto Americana Logo.svg');
            }
        }
        
        // Inicializar AudioManager
        if (window.AudioModule?.initAudioManager) {
            window.AudioModule.initAudioManager();
        }
        
        // Crear instancia de la ruleta
        if (window.WheelModule?.PrizeWheel) {
            wheelInstance = new window.WheelModule.PrizeWheel();
            wheelInstance.init();
            window.wheelInstance = wheelInstance;
        }
        
        // Inicializar configuración de UI
        if (window.UIModule?.initSettings) {
            window.UIModule.initSettings();
        }
        
        console.log('✅ Ruleta inicializada correctamente con todos los módulos');
        
    } catch (error) {
        console.error('❌ Error inicializando la ruleta:', error);
    }
}

// Configurar event listeners para fullscreen
function setupFullscreenListeners() {
    // Detectar cambios de fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (window.UtilsModule?.updateFullscreenState) {
            window.UtilsModule.updateFullscreenState();
        }
    });
    document.addEventListener('webkitfullscreenchange', () => {
        if (window.UtilsModule?.updateFullscreenState) {
            window.UtilsModule.updateFullscreenState();
        }
    });
    document.addEventListener('msfullscreenchange', () => {
        if (window.UtilsModule?.updateFullscreenState) {
            window.UtilsModule.updateFullscreenState();
        }
    });
}

// Listener para actualizaciones de configuración desde la página de configuración
function setupConfigUpdateListener() {
    window.addEventListener('message', function(event) {
        if (event.data.type === 'CONFIG_UPDATED') {
            // Actualizar configuración
            const wheelConfig = window.ConfigModule?.wheelConfig;
            if (wheelConfig) {
                Object.assign(wheelConfig, event.data.config);
            }
            
            if (window.ConfigModule?.syncGlobalVariables) {
                window.ConfigModule.syncGlobalVariables();
            }
            
            // Aplicar cambios visuales
            const app = document.querySelector('.ruleta-app');
            if (app) {
                app.style.backgroundColor = wheelConfig.theme?.backgroundColor;
            }
            
            // Actualizar logo
            const logo = document.querySelector('.center-logo');
            if (logo) {
                logo.src = wheelConfig.logo?.src;
            }
            
            // Actualizar texto de felicitaciones
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = wheelConfig.text?.congratsText;
            }
            
            // Redibujar la ruleta
            if (window.wheelInstance) {
                window.wheelInstance.drawWheel();
            }
            
            console.log('✅ Configuración actualizada desde página de configuración');
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación de ruleta...');
    
    // Configurar listeners
    setupFullscreenListeners();
    setupConfigUpdateListener();
    
    // Inicializar la aplicación
    await initializeWheel();
});

// Exportar funciones globales para compatibilidad
window.loadWheelConfig = window.ConfigModule?.loadWheelConfig;
window.syncGlobalVariables = window.ConfigModule?.syncGlobalVariables;
window.distributePrizesWithConsolationSpacing = window.PrizesModule?.distributePrizesWithConsolationSpacing;
window.isNegativePrize = window.PrizesModule?.isNegativePrize;
window.verifyConsolationSpacing = window.PrizesModule?.verifyConsolationSpacing;
window.updatePrizeInventory = window.PrizesModule?.updatePrizeInventory;
window.getPrizeIcon = window.PrizesModule?.getPrizeIcon;
window.getModalTitle = window.PrizesModule?.getModalTitle;
window.playSpinSound = window.AudioModule?.playSpinSound;
window.playTickSound = window.AudioModule?.playTickSound;
window.playWinSound = window.AudioModule?.playWinSound;
window.setAudioVolume = window.AudioModule?.setAudioVolume;
window.setAudioMuted = window.AudioModule?.setAudioMuted;
window.toggleAudioMute = window.AudioModule?.toggleAudioMute;
window.hexToHSLInit = window.UtilsModule?.hexToHSLInit;
window.hslToHexInit = window.UtilsModule?.hslToHexInit;
window.calculateRaysColorInit = window.UtilsModule?.calculateRaysColorInit;
window.hslToRgb = window.UtilsModule?.hslToRgb;
window.generateRaysGradient = window.UtilsModule?.generateRaysGradient;
window.hexToRgb = window.UtilsModule?.hexToRgb;
window.enterFullscreen = window.UtilsModule?.enterFullscreen;
window.exitFullscreen = window.UtilsModule?.exitFullscreen;
window.updateFullscreenState = window.UtilsModule?.updateFullscreenState;
window.updateFavicon = window.UtilsModule?.updateFavicon;
window.showStatus = window.UtilsModule?.showStatus;
window.launchConfetti = window.UtilsModule?.launchConfetti;
window.clearConfetti = window.UtilsModule?.clearConfetti;
window.initSettings = window.UIModule?.initSettings;
window.closeConfigModal = window.UIModule?.closeConfigModal;
window.setupConfigEventListeners = window.UIModule?.setupConfigEventListeners;
window.setupColorPicker = window.UIModule?.setupColorPicker;
window.loadCurrentSettings = window.UIModule?.loadCurrentSettings;
window.renderColorPalette = window.UIModule?.renderColorPalette;
window.updatePaletteColor = window.UIModule?.updatePaletteColor;
window.addColorToPalette = window.UIModule?.addColorToPalette;
window.removeColorFromPalette = window.UIModule?.removeColorFromPalette;
window.renderPrizes = window.UIModule?.renderPrizes;
window.updatePrizeSummary = window.UIModule?.updatePrizeSummary;
window.renderPrizeList = window.UIModule?.renderPrizeList;
window.updatePrize = window.UIModule?.updatePrize;
window.addPrize = window.UIModule?.addPrize;
window.removePrize = window.UIModule?.removePrize;
window.loadPresetList = window.UIModule?.loadPresetList;
window.savePreset = window.UIModule?.savePreset;
window.loadPreset = window.UIModule?.loadPreset;
window.deletePreset = window.UIModule?.deletePreset;
window.restoreDefaults = window.UIModule?.restoreDefaults;
window.setAsDefault = window.UIModule?.setAsDefault;
window.downloadConfig = window.UIModule?.downloadConfig;
window.resetLogo = window.UIModule?.resetLogo;
window.saveAllSettings = window.UIModule?.saveAllSettings;
window.applyVisualChanges = window.UIModule?.applyVisualChanges;
window.renderGrandPrizes = window.UIModule?.renderGrandPrizes;
window.updateGrandPrize = window.UIModule?.updateGrandPrize;
window.addGrandPrize = window.UIModule?.addGrandPrize;
window.removeGrandPrize = window.UIModule?.removeGrandPrize;

// Exportar instancia global
window.wheelInstance = wheelInstance;
