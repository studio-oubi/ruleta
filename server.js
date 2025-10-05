const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/sounds', express.static(path.join(__dirname, 'sounds')));
app.use('/config', express.static(path.join(__dirname, 'config')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir archivos CSS y otros archivos estáticos del root
app.use('/css', express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname)));

// Servir la aplicación principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ruleta.html'));
});

// Servir otros archivos HTML
app.get('/test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

app.get('/test-prizes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-prizes.html'));
});

// Endpoint para listar archivos de sponsors
app.get('/api/sponsors/list', (req, res) => {
    try {
        const sponsorsDir = path.join(__dirname, 'images', 'sponsors');
        
        // Leer el directorio
        fs.readdir(sponsorsDir, (err, files) => {
            if (err) {
                console.error('Error leyendo directorio:', err);
                return res.status(500).json({ 
                    error: 'Error leyendo directorio de sponsors',
                    details: err.message 
                });
            }
            
            // Filtrar solo archivos de imagen válidos
            const validExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return validExtensions.includes(ext);
            });
            
            // Crear información detallada de cada archivo
            const sponsorsInfo = imageFiles.map((file, index) => {
                const ext = path.extname(file);
                const name = path.basename(file, ext);
                
                return {
                    id: `sponsor_${index}`,
                    filename: file,
                    name: name.replace(/[-_]/g, ' '),
                    extension: ext,
                    path: `images/sponsors/${file}`,
                    fromFolder: true
                };
            });
            
            console.log(`📁 Encontrados ${sponsorsInfo.length} archivos de sponsors:`, sponsorsInfo.map(s => s.filename));
            
            res.json({
                success: true,
                count: sponsorsInfo.length,
                sponsors: sponsorsInfo
            });
        });
    } catch (error) {
        console.error('Error en endpoint /api/sponsors/list:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
});

// Endpoint para verificar si un archivo existe
app.get('/api/sponsors/check/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, 'images', 'sponsors', filename);
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.json({ exists: false });
            } else {
                res.json({ exists: true, path: `images/sponsors/${filename}` });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor de sponsors funcionando',
        timestamp: new Date().toISOString()
    });
});

// ===== ENDPOINTS PARA PRESETS =====

// Crear carpeta de presets si no existe
const presetsDir = path.join(__dirname, 'presets');
if (!fs.existsSync(presetsDir)) {
    fs.mkdirSync(presetsDir, { recursive: true });
    console.log('📁 Carpeta de presets creada:', presetsDir);
}

// Listar presets disponibles
app.get('/api/presets/list', (req, res) => {
    try {
        const files = fs.readdirSync(presetsDir);
        const presetFiles = files.filter(file => file.endsWith('.json'));
        
        const presets = presetFiles.map(file => {
            const filePath = path.join(presetsDir, file);
            const stats = fs.statSync(filePath);
            const name = file.replace('.json', '');
            
            return {
                id: name,
                name: name,
                filename: file,
                path: `presets/${file}`,
                created: stats.birthtime,
                modified: stats.mtime,
                size: stats.size
            };
        });
        
        res.json({ 
            success: true, 
            count: presets.length, 
            presets: presets.sort((a, b) => b.modified - a.modified) // Más recientes primero
        });
    } catch (error) {
        console.error('Error al listar presets:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al listar presets', 
            error: error.message 
        });
    }
});

// Guardar preset
app.post('/api/presets/save', (req, res) => {
    try {
        const { name, config } = req.body;
        
        if (!name || !config) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nombre y configuración son requeridos' 
            });
        }
        
        // Validar nombre del archivo
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (safeName !== name) {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre solo puede contener letras, números, guiones y guiones bajos' 
            });
        }
        
        const filePath = path.join(presetsDir, `${safeName}.json`);
        
        // Agregar metadata al preset
        const presetData = {
            name: safeName,
            config: config,
            created: new Date().toISOString(),
            version: '1.0.0'
        };
        
        fs.writeFileSync(filePath, JSON.stringify(presetData, null, 2));
        
        console.log(`✅ Preset guardado: ${safeName}.json`);
        
        res.json({ 
            success: true, 
            message: `Preset "${safeName}" guardado exitosamente`,
            filename: `${safeName}.json`
        });
    } catch (error) {
        console.error('Error al guardar preset:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al guardar preset', 
            error: error.message 
        });
    }
});

// Actualizar preset existente
app.put('/api/presets/update/:name', (req, res) => {
    try {
        const { name } = req.params;
        const { config } = req.body;
        
        if (!config) {
            return res.status(400).json({ 
                success: false, 
                message: 'Configuración es requerida' 
            });
        }
        
        // Validar nombre del archivo
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (safeName !== name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nombre de preset inválido' 
            });
        }
        
        const filePath = path.join(presetsDir, `${safeName}.json`);
        
        // Verificar que el preset existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Preset no encontrado para actualizar' 
            });
        }
        
        // Leer el preset existente para mantener metadata
        let existingPreset = {};
        try {
            const existingData = fs.readFileSync(filePath, 'utf8');
            existingPreset = JSON.parse(existingData);
        } catch (error) {
            console.warn('No se pudo leer metadata del preset existente:', error.message);
        }
        
        // Crear preset actualizado manteniendo metadata original
        const updatedPresetData = {
            name: safeName,
            config: config,
            created: existingPreset.created || new Date().toISOString(),
            modified: new Date().toISOString(),
            version: existingPreset.version || '1.0.0'
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedPresetData, null, 2));
        
        console.log(`🔄 Preset actualizado: ${safeName}.json`);
        
        res.json({ 
            success: true, 
            message: `Preset "${safeName}" actualizado exitosamente`,
            filename: `${safeName}.json`
        });
    } catch (error) {
        console.error('Error al actualizar preset:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar preset', 
            error: error.message 
        });
    }
});

// Cargar preset
app.get('/api/presets/load/:name', (req, res) => {
    try {
        const { name } = req.params;
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = path.join(presetsDir, `${safeName}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Preset no encontrado' 
            });
        }
        
        const presetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        res.json({ 
            success: true, 
            preset: presetData
        });
    } catch (error) {
        console.error('Error al cargar preset:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al cargar preset', 
            error: error.message 
        });
    }
});

// Eliminar preset
app.delete('/api/presets/delete/:name', (req, res) => {
    try {
        const { name } = req.params;
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = path.join(presetsDir, `${safeName}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Preset no encontrado' 
            });
        }
        
        fs.unlinkSync(filePath);
        
        console.log(`🗑️ Preset eliminado: ${safeName}.json`);
        
        res.json({ 
            success: true, 
            message: `Preset "${safeName}" eliminado exitosamente`
        });
    } catch (error) {
        console.error('Error al eliminar preset:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar preset', 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de la Ruleta ejecutándose en http://localhost:${PORT}`);
    console.log(`🎠 Aplicación principal: http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${__dirname}`);
    console.log(`🔗 API de sponsors: http://localhost:${PORT}/api/sponsors/list`);
    console.log(`💾 API de presets: http://localhost:${PORT}/api/presets/list`);
    console.log(`📁 Carpeta de presets: ${presetsDir}`);
    console.log(`🎯 Todo funciona en el mismo puerto: ${PORT}`);
});
