const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'images')));

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

app.listen(PORT, () => {
    console.log(`🚀 Servidor de sponsors ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${path.join(__dirname, 'images')}`);
    console.log(`🔗 Endpoint de sponsors: http://localhost:${PORT}/api/sponsors/list`);
});
