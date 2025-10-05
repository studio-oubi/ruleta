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

    // Checkbox para ocultar texto de consolación
    const hideConsolationText = document.getElementById('hideConsolationText');
    if (hideConsolationText) {
        hideConsolationText.addEventListener('change', function() {
            const wheelConfig = window.ConfigModule?.wheelConfig;
            if (wheelConfig?.consolationColors) {
                wheelConfig.consolationColors.hideText = this.checked;
                // Redibujar la ruleta inmediatamente
                if (window.wheelInstance) {
                    window.wheelInstance.drawWheel();
                }
            }
        });
    }

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
    
    // Top logo upload
    const topLogoInput = document.getElementById('topLogoInput');
    if (topLogoInput) {
        topLogoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const logoUrl = event.target.result;
                    
                    // Actualizar preview
                    const topLogoPreview = document.getElementById('topLogoPreview');
                    if (topLogoPreview) {
                        topLogoPreview.src = logoUrl;
                    }
                    
                    // Aplicar logo superior en tiempo real
                    const topLogo = document.getElementById('topLogo');
                    if (topLogo) {
                        topLogo.style.setProperty('background-image', `url(${logoUrl})`, 'important');
                    }
                    
                    // Actualizar configuración
                    const wheelConfig = window.ConfigModule?.wheelConfig;
                    console.log('🔍 Debug carga logo superior:', {
                        wheelConfig: !!wheelConfig,
                        topLogo: !!wheelConfig?.topLogo,
                        logoUrl: logoUrl
                    });
                    
                    if (wheelConfig && wheelConfig.topLogo) {
                        wheelConfig.topLogo.src = logoUrl;
                        wheelConfig.topLogo.enabled = true; // Activar automáticamente al cargar imagen
                        console.log('✅ Configuración actualizada:', wheelConfig.topLogo);
                        window.ConfigModule?.saveConfig();
                        
                        // Actualizar checkbox y controles
                        const topLogoEnabled = document.getElementById('topLogoEnabled');
                        if (topLogoEnabled) {
                            topLogoEnabled.checked = true;
                            console.log('✅ Checkbox marcado');
                        }
                        
                        // Actualizar visualización
                        console.log('🔄 Llamando updateTopLogoDisplay...');
                        updateTopLogoDisplay();
                        renderTopLogoConfig();
                    } else {
                        console.log('❌ No se pudo actualizar configuración');
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

    // Checkbox para ocultar texto de consolación
    const hideConsolationText = document.getElementById('hideConsolationText');
    if (hideConsolationText) {
        hideConsolationText.checked = wheelConfig.consolationColors.hideText || false;
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
    
    // Renderizar configuración del logo superior
    renderTopLogoConfig();
    
    // Aplicar logo superior después de cargar configuración
    if (window.UIModule?.updateTopLogoDisplay) {
        console.log('🔄 Aplicando logo superior desde loadCurrentSettings...');
        window.UIModule.updateTopLogoDisplay();
    }

    // Cargar presets
    loadPresetList();
    
    // Cargar estado de sponsors
    const sponsorsEnabled = document.getElementById('sponsorsEnabled');
    if (sponsorsEnabled) {
        console.log('🔧 Cargando estado de sponsors:', wheelConfig.sponsorsEnabled);
        sponsorsEnabled.checked = wheelConfig.sponsorsEnabled || false;
        
        // Si los sponsors están habilitados, mostrar los controles
        if (wheelConfig.sponsorsEnabled) {
            console.log('✅ Mostrando controles de sponsors...');
            const sponsorsControls = document.getElementById('sponsorsControls');
            const sponsorsList = document.getElementById('sponsorsList');
            const sponsorsFilter = document.getElementById('sponsorsFilter');
            
            if (sponsorsControls) sponsorsControls.style.display = 'block';
            if (sponsorsList) sponsorsList.style.display = 'block';
            if (sponsorsFilter) sponsorsFilter.style.display = 'block';
        }
    }
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
            <div class="palette-color-preview" id="palettePreview${index}" style="background-color: ${color}" onclick="document.getElementById('paletteColor${index}').click()"></div>
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
    
    // Actualizar el color en la configuración
    wheelConfig.colorPalette[index] = newColor;
    
    // Actualizar preview visual inmediatamente
    const previewElement = document.getElementById(`palettePreview${index}`);
    if (previewElement) {
        previewElement.style.backgroundColor = newColor;
    }
    
    // Aplicar cambios inmediatamente
    if (window.ConfigModule?.syncGlobalVariables) {
        window.ConfigModule.syncGlobalVariables();
    }
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    // Guardar configuración automáticamente
    if (window.ConfigModule?.saveConfig) {
        window.ConfigModule.saveConfig();
    }
    
    console.log(`🎨 Color de paleta actualizado en índice ${index}: ${newColor}`);
    console.log('🎨 Paleta actualizada:', wheelConfig.colorPalette);
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
    
    // Guardar configuración automáticamente
    if (window.ConfigModule?.saveConfig) {
        window.ConfigModule.saveConfig();
    }
    
    console.log(`🎨 Nuevo color agregado a la paleta: ${randomColor}`);
}

// Remover color de paleta
function removeColorFromPalette(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    if (wheelConfig.colorPalette.length > 1) {
        const removedColor = wheelConfig.colorPalette[index];
        wheelConfig.colorPalette.splice(index, 1);
        renderColorPalette();
        
        // Aplicar cambios inmediatamente
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        // Guardar configuración automáticamente
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        console.log(`🎨 Color removido de la paleta: ${removedColor}`);
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
            // Premios de consuelo - sin inventario pero con opción de ocultar texto
            htmlContent = `
                <input type="text" value="${prize.text}" placeholder="Nombre del premio" onchange="updatePrize(${realIndex}, 'text', this.value)" style="flex: 2;">
                <input type="number" value="${prize.quantity}" placeholder="Cantidad" min="1" max="999" step="1" onchange="updatePrize(${realIndex}, 'quantity', parseInt(this.value) || 1)" style="flex: 1; text-align: center;">
                <label style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                    <input type="checkbox" ${prize.hideText ? 'checked' : ''} onchange="updatePrize(${realIndex}, 'hideText', this.checked)" style="margin-right: 5px;">
                    Ocultar texto
                </label>
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
        isNegative: isNegative,
        hideText: isNegative ? false : undefined // Solo para premios de consolación
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

// Cargar lista de presets desde el servidor
async function loadPresetList() {
    const select = document.getElementById('presetSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Cargando presets...</option>';
    
    try {
        const currentHost = window.location.origin;
        const response = await fetch(`${currentHost}/api/presets/list`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        select.innerHTML = '<option value="">Seleccionar preset...</option>';
        
        if (result.success && result.presets && result.presets.length > 0) {
            result.presets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.name;
                option.textContent = preset.name;
                option.title = `Creado: ${new Date(preset.created).toLocaleDateString()}`;
                select.appendChild(option);
            });
            
            console.log(`✅ ${result.count} presets cargados desde el servidor`);
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay presets disponibles";
            option.disabled = true;
            select.appendChild(option);
        }
        
    } catch (error) {
        console.error('❌ Error cargando presets:', error);
        select.innerHTML = '<option value="">Error cargando presets</option>';
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Error cargando presets del servidor', 'error');
        }
    }
}

// Guardar preset en el servidor
async function savePreset() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const name = document.getElementById('presetName').value.trim();
    if (!name) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Por favor ingresa un nombre para el preset', 'error');
        }
        return;
    }
    
    try {
        const currentHost = window.location.origin;
        const response = await fetch(`${currentHost}/api/presets/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                config: wheelConfig
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('presetName').value = '';
            await loadPresetList(); // Recargar lista desde servidor
            
            if (window.UtilsModule?.showStatus) {
                window.UtilsModule.showStatus(result.message, 'success');
            }
            
            console.log(`✅ Preset "${name}" guardado en servidor:`, result.filename);
        } else {
            throw new Error(result.message || 'Error desconocido al guardar preset');
        }
        
    } catch (error) {
        console.error('❌ Error guardando preset:', error);
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus(`Error guardando preset: ${error.message}`, 'error');
        }
    }
}

