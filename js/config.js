// Módulo de configuración para la ruleta
// Maneja la carga, sincronización y gestión de la configuración

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
        const response = await fetch('config/wheelCONF.JSON');
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
            wheelConfig.grandPrizes = sourceConfig.grandPrizes || defaultConfig.grandPrizes;
            
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

// Función para guardar configuración
function saveConfig() {
    try {
        localStorage.setItem('wheelConfig', JSON.stringify(wheelConfig));
        console.log('✅ Configuración guardada en localStorage');
    } catch (error) {
        console.error('❌ Error guardando configuración:', error);
    }
}

// Función para cargar configuración desde localStorage
function loadConfigFromStorage() {
    try {
        const stored = localStorage.getItem('wheelConfig');
        if (stored) {
            const parsedConfig = JSON.parse(stored);
            wheelConfig = { ...wheelConfig, ...parsedConfig };
            syncGlobalVariables();
            console.log('✅ Configuración cargada desde localStorage');
        }
    } catch (error) {
        console.error('❌ Error cargando configuración desde localStorage:', error);
    }
}

// Exportar funciones y variables para uso en otros módulos
window.ConfigModule = {
    wheelConfig,
    fullConfig,
    defaultConfig,
    prizes,
    wheelColorPalette,
    wheelTextColor,
    negativePrizesBgColor,
    negativePrizesTextColor,
    loadWheelConfig,
    syncGlobalVariables,
    saveConfig,
    loadConfigFromStorage
};
