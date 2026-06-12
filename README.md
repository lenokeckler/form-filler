# Form Filler — Google Forms + Cypress + IA

Automatiza el llenado del formulario con respuestas variadas y realistas generadas por IA.

Puedes usar dos proveedores de IA:

- **Gemini (Google)** — opción implementada por defecto. Tiene un nivel gratuito generoso.
- **Claude (Anthropic)** — opción alternativa (requiere adaptar el código, ver más abajo).

Si no configuras ninguna API Key, el script genera respuestas con lógica local (sin IA) como respaldo.

---

## Requisitos

- Node.js 18+
- Cypress (se instala automáticamente)
- API Key de **Gemini** (recomendado) o de **Anthropic (Claude)**

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# También necesitas node-fetch para las llamadas a Claude API
npm install node-fetch
```

---

## Configuración

Abre `cypress/e2e/fill_form.cy.js` y edita el bloque CONFIG al inicio:

```javascript
const CONFIG = {
  FORM_URL: "https://docs.google.com/forms/...", // URL de tu formulario
  REPETICIONES: 5,              // cuántas veces llenar el formulario
  DELAY_ENTRE_ENVIOS: 3000,     // ms entre envíos
};
```

La API Key NO se pone aquí: se lee desde el archivo `.env` (ver sección de seguridad abajo).

### Opción A — Gemini (implementada por defecto)

1. Ve a https://aistudio.google.com/apikey
2. Crea una API Key (empieza con `AIza...`)
3. Cópiala en tu archivo `.env` como `GEMINI_API_KEY=...`

La integración con Gemini está en `cypress.config.js` (función `generarConGemini`), usando el modelo `gemini-2.0-flash`. La clave se carga con `dotenv` desde `.env`.

### Opción B — Claude (Anthropic, alternativa)

El proyecto está preparado para usar IA de forma intercambiable. Para usar Claude en lugar de Gemini:

1. Obtén tu API Key en https://console.anthropic.com (API Keys -> Create Key, empieza con `sk-ant-...`)
2. Agrega `CLAUDE_API_KEY` al CONFIG y pásala al task `generateAnswers`
3. Crea una función equivalente a `generarConGemini` que llame a la API de Claude:
   - Endpoint: `https://api.anthropic.com/v1/messages`
   - Modelo recomendado: `claude-opus-4-8` (o `claude-haiku-4-5` para menor costo)

> Nunca escribas tu API Key directamente en el código si vas a subirlo a un repositorio público. Usa una variable de entorno (ver sección de seguridad abajo).

---

## Usar tus 24 respuestas como referencia

Para que la IA siga la tendencia de tus datos reales:

1. En Google Forms -> Respuestas -> ícono de hoja de cálculo -> exportar CSV
2. Revisa los patrones principales, por ejemplo:
   - "60% de respuestas de San José, 30% Cartago..."
   - "Mayoría 3er y 4to año"
   - "70% reporta haber experimentado situaciones de sesgo"
3. Pega ese resumen en `DATOS_EXISTENTES`

---

## Ejecutar

```bash
# Con interfaz visual (recomendado para la primera vez)
npm run fill

# Sin interfaz (más rápido)
npm run fill:headless

# Abrir Cypress Studio
npm run cy:open
```

---

## Solución de problemas

### Los selectores no funcionan
Google Forms puede cambiar sus clases CSS. Si el script falla, abre Cypress en modo visual (`npm run cy:open`), inspecciona el elemento que falla y actualiza el selector en el archivo.

### Error de API Key
Verifica que la API Key esté correcta y tenga cuota disponible:
- Gemini: https://aistudio.google.com/apikey
- Claude: https://console.anthropic.com

---

## Seguridad de la API Key

No subas tu API Key a un repositorio público. Cualquiera podría usarla y gastar tu cuota.

La clave se lee desde un archivo `.env` (que está en `.gitignore` y nunca se sube):

1. Copia la plantilla:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` y pega tu clave:
   ```
   GEMINI_API_KEY=tu_clave_aqui
   ```
3. Listo. `cypress.config.js` la carga automáticamente con `dotenv` y la usa en Node, así la clave nunca llega al navegador.

Si alguna vez subiste una key por error, revócala y genera una nueva en https://aistudio.google.com/apikey

### Google bloquea el formulario
- Aumenta `DELAY_ENTRE_ENVIOS` a 5000-10000ms
- No hagas más de 20-30 envíos por sesión

---

## Estructura del proyecto

```
form-filler/
├── cypress/
│   └── e2e/
│       └── fill_form.cy.js    script principal
├── cypress.config.js          config + integración Claude API
├── package.json
└── README.md
```
