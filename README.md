# Ruleta Auto Americana

Una ruleta interactiva de premios para Auto Americana con sistema de configuración avanzado.

## Estructura del Proyecto

```
ruleta/
├── ruleta.html          # Archivo principal HTML
├── ruleta.js           # Lógica principal de la ruleta
├── ruleta-style.css    # Estilos CSS
├── images/             # Imágenes y logos
│   └── Auto Americana Logo.svg
├── sounds/             # Archivos de audio
│   └── Victory.mp3
├── config/             # Archivos de configuración
│   └── wheelCONF.JSON
└── assets/             # Recursos adicionales
```

## Características

- 🎯 **Ruleta Interactiva**: Sistema de ruleta con física realista
- 🎁 **Gestión de Premios**: Configuración de premios reales y consuelos
- 🏆 **Grand Prizes**: Sistema de premios especiales con animaciones
- 🎨 **Personalización**: Temas de colores y configuración visual
- 🔊 **Audio**: Efectos de sonido configurables
- 💾 **Presets**: Guardado y carga de configuraciones
- 📱 **Responsive**: Diseño adaptable a diferentes pantallas

## Configuración

1. Abrir `ruleta.html` en un navegador web
2. Usar el botón de configuración (⚙️) para personalizar:
   - Premios y cantidades
   - Colores y temas
   - Audio y efectos
   - Logos y branding

## Uso

- Hacer clic en la ruleta para girar
- La aguja indicará el premio ganado
- Modal de resultado muestra el premio obtenido
- Sistema de inventario para control de stock

## Tecnologías

- HTML5 Canvas para la ruleta
- GSAP para animaciones
- Howler.js para audio
- Canvas Confetti para efectos visuales
- LocalStorage para persistencia de configuración

## Archivos Principales

- `ruleta.html`: Interfaz principal
- `ruleta.js`: Lógica de la aplicación
- `ruleta-style.css`: Estilos y diseño
- `config/wheelCONF.JSON`: Configuración por defecto
