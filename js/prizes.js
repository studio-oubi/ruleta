// Módulo de premios para la ruleta
// Maneja la distribución, espaciado y lógica de premios

console.log('🔄 Cargando PrizesModule...');

// Función para distribuir premios con espaciado uniforme de consuelos
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
                    textColor: window.ConfigModule?.wheelConfig?.consolationColors?.textColor || '#ffffff',
                    hideText: prize.hideText || false
                });
            }
        }
    });
    
    // Agregar gran premios si están habilitados
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (wheelConfig?.grandPrizes && wheelConfig.grandPrizes.length > 0) {
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
    // Usar directamente wheelConfig.colorPalette para obtener los colores más actualizados
    const wheelColorPalette = wheelConfig?.colorPalette || ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
    const colors = wheelColorPalette.length > 0 ? wheelColorPalette : ['#dc143c', '#ffd700', '#8b0000', '#2e8b57', '#ff8c00', '#4169e1'];
    regularPrizes.forEach((prize, index) => {
        if (prize.isGrandPrize) {
            // Buscar el grand prize correspondiente para obtener sus colores
            const grandPrize = wheelConfig?.grandPrizes?.find(gp => gp.name === prize.text);
            if (grandPrize) {
                prize.bgColor = grandPrize.colors.backgroundColor;
                prize.useGoldenGradient = grandPrize.useGoldenGradient || false;
                // Grand Prize configurado con degradado dorado si aplica
            } else {
                // Fallback si no se encuentra el grand prize
                prize.bgColor = '#ffd700';
                prize.useGoldenGradient = false;
            }
        } else {
            // Premios regulares usan la paleta de colores
            prize.bgColor = colors[index % colors.length];
        }
    });
    
    // Asignar color negro a premios de consuelo
    const consolationColors = window.ConfigModule?.wheelConfig?.consolationColors;
    consolationPrizes.forEach(prize => {
        prize.bgColor = consolationColors?.backgroundColor || '#000000';
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
    
    console.log('🎯 Premios distribuidos finales:', finalPrizes);
    console.log('🎯 Total de premios:', finalPrizes.length);
    
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

// Función para actualizar inventario de premio
function updatePrizeInventory(prizeText) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const originalPrizeIndex = wheelConfig.prizes.findIndex(p => p.text === prizeText);
    if (originalPrizeIndex !== -1) {
        // Restar del inventario
        wheelConfig.prizes[originalPrizeIndex].inventory = Math.max(0, wheelConfig.prizes[originalPrizeIndex].inventory - 1);
        
        // Guardar en localStorage
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        // Sincronizar variables globales
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        
        console.log(`📦 Inventario actualizado para ${prizeText}: ${wheelConfig.prizes[originalPrizeIndex].inventory}`);
    }
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

// Función para obtener título del modal según el tipo de premio
function getModalTitle(prize) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (prize.isNegative) {
        // Títulos más tristes para premios de consuelo
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

// Exportar funciones para uso en otros módulos
window.PrizesModule = {
    distributePrizesWithConsolationSpacing,
    isNegativePrize,
    verifyConsolationSpacing,
    updatePrizeInventory,
    getPrizeIcon,
    getModalTitle
};

console.log('✅ PrizesModule exportado correctamente:', window.PrizesModule);