// Cargar preset desde el servidor
async function loadPreset() {
    const select = document.getElementById('presetSelect');
    const selectedName = select.value;
    if (!selectedName) {
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Por favor selecciona un preset', 'error');
        }
        return;
    }
    
    try {
        const currentHost = window.location.origin;
        const response = await fetch(`${currentHost}/api/presets/load/${encodeURIComponent(selectedName)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.preset) {
            const wheelConfig = window.ConfigModule?.wheelConfig;
            if (!wheelConfig) {
                throw new Error('ConfigModule no disponible');
            }
            
            // Cargar la configuración del preset
            Object.assign(wheelConfig, result.preset.config);
            
            // Actualizar la interfaz
            loadCurrentSettings();
            
            // Actualizar la ruleta visualmente
            if (window.wheelInstance) {
                window.wheelInstance.drawWheel();
            }
            
            // Actualizar sponsors si están habilitados
            if (window.UIModule?.updateSponsorsDisplay) {
                window.UIModule.updateSponsorsDisplay();
            }
            
            if (window.UtilsModule?.showStatus) {
                window.UtilsModule.showStatus(`Preset "${selectedName}" cargado exitosamente`, 'success');
            }
            
            console.log(`✅ Preset "${selectedName}" cargado desde servidor`);
        } else {
            throw new Error('Preset no encontrado o formato inválido');
        }
        
    } catch (error) {
        console.error('❌ Error cargando preset:', error);
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus(`Error cargando preset: ${error.message}`, 'error');
        }
    }
}

// Eliminar preset del servidor
async function deletePreset() {
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
    
    try {
        const currentHost = window.location.origin;
        const response = await fetch(`${currentHost}/api/presets/delete/${encodeURIComponent(selectedName)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            await loadPresetList(); // Recargar lista desde servidor
            
            if (window.UtilsModule?.showStatus) {
                window.UtilsModule.showStatus(result.message, 'success');
            }
            
            console.log(`✅ Preset "${selectedName}" eliminado del servidor`);
        } else {
            throw new Error(result.message || 'Error desconocido al eliminar preset');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando preset:', error);
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus(`Error eliminando preset: ${error.message}`, 'error');
        }
    }
}

