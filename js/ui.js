// Módulo de interfaz de usuario para la ruleta
// Maneja configuración, modales y eventos de UI

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
            if (window.AudioModule?.setAudioVolume) {
                window.AudioModule.setAudioVolume(parseFloat(this.value) / 100);
            }
        });
    }

    // Fullscreen checkbox
    const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
    if (fullscreenCheckbox) {
        fullscreenCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (window.UtilsModule?.enterFullscreen) {
                    window.UtilsModule.enterFullscreen();
                }
            } else {
                if (window.UtilsModule?.exitFullscreen) {
                    window.UtilsModule.exitFullscreen();
                }
            }
        });
    }

    // Color pickers con cambios en tiempo real
    setupColorPicker('bgColorInput', 'bgColorSwatch', () => {
        const color = document.getElementById('bgColorInput').value;
        const raysBackground = document.querySelector('.rays-background');
        if (raysBackground && window.UtilsModule?.generateRaysGradient) {
            // Establecer el color de fondo principal
            raysBackground.style.backgroundColor = color;
            
            // Aplicar rayos con formato rgba
            const raysGradient = window.UtilsModule.generateRaysGradient(color);
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
            const wheelConfig = window.ConfigModule?.wheelConfig;
            if (wheelConfig?.grandPrize) {
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
                    if (window.UtilsModule?.updateFavicon) {
                        window.UtilsModule.updateFavicon(logoUrl);
                    }
                    
                    // Actualizar configuración
                    const wheelConfig = window.ConfigModule?.wheelConfig;
                    if (wheelConfig) {
                        wheelConfig.logo.src = logoUrl;
                    }
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
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
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

    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;

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
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    wheelConfig.colorPalette[index] = newColor;
    renderColorPalette();
    
    // Aplicar cambios inmediatamente
    if (window.ConfigModule?.syncGlobalVariables) {
        window.ConfigModule.syncGlobalVariables();
    }
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Agregar color a paleta
function addColorToPalette() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    wheelConfig.colorPalette.push(randomColor);
    renderColorPalette();
    
    // Aplicar cambios inmediatamente
    if (window.ConfigModule?.syncGlobalVariables) {
        window.ConfigModule.syncGlobalVariables();
    }
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Remover color de paleta
function removeColorFromPalette(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    if (wheelConfig.colorPalette.length > 1) {
        wheelConfig.colorPalette.splice(index, 1);
        renderColorPalette();
        
        // Aplicar cambios inmediatamente
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}

// Renderizar premios
function renderPrizes() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const realPrizes = wheelConfig.prizes.filter(prize => !prize.isNegative);
    const negativePrizes = wheelConfig.prizes.filter(prize => prize.isNegative);

    renderPrizeList('realPrizesList', realPrizes, false);
    renderPrizeList('negativePrizesList', negativePrizes, true);
    
    // Mostrar resumen de premios
    updatePrizeSummary();
}

// Actualizar resumen de premios
function updatePrizeSummary() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const realPrizes = wheelConfig.prizes.filter(p => !p.isNegative);
    const totalRealPrizes = realPrizes.reduce((sum, p) => sum + p.quantity, 0);
    const totalNegativePrizes = wheelConfig.prizes.filter(p => p.isNegative).reduce((sum, p) => sum + p.quantity, 0);
    const totalPrizes = totalRealPrizes + totalNegativePrizes;
    
    // Calcular inventario disponible
    const availableInventory = realPrizes.reduce((sum, p) => sum + (p.inventory || 0), 0);
    
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

    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;

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
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
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
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        console.log(`🎁 Premio actualizado: ${field} = ${value}`, wheelConfig.prizes[index]);
        
        // Mostrar feedback visual
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus(`Premio actualizado: ${field} = ${value}`, 'success');
        }
    }
}

// Agregar premio
function addPrize(isNegative) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const newPrize = {
        text: isNegative ? 'VUELVE A INTENTARLO' : '',
        quantity: isNegative ? 3 : 1,
        isNegative: isNegative
    };
    wheelConfig.prizes.push(newPrize);
    renderPrizes();
    
    // Aplicar cambios inmediatamente
    if (window.ConfigModule?.syncGlobalVariables) {
        window.ConfigModule.syncGlobalVariables();
    }
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    console.log('🎁 Premio agregado:', newPrize);
}

// Remover premio
function removePrize(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    if (index >= 0 && index < wheelConfig.prizes.length) {
        const removedPrize = wheelConfig.prizes[index];
        wheelConfig.prizes.splice(index, 1);
        renderPrizes();
        
        // Aplicar cambios inmediatamente
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
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
    
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    Object.keys(wheelConfig.presets || {}).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Guardar preset
function savePreset() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const name = document.getElementById('presetName').value.trim();
    if (!name) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Por favor ingresa un nombre para el preset', 'error');
        }
        return;
    }
    
    if (!wheelConfig.presets) {
        wheelConfig.presets = {};
    }
    
    wheelConfig.presets[name] = JSON.parse(JSON.stringify(wheelConfig));
    loadPresetList();
    document.getElementById('presetName').value = '';
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus(`Preset "${name}" guardado exitosamente`, 'success');
    }
}

