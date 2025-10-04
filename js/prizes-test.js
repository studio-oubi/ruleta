// Módulo de premios para la ruleta - VERSIÓN DE PRUEBA
console.log('🔄 Cargando PrizesModule (versión de prueba)...');

// Función simplificada para distribuir premios
function distributePrizesWithConsolationSpacing(prizes) {
    console.log('🎯 distributePrizesWithConsolationSpacing llamada con:', prizes);
    
    if (!prizes || prizes.length === 0) {
        console.error('❌ No hay premios para distribuir');
        return [];
    }
    
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
                        bgColor: '#dc143c', // Color por defecto
                        originalPrize: prize
                    });
                }
            }
        } else {
            // Premios de consuelo siempre se incluyen
            for (let i = 0; i < prize.quantity; i++) {
                allPrizes.push({
                    text: prize.text,
                    isNegative: prize.isNegative,
                    textColor: '#ffffff',
                    bgColor: '#000000', // Color negro para consuelos
                    hideText: prize.hideText || false
                });
            }
        }
    });
    
    // Asignar colores a premios regulares usando una paleta simple
    const colors = ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1', '#ff6b35', '#4ecdc4', '#45b7d1'];
    allPrizes.forEach((prize, index) => {
        if (!prize.isNegative) {
            prize.bgColor = colors[index % colors.length];
        }
    });
    
    console.log('🎯 Premios distribuidos finales:', allPrizes);
    console.log('🎯 Total de premios:', allPrizes.length);
    
    return allPrizes;
}

// Función para detectar si un premio es negativo
function isNegativePrize(text) {
    const negativeKeywords = ['VUELVE A INTENTARLO', 'MEJOR SUERTE', 'INTÉNTALO OTRA VEZ', 'PERDISTE', 'INTENTAR', 'SUERTE', 'CONSUELO'];
    const upperText = text.toUpperCase();
    return negativeKeywords.some(keyword => upperText.includes(keyword));
}

// Función para obtener icono de premio
function getPrizeIcon(prizeText) {
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
        'VUELVE A INTENTARLO': '😢',
        'MEJOR SUERTE': '😞',
        'INTÉNTALO OTRA VEZ': '😔'
    };
    
    return icons[prizeText] || '🏆';
}

// Función para obtener título del modal
function getModalTitle(prize) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (prize.isNegative) {
        const sadTitles = [
            'Mejor suerte la próxima vez 😔',
            'No fue esta vez 😞',
            'Inténtalo de nuevo 😢',
            'Sigue intentando 💪'
        ];
        return sadTitles[Math.floor(Math.random() * sadTitles.length)];
    } else {
        return wheelConfig?.text?.congratsText || 'Felicidades Ganaste un/a:';
    }
}

// Función para actualizar inventario
function updatePrizeInventory(prizeText) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const originalPrizeIndex = wheelConfig.prizes.findIndex(p => p.text === prizeText);
    if (originalPrizeIndex !== -1) {
        wheelConfig.prizes[originalPrizeIndex].inventory = Math.max(0, wheelConfig.prizes[originalPrizeIndex].inventory - 1);
        
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        console.log(`📦 Inventario actualizado para ${prizeText}: ${wheelConfig.prizes[originalPrizeIndex].inventory}`);
    }
}

// Exportar funciones para uso en otros módulos
window.PrizesModule = {
    distributePrizesWithConsolationSpacing,
    isNegativePrize,
    updatePrizeInventory,
    getPrizeIcon,
    getModalTitle
};

console.log('✅ PrizesModule (versión de prueba) exportado correctamente:', window.PrizesModule);
