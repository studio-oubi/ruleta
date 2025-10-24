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
        textColor: '#ffffff',
        hideText: false
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
        { text: 'VUELVE A INTENTARLO', quantity: 3, isNegative: true, hideText: false },
        { text: 'MEJOR SUERTE', quantity: 2, isNegative: true, hideText: false },
        { text: 'INTÉNTALO OTRA VEZ', quantity: 4, isNegative: true, hideText: false }
    ],
    colorPalette: ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'],
    theme: {
        backgroundColor: '#d6005d',
        textColor: '#ffffff'
    },
    consolationColors: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        hideText: false
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
        src: 'images/Auto Americana Logo.svg',
        enabled: true
    },
    topLogo: {
        src: 'images/Auto Americana Logo.svg',
        enabled: false
    },
    sponsors: [
        {
            id: 'geely',
            src: 'images/sponsors/Geely-Logo.png',
            name: 'Geely',
            fromFolder: true
        },
        {
            id: 'jetour',
            src: 'images/sponsors/Jetour_logo.svg.png',
            name: 'Jetour',
            fromFolder: true
        },
        {
            id: 'kia',
            src: 'images/sponsors/kia.svg',
            name: 'Kia',
            fromFolder: true
        },
        {
            id: 'banreservas',
            src: 'images/sponsors/logo-banreservas-sin-slogan.png',
            name: 'Banreservas',
            fromFolder: true
        },
        {
            id: 'viamar',
            src: 'images/sponsors/viamar.png',
            name: 'Viamar',
            fromFolder: true
        }
    ],
    sponsorsEnabled: true,
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
        // Primero intentar cargar desde localStorage si existe
        const storedFullConfig = localStorage.getItem('fullWheelConfig');
        if (storedFullConfig) {
            try {
                const parsedStoredConfig = JSON.parse(storedFullConfig);
                console.log('🔄 Configuración encontrada en localStorage, cargando...');
                fullConfig = parsedStoredConfig;
                
                // Usar configuración actual o default del localStorage
                const sourceConfig = parsedStoredConfig.current || parsedStoredConfig.default || defaultConfig;
                
                // Cargar configuración completa desde localStorage
                console.log('🔄 Aplicando configuración completa desde localStorage...');
                
                // Limpiar wheelConfig y aplicar la nueva configuración
                Object.keys(wheelConfig).forEach(key => delete wheelConfig[key]);
                Object.assign(wheelConfig, sourceConfig);
                
                console.log('🔄 Configuración aplicada completamente:', {
                    prizesCount: wheelConfig.prizes?.length || 0,
                    theme: wheelConfig.theme,
                    logo: wheelConfig.logo,
                    topLogo: wheelConfig.topLogo,
                    sponsorsEnabled: wheelConfig.sponsorsEnabled
                });
                
                // Asegurar que todos los premios reales tengan inventario
                if (wheelConfig.prizes) {
                    wheelConfig.prizes.forEach(prize => {
                        if (!prize.isNegative && prize.inventory === undefined) {
                            prize.inventory = 3;
                        }
                    });
                }
                
                console.log('✅ Configuración completa cargada desde localStorage:', {
                    prizes: wheelConfig.prizes?.length || 0,
                    theme: wheelConfig.theme,
                    logo: wheelConfig.logo,
                    topLogo: wheelConfig.topLogo,
                    sponsorsEnabled: wheelConfig.sponsorsEnabled,
                    fullConfigStructure: {
                        hasCurrent: !!parsedStoredConfig.current,
                        hasDefault: !!parsedStoredConfig.default,
                        currentKeys: parsedStoredConfig.current ? Object.keys(parsedStoredConfig.current) : [],
                        defaultKeys: parsedStoredConfig.default ? Object.keys(parsedStoredConfig.default) : []
                    }
                });
                
                // Sincronizar variables globales
                syncGlobalVariables();
                
                // Verificar si hay configuración pendiente de guardar
                checkPendingSave();
                return;
            } catch (error) {
                console.warn('⚠️ Error parseando configuración del localStorage, cargando desde archivo...', error);
            }
        }
        
        // Si no hay localStorage o hay error, cargar desde archivo
        console.log('🔄 Cargando configuración desde archivo JSON...');
        const response = await fetch('config/wheelCONF.JSON');
        if (response.ok) {
            const data = await response.json();
            fullConfig = data;
            
            // Usar configuración actual o default
            const sourceConfig = data.current || data.default || defaultConfig;
            
            // Cargar configuración
            wheelConfig.prizes = sourceConfig.prizes || [];
            console.log('🔄 Config cargada desde archivo JSON - prizes:', wheelConfig.prizes);
            wheelConfig.colorPalette = sourceConfig.colorPalette || ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
            wheelConfig.theme = sourceConfig.theme || defaultConfig.theme;
            wheelConfig.consolationColors = sourceConfig.consolationColors || defaultConfig.consolationColors;
            wheelConfig.audio = sourceConfig.audio || defaultConfig.audio;
            wheelConfig.text = sourceConfig.text || defaultConfig.text;
            wheelConfig.logo = sourceConfig.logo || defaultConfig.logo;
            wheelConfig.topLogo = sourceConfig.topLogo || defaultConfig.topLogo;
            wheelConfig.grandPrizes = sourceConfig.grandPrizes || defaultConfig.grandPrizes;
            wheelConfig.sponsors = sourceConfig.sponsors || defaultConfig.sponsors;
            wheelConfig.sponsorsEnabled = sourceConfig.sponsorsEnabled !== undefined ? sourceConfig.sponsorsEnabled : defaultConfig.sponsorsEnabled;
            
            console.log('🔧 Configuración de sponsors cargada:', {
                sponsors: wheelConfig.sponsors?.length || 0,
                sponsorsEnabled: wheelConfig.sponsorsEnabled,
                sourceConfig: sourceConfig.sponsorsEnabled,
                defaultConfig: defaultConfig.sponsorsEnabled
            });
            
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
    
    // Actualizar visualización del logo superior
    if (window.UIModule?.updateTopLogoDisplay) {
        console.log('🔄 Llamando updateTopLogoDisplay desde loadWheelConfig');
        window.UIModule.updateTopLogoDisplay();
    }
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
    
    console.log('🔄 Variables globales sincronizadas:', {
        prizesCount: prizes.length,
        colorPaletteCount: wheelColorPalette.length,
        textColor: wheelTextColor,
        negativePrizesBgColor: negativePrizesBgColor,
        negativePrizesTextColor: negativePrizesTextColor
    });
}