// Cargar preset
function loadPreset() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const select = document.getElementById('presetSelect');
    const selectedName = select.value;
    if (!selectedName) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Por favor selecciona un preset', 'error');
        }
        return;
    }
    
    const preset = wheelConfig.presets[selectedName];
    if (!preset) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Preset no encontrado', 'error');
        }
        return;
    }
    
    Object.assign(wheelConfig, preset);
    loadCurrentSettings();
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus(`Preset "${selectedName}" cargado exitosamente`, 'success');
    }
}

// Eliminar preset
function deletePreset() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const select = document.getElementById('presetSelect');
    const selectedName = select.value;
    if (!selectedName) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Por favor selecciona un preset para eliminar', 'error');
        }
        return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el preset "${selectedName}"?`)) {
        return;
    }
    
    delete wheelConfig.presets[selectedName];
    loadPresetList();
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus(`Preset "${selectedName}" eliminado exitosamente`, 'success');
    }
}

// Restaurar defaults
function restoreDefaults() {
    if (!confirm('¿Estás seguro de que quieres restaurar todos los valores por defecto?')) {
        return;
    }
    
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    // Restaurar configuración por defecto
    Object.assign(wheelConfig, {
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
    });
    
    loadCurrentSettings();
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus('Configuración restaurada a valores por defecto', 'success');
    }
}

// Establecer como default
function setAsDefault() {
    if (!confirm('¿Estás seguro de que quieres establecer la configuración actual como la nueva configuración por defecto?')) {
        return;
    }
    
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus('Configuración actual establecida como nueva configuración por defecto', 'success');
    }
}

// Descargar configuración
function downloadConfig() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
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
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus('Archivo JSON descargado', 'success');
    }
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
        if (window.UtilsModule?.updateFavicon) {
            window.UtilsModule.updateFavicon(originalLogo);
        }
        
        // Actualizar configuración
        const wheelConfig = window.ConfigModule?.wheelConfig;
        if (wheelConfig) {
            wheelConfig.logo.src = originalLogo;
        }
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Logo restaurado al original', 'success');
        }
    }
}

// Guardar toda la configuración
function saveAllSettings() {
    try {
        const wheelConfig = window.ConfigModule?.wheelConfig;
        if (!wheelConfig) return;
        
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
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        // Sincronizar variables globales
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        
        // Aplicar cambios visuales inmediatamente
        applyVisualChanges();
        
        // Redibujar la ruleta
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('✅ Configuración guardada exitosamente', 'success');
        }
        closeConfigModal();
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('❌ Error al guardar configuración', 'error');
        }
    }
}

// Aplicar cambios visuales
function applyVisualChanges() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    // Aplicar color de fondo a rays-background (no a ruleta-app)
    const raysBackground = document.querySelector('.rays-background');
    if (raysBackground && window.UtilsModule?.generateRaysGradient) {
        // Establecer el color de fondo principal
        raysBackground.style.backgroundColor = wheelConfig.theme.backgroundColor;
        
        // Aplicar rayos con formato rgba
        const raysGradient = window.UtilsModule.generateRaysGradient(wheelConfig.theme.backgroundColor);
        raysBackground.style.background = `${raysGradient}, ${wheelConfig.theme.backgroundColor}`;
    }
    
    // Actualizar logo
    const logo = document.querySelector('.center-logo');
    if (logo) {
        logo.src = wheelConfig.logo.src;
    }
    
    // Actualizar favicon dinámicamente
    if (window.UtilsModule?.updateFavicon) {
        window.UtilsModule.updateFavicon(wheelConfig.logo.src);
    }
    
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

// ===== FUNCIONES PARA MÚLTIPLES GRAND PRIZES =====

// Renderizar lista de grand prizes
function renderGrandPrizes() {
    const container = document.getElementById('grandPrizesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
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
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
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
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const newGrandPrize = {
        enabled: true,
        name: 'Nuevo Grand Prize',
        probability: 5,
        colors: {
            backgroundColor: '#ffd700',
            textColor: '#000000'
        }
    };
    
    if (!wheelConfig.grandPrizes) {
        wheelConfig.grandPrizes = [];
    }
    
    wheelConfig.grandPrizes.push(newGrandPrize);
    renderGrandPrizes();
    
    // Aplicar cambios inmediatamente
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
}

// Remover grand prize
function removeGrandPrize(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    if (wheelConfig.grandPrizes && wheelConfig.grandPrizes.length > 1) {
        wheelConfig.grandPrizes.splice(index, 1);
        renderGrandPrizes();
        
        // Aplicar cambios inmediatamente
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}

// Exportar funciones para uso en otros módulos
window.UIModule = {
    initSettings,
    closeConfigModal,
    setupConfigEventListeners,
    setupColorPicker,
    loadCurrentSettings,
    renderColorPalette,
    updatePaletteColor,
    addColorToPalette,
    removeColorFromPalette,
    renderPrizes,
    updatePrizeSummary,
    renderPrizeList,
    updatePrize,
    addPrize,
    removePrize,
    loadPresetList,
    savePreset,
    loadPreset,
    deletePreset,
    restoreDefaults,
    setAsDefault,
    downloadConfig,
    resetLogo,
    saveAllSettings,
    applyVisualChanges,
    renderGrandPrizes,
    updateGrandPrize,
    addGrandPrize,
    removeGrandPrize
};
