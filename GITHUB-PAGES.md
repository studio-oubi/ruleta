# 🚀 Guía para Publicar en GitHub Pages

Este documento te guiará paso a paso para publicar tu proyecto de ruleta en GitHub Pages y acceder a él como una página web.

## 📋 Requisitos Previos

1. Una cuenta de GitHub
2. Git instalado en tu computadora
3. El proyecto ya configurado localmente

## 🔧 Pasos para Publicar

### Paso 1: Preparar el Repositorio Local

1. **Asegúrate de estar en el directorio del proyecto:**
   ```bash
   cd "/Users/oscarlobaldera/Documents/Trabajos /Totem/games/ruleta"
   ```

2. **Verifica el estado de Git:**
   ```bash
   git status
   ```

3. **Agrega todos los archivos necesarios (excepto node_modules):**
   ```bash
   git add .
   ```

4. **Haz commit de los cambios:**
   ```bash
   git commit -m "Preparar proyecto para GitHub Pages"
   ```

### Paso 2: Crear el Repositorio en GitHub

1. **Ve a GitHub** (https://github.com) e inicia sesión

2. **Crea un nuevo repositorio:**
   - Haz clic en el botón **"+"** en la esquina superior derecha
   - Selecciona **"New repository"**
   - Nombre del repositorio: `ruleta` (o el nombre que prefieras)
   - Descripción: "Ruleta interactiva para Auto Americana"
   - **NO marques** "Initialize this repository with a README"
   - Haz clic en **"Create repository"**

### Paso 3: Conectar el Repositorio Local con GitHub

1. **Copia la URL del repositorio** que acabas de crear (aparecerá en la página de GitHub)

2. **En tu terminal, ejecuta:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/ruleta.git
   ```
   (Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub)

3. **Sube el código a GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Paso 4: Activar GitHub Pages

1. **Ve a tu repositorio en GitHub**

2. **Haz clic en "Settings"** (Configuración) en el menú superior del repositorio

3. **En el menú lateral izquierdo, busca y haz clic en "Pages"**

4. **En "Source" (Fuente):**
   - Selecciona **"Deploy from a branch"**
   - Branch: selecciona **"main"** (o "master" si usas esa rama)
   - Folder: selecciona **"/ (root)"**
   - Haz clic en **"Save"**

5. **Espera unos minutos** mientras GitHub procesa tu sitio

6. **Tu sitio estará disponible en:**
   ```
   https://TU_USUARIO.github.io/ruleta/
   ```
   (Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub)

## ✅ Verificación

1. **Espera 1-2 minutos** después de activar GitHub Pages
2. **Visita la URL** de tu sitio
3. **Verifica que la ruleta funcione correctamente**

## 📝 Notas Importantes

### Funcionalidades que Funcionan en GitHub Pages:
- ✅ Ruleta interactiva
- ✅ Configuración guardada en localStorage
- ✅ Cambios visuales y de tema
- ✅ Premios y configuración básica
- ✅ Sponsors desde archivos locales (si están en el repositorio)

### Funcionalidades que NO Funcionan sin Servidor:
- ❌ Cargar sponsors dinámicamente desde carpeta (requiere servidor Node.js)
- ❌ Guardar/cargar presets desde servidor (usa localStorage en su lugar)
- ❌ APIs del servidor (`/api/sponsors/list`, `/api/presets/*`)

### Solución para Funcionalidades del Servidor:
Si necesitas estas funcionalidades, puedes:
1. Usar el proyecto localmente con `node server.js`
2. O desplegar el servidor en un servicio como Heroku, Vercel, o Railway

## 🔄 Actualizar el Sitio

Cada vez que hagas cambios y quieras actualizar el sitio:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

GitHub Pages se actualizará automáticamente en 1-2 minutos.

## 🐛 Solución de Problemas

### El sitio no carga:
- Verifica que el archivo `index.html` esté en la raíz del repositorio
- Asegúrate de que GitHub Pages esté activado en Settings > Pages
- Espera unos minutos más, puede tardar hasta 10 minutos en la primera vez

### Las imágenes no se ven:
- Verifica que las rutas de las imágenes sean relativas (ej: `images/logo.svg`)
- Asegúrate de que todos los archivos de imágenes estén en el repositorio

### Errores en la consola del navegador:
- Algunos errores relacionados con APIs del servidor son normales
- La aplicación debería funcionar con localStorage como respaldo

## 📞 Soporte

Si tienes problemas, verifica:
1. Que todos los archivos estén en el repositorio
2. Que `index.html` esté en la raíz
3. Que GitHub Pages esté activado correctamente
4. La consola del navegador para ver errores específicos

¡Listo! Tu ruleta ahora está disponible en la web. 🎉