// Función para guardar configuración
function saveConfig() {
    try {
        // Guardar configuración actual en localStorage
        localStorage.setItem('wheelConfig', JSON.stringify(wheelConfig));
        
        // Actualizar o crear fullConfig con la configuración actual
        if (fullConfig) {
            // Actualizar la configuración actual en fullConfig
            fullConfig.current = { ...wheelConfig };
            localStorage.setItem('fullWheelConfig', JSON.stringify(fullConfig));
            console.log('✅ Configuración completa actualizada y guardada en localStorage');
        } else {
            // Si no hay fullConfig, crear uno con la configuración actual
            const newFullConfig = {
                current: { ...wheelConfig },
                default: defaultConfig
            };
            localStorage.setItem('fullWheelConfig', JSON.stringify(newFullConfig));
            fullConfig = newFullConfig;
            console.log('✅ Nueva configuración completa creada y guardada en localStorage');
        }
        
        // Sincronizar variables globales después de guardar
        syncGlobalVariables();
        
        console.log('✅ Configuración guardada en localStorage');
    } catch (error) {
        console.error('❌ Error guardando configuración:', error);
    }
}

// Función para descargar configuración actualizada
function downloadUpdatedConfig() {
    if (!fullConfig) {
        console.error('❌ No hay configuración completa para descargar');
        return false;
    }

    console.log('🔄 Preparando descarga de configuración...');
    
    // Crear una copia de la configuración actual para asegurar consistencia
    const configToSave = {
        ...fullConfig,
        current: { ...wheelConfig },
        default: fullConfig.default || { ...wheelConfig }
    };

    const jsonString = JSON.stringify(configToSave, null, 2);
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
    console.log('✅ Archivo JSON descargado exitosamente');
    return true;
}

// Función para verificar si hay configuración pendiente de guardar
function checkPendingSave() {
    const pendingSave = localStorage.getItem('configPendingSave');
    if (pendingSave === 'true') {
        console.log('⚠️ Configuración pendiente de guardar detectada');
        
        // Mostrar notificación al usuario
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('⚠️ Hay cambios pendientes de guardar. Usa "Establecer como Default" y descarga el archivo JSON.', 'warning');
        }
        
        // Limpiar la marca de pendiente después de mostrar la notificación
        setTimeout(() => {
            localStorage.removeItem('configPendingSave');
        }, 5000);
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
    downloadUpdatedConfig,
    loadConfigFromStorage,
    checkPendingSave
};
