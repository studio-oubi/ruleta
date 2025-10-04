// Módulo de utilidades para la ruleta
// Funciones auxiliares y de conversión

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

// Función para convertir hex a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
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
function updateFullscreenState() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
    if (fullscreenCheckbox) {
        fullscreenCheckbox.checked = isFullscreen;
    }
    
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (wheelConfig) {
        wheelConfig.display = wheelConfig.display || {};
        wheelConfig.display.fullscreen = isFullscreen;
    }
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

// Función para generar confetti
function launchConfetti() {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const confettiInterval = setInterval(() => {
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
    
    return confettiInterval;
}

// Función para limpiar confetti
function clearConfetti(confettiInterval) {
    if (confettiInterval) {
        clearInterval(confettiInterval);
    }
}

// Función para crear degradado radial para segmentos de ruleta
function createWheelSegmentGradient(ctx, centerX, centerY, baseColor, radius) {
    // Manejar colores especiales (como negro para consuelos)
    if (baseColor === '#000000' || baseColor === '#000') {
        // Para colores muy oscuros, crear un degradado sutil
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#333333');  // Centro gris oscuro
        gradient.addColorStop(0.6, '#000000'); // Negro en el medio
        gradient.addColorStop(1, '#000000');   // Negro en el borde
        return gradient;
    }
    
    const hsl = hexToHSLInit(baseColor);
    
    // Crear variaciones del color base
    const lighterColor = hslToHexInit(hsl.h, hsl.s, Math.min(100, hsl.l + 25));
    const darkerColor = hslToHexInit(hsl.h, hsl.s, Math.max(0, hsl.l - 25));
    
    // Crear degradado radial
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,           // Centro del círculo
        centerX, centerY, radius       // Radio del círculo
    );
    
    // Agregar paradas de color
    gradient.addColorStop(0, lighterColor);    // Centro más claro
    gradient.addColorStop(0.6, baseColor);     // Color base en el medio
    gradient.addColorStop(1, darkerColor);     // Borde más oscuro
    
    return gradient;
}

// Exportar funciones para uso en otros módulos
window.UtilsModule = {
    hexToHSLInit,
    hslToHexInit,
    calculateRaysColorInit,
    hslToRgb,
    generateRaysGradient,
    hexToRgb,
    createWheelSegmentGradient,
    enterFullscreen,
    exitFullscreen,
    updateFullscreenState,
    updateFavicon,
    showStatus,
    launchConfetti,
    clearConfetti
};