// Restaurar defaults
function restoreDefaults() {
    if (!confirm('¿Estás seguro de que quieres restaurar todos los valores por defecto?')) {
        return;
    }
    
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    // Configuración por defecto completa
    const defaultConfigRestored = {
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
            textColor: '#ffffff',
            hideText: false
        },
        grandPrizes: [
            {
                enabled: false,
                name: 'iPhone 15 Pro',
                probability: 5,
                useGoldenGradient: false,
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
        sponsors: [],
        sponsorsEnabled: false,
        presets: wheelConfig.presets || {}, // Mantener presets existentes
        version: '2.0.0'
    };

    // Restaurar configuración actual
    Object.assign(wheelConfig, defaultConfigRestored);
    
    // Actualizar fullConfig para que persista después del refresh
    if (window.ConfigModule) {
        // Obtener o crear fullConfig
        if (!window.ConfigModule.fullConfig) {
            window.ConfigModule.fullConfig = {};
        }
        
        // Actualizar tanto current como default
        window.ConfigModule.fullConfig.current = { ...defaultConfigRestored };
        window.ConfigModule.fullConfig.default = { ...defaultConfigRestored };
        
        console.log('✅ fullConfig actualizado:', window.ConfigModule.fullConfig);
    }
    
    // Guardar configuración en localStorage
    if (window.ConfigModule?.saveConfig) {
        window.ConfigModule.saveConfig();
    }
    
    // Forzar guardado de configuración completa para asegurar que se guarde como current
    try {
        const fullConfigToSave = {
            current: { ...defaultConfigRestored },
            default: { ...defaultConfigRestored }
        };
        localStorage.setItem('fullWheelConfig', JSON.stringify(fullConfigToSave));
        console.log('✅ Configuración completa forzada a localStorage:', fullConfigToSave);
    } catch (error) {
        console.error('❌ Error forzando guardado:', error);
    }
    
    // Actualizar interfaz
    loadCurrentSettings();
    
    // Actualizar ruleta visualmente
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    // Actualizar sponsors carousel si está habilitado
    if (window.UIModule?.updateSponsorsDisplay) {
        window.UIModule.updateSponsorsDisplay();
    }
    
    // Actualizar top logo después de restaurar configuración
    if (window.UIModule?.updateTopLogoDisplay) {
        console.log('🔄 Actualizando top logo después de restoreDefaults...');
        window.UIModule.updateTopLogoDisplay();
    }
    
    if (window.UtilsModule?.showStatus) {
        window.UtilsModule.showStatus('Configuración restaurada a valores por defecto', 'success');
    }
}

// Limpiar cache del sitio
function clearSiteCache() {
    if (!confirm('¿Estás seguro de que quieres limpiar toda la cache del sitio?\n\nEsto eliminará:\n- Configuración guardada\n- Presets personalizados\n- Sponsors cargados\n\nLa aplicación volverá a cargar desde el archivo JSON original.')) {
        return;
    }
    
    try {
        // Limpiar localStorage
        localStorage.removeItem('wheelConfig');
        localStorage.removeItem('fullWheelConfig');
        
        // Limpiar sessionStorage si existe
        sessionStorage.clear();
        
        // Limpiar configuración en memoria
        if (window.ConfigModule) {
            window.ConfigModule.wheelConfig = null;
            window.ConfigModule.fullConfig = null;
        }
        
        console.log('✅ Cache del sitio limpiada completamente');
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Cache limpiada. Recarga la página para ver los cambios.', 'success');
        }
        
        // Opcional: Recargar la página automáticamente
        setTimeout(() => {
            if (confirm('¿Quieres recargar la página ahora para aplicar los cambios?')) {
                window.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error limpiando cache:', error);
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('Error limpiando cache: ' + error.message, 'error');
        }
    }
}

// Establecer como default
async function setAsDefault() {
    console.log('🔄 Iniciando setAsDefault...');
    
    if (!confirm('¿Estás seguro de que quieres establecer la configuración actual como la nueva configuración por defecto?')) {
        console.log('❌ Usuario canceló la operación');
        return;
    }
    
    console.log('✅ Usuario confirmó la operación');
    
    try {
        const wheelConfig = window.ConfigModule?.wheelConfig;
        const fullConfig = window.ConfigModule?.fullConfig;
        
        console.log('🔍 Debug setAsDefault:', {
            wheelConfig: !!wheelConfig,
            fullConfig: !!fullConfig,
            ConfigModule: !!window.ConfigModule
        });
        
        if (!wheelConfig) {
            console.error('❌ wheelConfig no disponible');
            if (window.UtilsModule?.showStatus) {
                window.UtilsModule.showStatus('Error: Configuración de la ruleta no disponible', 'error');
            }
            return;
        }
        
        if (!fullConfig) {
            console.error('❌ fullConfig no disponible, creando estructura...');
            // Crear estructura fullConfig si no existe
            window.ConfigModule.fullConfig = {
                current: wheelConfig,
                default: { ...wheelConfig },
                presets: {},
                version: '2.0.0'
            };
            console.log('✅ Estructura fullConfig creada');
        }
        
        // Crear una copia profunda de la configuración actual
        const currentConfigCopy = JSON.parse(JSON.stringify(wheelConfig));
        
        // Obtener fullConfig actualizado (puede haber sido creado arriba)
        const updatedFullConfig = window.ConfigModule?.fullConfig;
        
        // Actualizar tanto la configuración default como la actual
        updatedFullConfig.default = currentConfigCopy;
        updatedFullConfig.current = currentConfigCopy;
        
        // También actualizar wheelConfig para que los cambios se reflejen inmediatamente
        Object.assign(wheelConfig, currentConfigCopy);
        
        // Guardar en localStorage como respaldo
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        console.log('✅ Configuración por defecto y actual actualizadas:', {
            default: updatedFullConfig.default,
            current: updatedFullConfig.current
        });
        
        // Ofrecer descargar el archivo JSON actualizado
        const userChoice = confirm(
            '✅ Configuración establecida como nueva configuración por defecto.\n\n' +
            'Para que persista entre sesiones, descarga el archivo JSON actualizado y reemplaza el archivo config/wheelCONF.JSON manualmente.\n\n' +
            '¿Quieres descargar el archivo JSON ahora?'
        );
        
        if (userChoice && window.ConfigModule?.downloadUpdatedConfig) {
            const downloaded = window.ConfigModule.downloadUpdatedConfig();
            if (downloaded) {
                if (window.UtilsModule?.showStatus) {
                    window.UtilsModule.showStatus('📁 Archivo JSON descargado. Reemplaza config/wheelCONF.JSON manualmente para persistir los cambios.', 'success');
                }
            }
        } else {
            if (window.UtilsModule?.showStatus) {
                window.UtilsModule.showStatus('💾 Configuración guardada en el navegador. Persistirá solo en esta sesión.', 'info');
            }
        }
        
        // Sincronizar variables globales para aplicar cambios inmediatamente
        if (window.ConfigModule?.syncGlobalVariables) {
            window.ConfigModule.syncGlobalVariables();
        }
        
        // Redibujar la ruleta para aplicar cambios visuales
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('✅ Configuración actual sobrescrita y establecida como nueva configuración por defecto', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error estableciendo configuración por defecto:', error);
        if (window.UtilsModule?.showStatus) {
            window.UtilsModule.showStatus('❌ Error al establecer configuración por defecto', 'error');
        }
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

// Descargar configuración completa actualizada
function downloadUpdatedConfig() {
    const fullConfig = window.ConfigModule?.fullConfig;
    if (!fullConfig) {
        console.error('❌ No se encontró la configuración completa');
        return;
    }
    
    const jsonString = JSON.stringify(fullConfig, null, 2);
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
        window.UtilsModule.showStatus('✅ Archivo JSON actualizado descargado', 'success');
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
        wheelConfig.consolationColors.hideText = document.getElementById('hideConsolationText').checked;
        
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
        
        // Guardar estado de sponsors
        const sponsorsEnabled = document.getElementById('sponsorsEnabled');
        if (sponsorsEnabled) {
            wheelConfig.sponsorsEnabled = sponsorsEnabled.checked;
        }
        
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
        
        // Crear preview del degradado dorado
        const goldenGradientStyle = grandPrize.useGoldenGradient ? 
            'repeating-linear-gradient(to right, #a2682a 0%, #be8c3c 8%, #be8c3c 18%, #d3b15f 27%, #faf0a0 35%, #ffffc2 40%, #faf0a0 50%, #d3b15f 58%, #be8c3c 67%, #b17b32 77%, #bb8332 83%, #d4a245 88%, #e1b453 93%, #a4692a 100%)' : 
            '';
        
        const previewStyle = grandPrize.useGoldenGradient ? 
            `background: ${goldenGradientStyle}; background-size: 150%;` : 
            `background-color: ${grandPrize.colors.backgroundColor};`;
        
        item.innerHTML = `
            <input type="text" value="${grandPrize.name}" placeholder="Nombre" onchange="updateGrandPrize(${index}, 'name', this.value)" class="small-input">
            <input type="number" value="${grandPrize.probability}" placeholder="%" min="0" max="100" step="0.1" onchange="updateGrandPrize(${index}, 'probability', parseFloat(this.value) || 0)" class="small-input">
            
            <div class="checkbox-container">
                <label class="checkbox-label">
                    <input type="checkbox" ${grandPrize.useGoldenGradient ? 'checked' : ''} onchange="updateGrandPrize(${index}, 'useGoldenGradient', this.checked)">
                    ✨
                </label>
            </div>
            
            <div class="color-picker-container">
                <div class="color-swatch" id="grandPrizeBgSwatch${index}" style="background-color: ${grandPrize.colors.backgroundColor};" onclick="document.getElementById('grandPrizeBgInput${index}').click()" title="Color Fondo"></div>
                <input type="color" id="grandPrizeBgInput${index}" value="${grandPrize.colors.backgroundColor}" onchange="updateGrandPrize(${index}, 'backgroundColor', this.value)">
            </div>
            
            <div class="color-picker-container">
                <div class="color-swatch" id="grandPrizeTextSwatch${index}" style="background-color: ${grandPrize.colors.textColor};" onclick="document.getElementById('grandPrizeTextInput${index}').click()" title="Color Texto"></div>
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
        
        // Log especial para degradado dorado
        if (field === 'useGoldenGradient') {
            console.log(`✨ Degradado dorado ${value ? 'activado' : 'desactivado'} para Grand Prize ${index}`);
        }
        
        // Guardar configuración
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        // Aplicar cambios inmediatamente
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
    }
}

// Seleccionar degradado dorado
function selectGradient(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig || !wheelConfig.grandPrizes || !wheelConfig.grandPrizes[index]) return;
    
    // Activar degradado dorado
    wheelConfig.grandPrizes[index].useGoldenGradient = true;
    
    // Guardar configuración
    if (window.ConfigModule?.saveConfig) {
        window.ConfigModule.saveConfig();
    }
    
    // Actualizar vista
    renderGrandPrizes();
    
    // Aplicar cambios inmediatamente
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    console.log(`✨ Degradado dorado seleccionado para Grand Prize ${index}`);
}

// Seleccionar color sólido
function selectSolidColor(index) {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig || !wheelConfig.grandPrizes || !wheelConfig.grandPrizes[index]) return;
    
    // Desactivar degradado dorado
    wheelConfig.grandPrizes[index].useGoldenGradient = false;
    
    // Guardar configuración
    if (window.ConfigModule?.saveConfig) {
        window.ConfigModule.saveConfig();
    }
    
    // Actualizar vista
    renderGrandPrizes();
    
    // Aplicar cambios inmediatamente
    if (window.wheelInstance) {
        window.wheelInstance.drawWheel();
    }
    
    console.log(`🎨 Color sólido seleccionado para Grand Prize ${index}`);
}

// Agregar grand prize
function addGrandPrize() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (!wheelConfig) return;
    
    const newGrandPrize = {
        enabled: true,
        name: 'Nuevo Grand Prize',
        probability: 5,
        useGoldenGradient: false, // Por defecto desactivado
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
    
    if (wheelConfig.grandPrizes && index >= 0 && index < wheelConfig.grandPrizes.length) {
        const removedGrandPrize = wheelConfig.grandPrizes[index];
        wheelConfig.grandPrizes.splice(index, 1);
        renderGrandPrizes();
        
        // Guardar configuración
        if (window.ConfigModule?.saveConfig) {
            window.ConfigModule.saveConfig();
        }
        
        // Aplicar cambios inmediatamente
        if (window.wheelInstance) {
            window.wheelInstance.drawWheel();
        }
        
        console.log('🗑️ Grand Prize eliminado:', removedGrandPrize);
    } else {
        console.warn('⚠️ No se pudo eliminar Grand Prize: índice inválido o array vacío');
    }
}

// Renderizar configuración de logo superior
function renderTopLogoConfig() {
    const topLogoEnabled = document.getElementById('topLogoEnabled');
    const topLogoPreview = document.getElementById('topLogoPreview');
    const topLogoControls = document.getElementById('topLogoControls');
    const topLogoFileControls = document.getElementById('topLogoFileControls');
    const resetTopLogo = document.getElementById('resetTopLogo');
    const wheelConfig = window.ConfigModule?.wheelConfig;
    
    if (topLogoEnabled && wheelConfig?.topLogo) {
        topLogoEnabled.checked = wheelConfig.topLogo.enabled || false;
        
        if (wheelConfig.topLogo.enabled) {
            topLogoControls.style.display = 'block';
            topLogoFileControls.style.display = 'block';
            resetTopLogo.style.display = 'block';
            
            if (topLogoPreview && wheelConfig.topLogo.src) {
                topLogoPreview.src = wheelConfig.topLogo.src;
            }
        } else {
            topLogoControls.style.display = 'none';
            topLogoFileControls.style.display = 'none';
            resetTopLogo.style.display = 'none';
        }
        
        // Event listener para el checkbox
        topLogoEnabled.addEventListener('change', function() {
            if (wheelConfig.topLogo) {
                wheelConfig.topLogo.enabled = this.checked;
                updateTopLogoDisplay();
                renderTopLogoConfig();
            }
        });
    }
}

// Actualizar visualización del logo superior
function updateTopLogoDisplay() {
    const topLogoContainer = document.getElementById('topLogoContainer');
    const topLogo = document.getElementById('topLogo');
    const wheelConfig = window.ConfigModule?.wheelConfig;
    
    console.log('🔍 Debug updateTopLogoDisplay:', {
        topLogoContainer: !!topLogoContainer,
        topLogo: !!topLogo,
        wheelConfig: !!wheelConfig,
        topLogoConfig: wheelConfig?.topLogo,
        enabled: wheelConfig?.topLogo?.enabled,
        src: wheelConfig?.topLogo?.src
    });
    
    if (topLogoContainer && topLogo && wheelConfig?.topLogo) {
        if (wheelConfig.topLogo.enabled && wheelConfig.topLogo.src) {
            console.log('✅ Mostrando logo superior:', wheelConfig.topLogo.src);
            topLogo.style.setProperty('background-image', `url(${wheelConfig.topLogo.src})`, 'important');
            topLogoContainer.style.setProperty('display', 'block', 'important');
            topLogoContainer.style.setProperty('visibility', 'visible', 'important');
            topLogoContainer.style.setProperty('opacity', '1', 'important');
        } else {
            console.log('❌ Ocultando logo superior - enabled:', wheelConfig.topLogo.enabled, 'src:', wheelConfig.topLogo.src);
            topLogoContainer.style.setProperty('display', 'none', 'important');
            topLogoContainer.style.setProperty('visibility', 'hidden', 'important');
        }
    } else {
        console.log('❌ Elementos no encontrados o configuración faltante');
        if (topLogoContainer) {
            topLogoContainer.style.setProperty('display', 'none', 'important');
            topLogoContainer.style.setProperty('visibility', 'hidden', 'important');
        }
    }
}

// Resetear logo superior
function resetTopLogo() {
    const wheelConfig = window.ConfigModule?.wheelConfig;
    if (wheelConfig?.topLogo) {
        wheelConfig.topLogo.src = 'images/top-logo.png';
        updateTopLogoDisplay();
        renderTopLogoConfig();
        window.ConfigModule?.saveConfig();
    }
}

// Funcionalidad del carrusel de patrocinadores
function initSponsorsCarousel() {
    console.log('🔄 Inicializando carrusel de sponsors...');
    
    const sponsorsEnabled = document.getElementById('sponsorsEnabled');
    const sponsorsControls = document.getElementById('sponsorsControls');
    const sponsorsList = document.getElementById('sponsorsList');
    const sponsorInput = document.getElementById('sponsorInput');
    const sponsorsCarousel = document.getElementById('sponsorsCarousel');
    
    // Verificar si los sponsors están habilitados por defecto y mostrarlos
    const wheelConfig = window.ConfigModule?.wheelConfig;
    console.log('🔍 Configuración de sponsors:', {
        wheelConfig: !!wheelConfig,
        sponsorsEnabled: wheelConfig?.sponsorsEnabled,
        sponsors: wheelConfig?.sponsors?.length || 0,
        sponsorsEnabledElement: !!sponsorsEnabled
    });
    
    if (wheelConfig?.sponsorsEnabled && sponsorsEnabled) {
        console.log('✅ Sponsors habilitados por defecto, activando...');
        sponsorsEnabled.checked = true;
        sponsorsControls.style.display = 'block';
        sponsorsList.style.display = 'block';
        document.getElementById('sponsorsFilter').style.display = 'block';
        
        // No cargar automáticamente, solo mostrar los que ya están
        console.log('📁 Sponsors habilitados, mostrando los existentes...');
    } else {
        console.log('❌ Sponsors no habilitados o elementos no encontrados');
    }
    
    if (sponsorsEnabled) {
        sponsorsEnabled.addEventListener('change', function() {
            if (this.checked) {
                sponsorsControls.style.display = 'block';
                sponsorsList.style.display = 'block';
                document.getElementById('sponsorsFilter').style.display = 'block';
                
                // Solo mostrar los sponsors existentes al activar checkbox
                console.log('📁 Checkbox activado, mostrando sponsors existentes...');
            } else {
                sponsorsControls.style.display = 'none';
                sponsorsList.style.display = 'none';
                document.getElementById('sponsorsFilter').style.display = 'none';
                const carousel = document.getElementById('sponsorsCarousel');
                if (carousel) {
                    carousel.classList.remove('show');
                    clearInterval(window.sponsorsInterval);
                }
            }
        });
    }
    
    if (sponsorInput) {
        sponsorInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                let processedFiles = 0;
                
                files.forEach((file, index) => {
                    // Verificar tamaño del archivo (máx. 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        console.warn(`Archivo ${file.name} es muy grande (máx. 2MB)`);
                        processedFiles++;
                        if (processedFiles === files.length) {
                            // Limpiar input después de procesar todos los archivos
                            e.target.value = '';
                        }
                        return;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        addSponsorLogo(e.target.result, file.name);
                        processedFiles++;
                        
                        // Limpiar input después de procesar todos los archivos
                        if (processedFiles === files.length) {
                            e.target.value = '';
                        }
                    };
                    
                    reader.onerror = function() {
                        console.error(`Error leyendo archivo ${file.name}`);
                        processedFiles++;
                        
                        // Limpiar input después de procesar todos los archivos
                        if (processedFiles === files.length) {
                            e.target.value = '';
                        }
                    };
                    
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    // Pausar animación al hover
    if (sponsorsCarousel) {
        sponsorsCarousel.addEventListener('mouseenter', () => {
            if (window.sponsorsInterval) {
                clearInterval(window.sponsorsInterval);
            }
        });
        
        sponsorsCarousel.addEventListener('mouseleave', () => {
            startInfiniteCarouselAnimation();
        });
    }
}

function addSponsorLogo(imageSrc, fileName = null) {
    if (!window.ConfigModule?.wheelConfig) return;
    
    if (!window.ConfigModule.wheelConfig.sponsors) {
        window.ConfigModule.wheelConfig.sponsors = [];
    }
    
    window.ConfigModule.wheelConfig.sponsors.push({
        id: Date.now() + Math.random(), // Agregar random para evitar colisiones
        src: imageSrc,
        name: fileName || `logo_${Date.now()}`
    });
    
    renderSponsorsCarousel();
    updateSponsorsDisplay();
}

function removeSponsorLogo(sponsorId) {
    if (!window.ConfigModule?.wheelConfig?.sponsors) return;
    
    window.ConfigModule.wheelConfig.sponsors = window.ConfigModule.wheelConfig.sponsors.filter(
        sponsor => sponsor.id !== sponsorId
    );
    
    renderSponsorsCarousel();
    updateSponsorsDisplay();
}

function renderSponsorsCarousel() {
    console.log('🎠 Mostrando carrusel de sponsors...');
    
    const sponsorsTrack = document.getElementById('sponsorsTrack');
    const carousel = document.getElementById('sponsorsCarousel');
    
    if (!sponsorsTrack || !carousel) {
        console.log('❌ Elementos del carrusel no encontrados');
        return;
    }
    
    const sponsors = window.ConfigModule?.wheelConfig?.sponsors || [];
    
    console.log(`🎠 Sponsors a mostrar: ${sponsors.length}`);
    
    if (sponsors.length === 0) {
        console.log('🎠 No hay sponsors, ocultando carrusel');
        carousel.classList.remove('show');
        return;
    }
    
    // Limpiar carrusel anterior
    sponsorsTrack.innerHTML = '';
    clearInterval(window.sponsorsInterval);
    
    // Para carrusel infinito, necesitamos duplicar los logos
    // Crear suficientes copias para llenar el espacio visible + extra
    const visibleLogos = 4;
    const totalCopies = Math.max(visibleLogos * 2, sponsors.length * 2);
    
    for (let i = 0; i < totalCopies; i++) {
        const sponsorIndex = i % sponsors.length;
        const sponsor = sponsors[sponsorIndex];
        
        const logoDiv = document.createElement('div');
        logoDiv.className = 'sponsor-logo';
        logoDiv.style.backgroundImage = `url(${sponsor.src})`;
        
        sponsorsTrack.appendChild(logoDiv);
    }
    
    // Mostrar el carrusel
    carousel.classList.add('show');
    
    // Iniciar animación automáticamente
    setTimeout(() => {
        startInfiniteCarouselAnimation();
    }, 500); // Pequeño delay para asegurar que el DOM esté listo
    
    console.log('✅ Carrusel infinito de sponsors mostrado');
}

function startInfiniteCarouselAnimation() {
    const sponsorsTrack = document.getElementById('sponsorsTrack');
    if (!sponsorsTrack) return;
    
    const sponsors = window.ConfigModule?.wheelConfig?.sponsors || [];
    if (sponsors.length === 0) return;
    
    const logoWidth = 180; // 120px (ancho del logo) + 60px (gap)
    const visibleLogos = 4;
    const originalSponsorsCount = sponsors.length;
    
    // Limpiar intervalo anterior si existe
    if (window.sponsorsInterval) {
        clearInterval(window.sponsorsInterval);
    }
    
    let currentPosition = 0;
    let resetPosition = originalSponsorsCount * logoWidth; // Posición donde resetear
    
    // Configurar transición suave
    sponsorsTrack.style.transition = 'transform 0.8s ease-in-out';
    sponsorsTrack.style.transform = 'translateX(0px)';
    
    window.sponsorsInterval = setInterval(() => {
        // Mover hacia la izquierda
        currentPosition -= logoWidth;
        
        // Si hemos recorrido toda la secuencia original, resetear sin transición
        if (currentPosition <= -resetPosition) {
            // Resetear posición sin transición para que sea imperceptible
            sponsorsTrack.style.transition = 'none';
            sponsorsTrack.style.transform = 'translateX(0px)';
            currentPosition = 0;
            
            // Reanudar transición en el siguiente frame
            setTimeout(() => {
                sponsorsTrack.style.transition = 'transform 0.8s ease-in-out';
            }, 10);
        } else {
            // Aplicar la nueva posición
            sponsorsTrack.style.transform = `translateX(${currentPosition}px)`;
        }
        
        console.log(`🎠 Carrusel infinito: Posición ${currentPosition}px`);
    }, 10000); // Cambiar cada 10 segundos
}

function applySponsorFilter(logoElement, imageSrc) {
    // Crear imagen temporal para detectar el fondo
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    
    tempImg.onload = function() {
        try {
            // Crear canvas para analizar la imagen
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;
            
            ctx.drawImage(this, 0, 0);
            
            // Obtener datos de píxeles de las esquinas
            const corners = [
                ctx.getImageData(0, 0, 10, 10), // Esquina superior izquierda
                ctx.getImageData(canvas.width - 10, 0, 10, 10), // Esquina superior derecha
                ctx.getImageData(0, canvas.height - 10, 10, 10), // Esquina inferior izquierda
                ctx.getImageData(canvas.width - 10, canvas.height - 10, 10, 10) // Esquina inferior derecha
            ];
            
            // Calcular brillo promedio de las esquinas
            let totalBrightness = 0;
            let pixelCount = 0;
            
            corners.forEach(cornerData => {
                const data = cornerData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = (r + g + b) / 3;
                    totalBrightness += brightness;
                    pixelCount++;
                }
            });
            
            const avgBrightness = totalBrightness / pixelCount;
            
            // Si el fondo es claro (blanco/claro), aplicar filtro
            if (avgBrightness > 200) {
                logoElement.style.filter = 'brightness(1.1) contrast(1.2) invert(0.2) sepia(0.2) saturate(1.3) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
            } else {
                logoElement.style.filter = 'brightness(1.1) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
            }
        } catch (error) {
            console.log('No se pudo analizar la imagen, usando filtro por defecto');
            logoElement.style.filter = 'brightness(1.1) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        }
    };
    
    tempImg.onerror = function() {
        // Si hay error cargando la imagen, usar filtro por defecto
        logoElement.style.filter = 'brightness(1.1) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
    };
    
    tempImg.src = imageSrc;
}

function updateSponsorsDisplay() {
    console.log('📋 Actualizando display de sponsors...');
    
    const sponsorsPreview = document.getElementById('sponsorsPreview');
    if (!sponsorsPreview) {
        console.log('❌ Elemento sponsorsPreview no encontrado');
        return;
    }
    
    const sponsors = window.ConfigModule?.wheelConfig?.sponsors || [];
    
    console.log(`📋 Mostrando ${sponsors.length} sponsors en preview`);
    
    // Limpiar preview anterior
    sponsorsPreview.innerHTML = '';
    
    // Crear preview para cada sponsor
    sponsors.forEach((sponsor, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'sponsor-preview-item';
        
        const logoDiv = document.createElement('div');
        logoDiv.className = 'sponsor-preview-logo';
        logoDiv.style.backgroundImage = `url(${sponsor.src})`;
        
        const logoInfo = document.createElement('div');
        logoInfo.className = 'sponsor-preview-info';
        logoInfo.textContent = sponsor.name || 'Logo';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'sponsor-preview-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeSponsorLogo(sponsor.id);
        
        previewItem.appendChild(logoDiv);
        previewItem.appendChild(logoInfo);
        previewItem.appendChild(removeBtn);
        sponsorsPreview.appendChild(previewItem);
        
        console.log(`📋 Preview ${index + 1}: ${sponsor.name} (${sponsor.src})`);
    });
    
    // Actualizar contador
    updateSponsorsCount();
    
    console.log('✅ Display de sponsors actualizado');
}

// Función dinámica para cargar sponsors desde carpeta
async function loadSponsorsFromFolder() {
    console.log('🔄 Cargando sponsors dinámicamente desde carpeta...');
    
    if (!window.ConfigModule?.wheelConfig) {
        alert('❌ Error: ConfigModule no disponible');
        return;
    }
    
    try {
        // Mostrar indicador de carga
        const loadBtn = document.querySelector('button[onclick="loadSponsorsFromFolder()"]');
        if (loadBtn) {
            loadBtn.textContent = '🔄 Cargando...';
            loadBtn.disabled = true;
        }
        
        // Intentar conectar al servidor local primero
        let sponsorsData;
        try {
            console.log('🌐 Intentando conectar al servidor local...');
            // Usar el mismo puerto donde está corriendo la aplicación
            const currentHost = window.location.origin;
            const response = await fetch(`${currentHost}/api/sponsors/list`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            sponsorsData = result.sponsors;
            
            console.log(`✅ Servidor local conectado. Encontrados ${sponsorsData.length} sponsors:`, sponsorsData);
            
        } catch (serverError) {
            console.warn('⚠️ Servidor local no disponible, usando lista de respaldo:', serverError.message);
            
            // Fallback a lista hardcodeada si el servidor no está disponible
            const archivosEnCarpeta = [
                'Geely-Logo.png',
                'Jetour_logo.svg.png', 
                'kia.svg',
                'logo-banreservas-sin-slogan.png',
                'viamar.png',
                'Volvo-Logo.wine.svg'
            ];
            
            sponsorsData = archivosEnCarpeta.map((archivo, index) => {
                const ext = archivo.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i);
                const name = archivo.replace(/\.(png|jpg|jpeg|svg|gif|webp)$/i, '')
                    .replace(/[-_]/g, ' ');
                
                return {
                    id: `sponsor_${index}`,
                    filename: archivo,
                    name: name,
                    extension: ext ? ext[0] : '',
                    path: `images/sponsors/${archivo}`,
                    fromFolder: true,
                    fallback: true
                };
            });
            
            console.log(`📁 Usando lista de respaldo con ${sponsorsData.length} archivos`);
        }
        
        if (!sponsorsData || sponsorsData.length === 0) {
            throw new Error('No se encontraron archivos de sponsors');
        }
        
        // Limpiar sponsors existentes
        window.ConfigModule.wheelConfig.sponsors = [];
        
        // Agregar cada sponsor encontrado
        sponsorsData.forEach((sponsor, index) => {
            window.ConfigModule.wheelConfig.sponsors.push({
                id: sponsor.id,
                src: sponsor.path,
                name: sponsor.name,
                filename: sponsor.filename,
                extension: sponsor.extension,
                fromFolder: true,
                fallback: sponsor.fallback || false
            });
            
            console.log(`✅ Agregado: ${sponsor.name} -> ${sponsor.path}`);
        });
        
        // Guardar en localStorage
        window.ConfigModule.saveConfig();
        
        // Actualizar la vista
        updateSponsorsCount();
        updateSponsorsDisplay();
        renderSponsorsCarousel();
        
        // Mostrar resultado
        const mensaje = `✅ Se cargaron ${sponsorsData.length} logos desde la carpeta:\n\n` +
                       sponsorsData.map(sponsor => `• ${sponsor.filename}`).join('\n') +
                       (sponsorsData[0]?.fallback ? '\n\n⚠️ Usando lista de respaldo (servidor no disponible)' : '\n\n🌐 Cargado dinámicamente desde servidor');
        
        alert(mensaje);
        console.log('✅ Carga completada');
        
    } catch (error) {
        console.error('❌ Error cargando sponsors:', error);
        alert(`❌ Error cargando sponsors: ${error.message}`);
    } finally {
        // Restaurar botón
        const loadBtn = document.querySelector('button[onclick="loadSponsorsFromFolder()"]');
        if (loadBtn) {
            loadBtn.textContent = '🔄 Recargar desde carpeta';
            loadBtn.disabled = false;
        }
    }
}

// Hacer la función disponible globalmente para el botón
window.loadSponsorsFromFolder = loadSponsorsFromFolder;

// Inicializar filtros de sponsors
function initSponsorFilters() {
    const hueSlider = document.getElementById('hueSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const contrastSlider = document.getElementById('contrastSlider');
    
    const hueCheckbox = document.getElementById('filterHue');
    const saturationCheckbox = document.getElementById('filterSaturation');
    const brightnessCheckbox = document.getElementById('filterBrightness');
    const contrastCheckbox = document.getElementById('filterContrast');
    
    const hueValue = document.getElementById('hueValue');
    const saturationValue = document.getElementById('saturationValue');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    
    // Event listeners para checkboxes
    if (hueCheckbox) {
        hueCheckbox.addEventListener('change', applySponsorFilters);
    }
    if (saturationCheckbox) {
        saturationCheckbox.addEventListener('change', applySponsorFilters);
    }
    if (brightnessCheckbox) {
        brightnessCheckbox.addEventListener('change', applySponsorFilters);
    }
    if (contrastCheckbox) {
        contrastCheckbox.addEventListener('change', applySponsorFilters);
    }
    
    // Event listeners para sliders
    if (hueSlider && hueValue) {
        hueSlider.addEventListener('input', function() {
            hueValue.textContent = this.value + '°';
            applySponsorFilters();
        });
    }
    
    if (saturationSlider && saturationValue) {
        saturationSlider.addEventListener('input', function() {
            saturationValue.textContent = this.value + '%';
            applySponsorFilters();
        });
    }
    
    if (brightnessSlider && brightnessValue) {
        brightnessSlider.addEventListener('input', function() {
            brightnessValue.textContent = this.value + '%';
            applySponsorFilters();
        });
    }
    
    if (contrastSlider && contrastValue) {
        contrastSlider.addEventListener('input', function() {
            contrastValue.textContent = this.value + '%';
            applySponsorFilters();
        });
    }
}

// Aplicar filtros CSS a todos los logos
function applySponsorFilters() {
    const hueEnabled = document.getElementById('filterHue')?.checked;
    const saturationEnabled = document.getElementById('filterSaturation')?.checked;
    const brightnessEnabled = document.getElementById('filterBrightness')?.checked;
    const contrastEnabled = document.getElementById('filterContrast')?.checked;
    
    const hue = document.getElementById('hueSlider')?.value || 0;
    const saturation = document.getElementById('saturationSlider')?.value || 100;
    const brightness = document.getElementById('brightnessSlider')?.value || 100;
    const contrast = document.getElementById('contrastSlider')?.value || 100;
    
    let filterString = '';
    
    if (hueEnabled) filterString += `hue-rotate(${hue}deg) `;
    if (saturationEnabled) filterString += `saturate(${saturation}%) `;
    if (brightnessEnabled) filterString += `brightness(${brightness}%) `;
    if (contrastEnabled) filterString += `contrast(${contrast}%) `;
    
    // Aplicar filtro a todos los logos del carrusel
    const sponsorLogos = document.querySelectorAll('.sponsor-logo');
    console.log(`🎨 Aplicando filtros a ${sponsorLogos.length} logos:`, filterString.trim() || 'none');
    
    sponsorLogos.forEach((logo, index) => {
        const currentFilter = filterString.trim() || 'none';
        logo.style.filter = currentFilter;
        console.log(`Logo ${index + 1}:`, currentFilter);
    });
    
    // Guardar configuración de filtros
    if (window.ConfigModule?.wheelConfig) {
        if (!window.ConfigModule.wheelConfig.sponsorFilters) {
            window.ConfigModule.wheelConfig.sponsorFilters = {};
        }
        
        window.ConfigModule.wheelConfig.sponsorFilters = {
            hue: { enabled: hueEnabled, value: hue },
            saturation: { enabled: saturationEnabled, value: saturation },
            brightness: { enabled: brightnessEnabled, value: brightness },
            contrast: { enabled: contrastEnabled, value: contrast }
        };
    }
}

// Resetear filtros de sponsors
function resetSponsorFilters() {
    document.getElementById('filterHue').checked = false;
    document.getElementById('filterSaturation').checked = false;
    document.getElementById('filterBrightness').checked = false;
    document.getElementById('filterContrast').checked = false;
    
    document.getElementById('hueSlider').value = 0;
    document.getElementById('saturationSlider').value = 100;
    document.getElementById('brightnessSlider').value = 100;
    document.getElementById('contrastSlider').value = 100;
    
    document.getElementById('hueValue').textContent = '0°';
    document.getElementById('saturationValue').textContent = '100%';
    document.getElementById('brightnessValue').textContent = '100%';
    document.getElementById('contrastValue').textContent = '100%';
    
    applySponsorFilters();
}

// Actualizar contador de sponsors
function updateSponsorsCount() {
    const sponsorsCount = document.getElementById('sponsorsCount');
    if (sponsorsCount) {
        const count = window.ConfigModule?.wheelConfig?.sponsors?.length || 0;
        sponsorsCount.textContent = count;
        console.log(`📊 Contador actualizado: ${count} sponsors`);
    } else {
        console.log('❌ Elemento sponsorsCount no encontrado');
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
    downloadUpdatedConfig,
    resetLogo,
    saveAllSettings,
    applyVisualChanges,
    renderGrandPrizes,
    updateGrandPrize,
    addGrandPrize,
    removeGrandPrize,
    renderTopLogoConfig,
    updateTopLogoDisplay,
    resetTopLogo,
    initSponsorsCarousel,
    renderSponsorsCarousel,
    addSponsorLogo,
    removeSponsorLogo,
    updateSponsorsDisplay,
    loadSponsorsFromFolder,
    initSponsorFilters,
    resetSponsorFilters,
    applySponsorFilters
};
