# 🎠 Cargador Dinámico de Sponsors

## 📋 Descripción

Sistema dinámico para cargar logos de sponsors desde la carpeta `images/sponsors/` sin necesidad de modificar código. El sistema incluye un servidor Express que lee automáticamente los archivos de la carpeta y los sirve a través de una API REST.

## 🚀 Características

- **Lectura dinámica**: Lee automáticamente todos los archivos de imagen en `images/sponsors/`
- **Fallback inteligente**: Si el servidor no está disponible, usa una lista de respaldo
- **Soporte múltiples formatos**: PNG, JPG, JPEG, SVG, GIF, WEBP
- **API REST**: Endpoints para listar y verificar archivos
- **Indicadores visuales**: Muestra el estado de carga y origen de los datos

## 🛠️ Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Iniciar el servidor**:
```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

3. **Acceder a la aplicación**:
   - Aplicación: `http://localhost:3000`
   - API de sponsors: `http://localhost:3000/api/sponsors/list`
   - **Todo funciona en el mismo puerto** 🎯

## 📁 Estructura de Archivos

```
ruleta/
├── images/sponsors/          # Carpeta con logos de sponsors
│   ├── Geely-Logo.png
│   ├── Jetour_logo.svg.png
│   ├── kia.svg
│   ├── logo-banreservas-sin-slogan.png
│   ├── viamar.png
│   └── Volvo-Logo.wine.svg
├── server.js                 # Servidor Express para API
├── package.json             # Dependencias del proyecto
└── js/ui.js                 # Lógica del cargador dinámico
```

## 🔧 API Endpoints

### `GET /api/sponsors/list`
Lista todos los archivos de sponsors disponibles.

**Respuesta**:
```json
{
  "success": true,
  "count": 6,
  "sponsors": [
    {
      "id": "sponsor_0",
      "filename": "Geely-Logo.png",
      "name": "Geely Logo",
      "extension": ".png",
      "path": "images/sponsors/Geely-Logo.png",
      "fromFolder": true
    }
  ]
}
```

### `GET /api/sponsors/check/:filename`
Verifica si un archivo específico existe.

**Respuesta**:
```json
{
  "exists": true,
  "path": "images/sponsors/Geely-Logo.png"
}
```

### `GET /api/health`
Verifica el estado del servidor.

**Respuesta**:
```json
{
  "status": "OK",
  "message": "Servidor de sponsors funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Uso

### Modo Dinámico (Recomendado)

1. **Iniciar el servidor**:
```bash
npm start
```

2. **Abrir la aplicación** en el navegador

3. **Hacer clic en "🔄 Recargar desde carpeta"** en la configuración

4. **El sistema automáticamente**:
   - Conecta al servidor local
   - Lee todos los archivos de `images/sponsors/`
   - Filtra solo archivos de imagen válidos
   - Carga los sponsors en el carrusel

### Modo Fallback

Si el servidor no está disponible, el sistema automáticamente:
- Muestra un mensaje de advertencia
- Usa una lista hardcodeada de archivos conocidos
- Continúa funcionando normalmente

## ➕ Agregar Nuevos Sponsors

### Con Servidor (Modo Dinámico)
1. **Agregar el archivo** a `images/sponsors/`
2. **Hacer clic en "🔄 Recargar desde carpeta"**
3. **El nuevo logo aparece automáticamente**

### Sin Servidor (Modo Fallback)
1. **Agregar el archivo** a `images/sponsors/`
2. **Modificar la lista hardcodeada** en `js/ui.js` línea 1716-1723
3. **Hacer clic en "🔄 Recargar desde carpeta"**

## 🔍 Logs y Debugging

El sistema proporciona logs detallados en la consola del navegador:

```javascript
// Logs de conexión
🌐 Intentando conectar al servidor local...
✅ Servidor local conectado. Encontrados 6 sponsors

// Logs de fallback
⚠️ Servidor local no disponible, usando lista de respaldo
📁 Usando lista de respaldo con 6 archivos

// Logs de carga
✅ Agregado: Geely Logo -> images/sponsors/Geely-Logo.png
✅ Carga completada
```

## 🚨 Solución de Problemas

### Servidor no inicia
```bash
# Verificar que el puerto 3000 esté libre
lsof -i :3000

# Instalar dependencias si es necesario
npm install
```

### No se cargan sponsors
1. Verificar que `images/sponsors/` contiene archivos de imagen
2. Verificar que el servidor esté ejecutándose en `http://localhost:3000`
3. Revisar la consola del navegador para errores

### Archivos no reconocidos
- Solo se cargan archivos con extensiones: `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp`
- Verificar que los archivos no estén corruptos

## 🔄 Actualizaciones Futuras

- [ ] Interfaz web para gestionar sponsors
- [ ] Upload directo de archivos desde el navegador
- [ ] Caché de imágenes para mejor rendimiento
- [ ] Soporte para subcarpetas de sponsors
- [ ] Validación automática de formato y tamaño de imágenes
