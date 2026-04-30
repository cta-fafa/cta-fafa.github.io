# FAFA Expense Sheet Generator

Aplicacion web estatica para rellenar la hoja oficial de gastos arbitrales de FAFA y generar un PDF final listo para enviar por email o archivar.

## Caracteristicas

- 100% cliente, sin backend.
- Primera pagina del PDF construida sobre la plantilla oficial real (`expense-sheet-template.pdf` o `expense-sheet-template.png`).
- Formulario por secciones con validaciones de negocio y calculos automaticos.
- Firma manuscrita en canvas (sin subida de imagen de firma como flujo principal).
- Adjuntos multipagina (PDF + imagenes JPG/JPEG/PNG/WEBP).
- Union final: pagina oficial + justificantes en orden elegido por el usuario.
- Borrador en `localStorage`.
- Proyecto preparado para GitHub Pages.

## Stack

- Vite
- React 19
- TypeScript estricto
- Tailwind CSS (v4 via `@tailwindcss/vite`)
- react-hook-form
- Zod
- pdf-lib
- react-signature-canvas

## Estructura

```text
src/
  app/
    App.tsx
  components/
    ui/
  features/
    expense-form/
      calculations.ts
      defaultValues.ts
      exampleData.ts
      ExpenseFormPage.tsx
    attachments/
      AttachmentsManager.tsx
    signature/
      SignatureField.tsx
    validation/
      expenseSchema.ts
    pdf-generation/
      generateExpensePdf.ts
      template/
        templateAsset.ts
        templateFieldMap.ts
        fieldFormatters.ts
        renderExpenseSheetPage.ts
      appendices/
        appendAttachments.ts
      shared/
        attachmentChecklist.ts
  lib/
    draftStorage.ts
  types/
    expense.ts
  utils/
    download.ts
    file.ts
    format.ts
    id.ts
public/
  assets/
    expense-sheet-template.pdf
    # opcional: expense-sheet-template.png
```

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

## Build

```bash
npm run build
```

Opcional chequeo de tipos:

```bash
npm run typecheck
```

## Despliegue GitHub Pages

Este proyecto usa `VITE_BASE_PATH` para resolver rutas de assets en Pages.

### Opcion recomendada: GitHub Actions (auto deploy)

El repositorio ya incluye el workflow:

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/dependabot-auto-merge.yml`

Publica automaticamente en cada push a `main`.

Pasos de activacion (una sola vez en GitHub):

1. Ve a `Settings > Pages`.
2. En `Build and deployment`, selecciona `Source: GitHub Actions`.
3. Haz push a `main`.
4. Espera a que finalice el workflow `Deploy To GitHub Pages` en la pestaña `Actions`.

### Dependabot + Auto-merge seguro

Se ha configurado:

- Dependabot semanal para `npm` y `github-actions` (`.github/dependabot.yml`).
- CI en PR (`.github/workflows/ci.yml`) para validar build.
- Auto-merge solo para PRs de Dependabot que sean:
  - ecosistema `npm`
  - dependencia de desarrollo directa
  - actualizacion `semver-patch`

Importante en GitHub:

1. En `Settings > General`, activa `Allow auto-merge`.
2. (Recomendado) En `Settings > Branches`, protege `main` y exige el check `CI / build`.

### Opcion manual (alternativa)

1. Build para este repo (`cta-fafa.github.io`):

```bash
npm run build:gh
```

2. Sube el contenido de `dist/` a la rama de Pages (por ejemplo `gh-pages`).

3. En un repositorio de usuario `*.github.io`, el `base path` debe ser `/`.

## Uso de plantilla oficial real

La prioridad funcional es que la pagina 1 use la plantilla oficial real como fondo.

Coloca uno de estos assets:

- `public/assets/expense-sheet-template.pdf` (preferido)
- `public/assets/expense-sheet-template.png` (alternativo)

Resolucion implementada en `src/features/pdf-generation/template/templateAsset.ts`:

- intenta cargar el PDF oficial;
- si no existe, usa PNG;
- si no existe ninguno, devuelve error y bloquea generacion.

## Ajuste de coordenadas (`templateFieldMap.ts`)

Archivo: `src/features/pdf-generation/template/templateFieldMap.ts`.

Cada campo se define con:

```ts
type PdfFieldPosition = {
  x: number
  y: number
  maxWidth?: number
  fontSize?: number
  align?: 'left' | 'center' | 'right'
}
```

Pasos para calibracion fina:

1. Genera PDF de prueba con datos de ejemplo.
2. Compara visualmente con la hoja oficial.
3. Ajusta `x`/`y` de cada campo en `templateFieldMap.ts`.
4. Repite hasta alineacion fina.

Tambien tienes un atajo desde la UI: `Descargar PDF de calibracion`.
Ese PDF genera cruces y nombres de campo sobre la plantilla oficial para localizar y mover coordenadas con rapidez.

Nota: la version actual incluye coordenadas funcionales iniciales y comentarios para recalibracion.

## Reglas de negocio implementadas

- `Cargo` por defecto: `Arbitro`.
- `ownVehicleAmount = totalKm * ratePerKm`.
- `ratePerKm` por defecto: `0.26`.
- `mealTotal = mealDays * mealAmountPerDay`.
- `hotelTotal = overnightAmount + hotelAmountPerDay`.
- `totalExpenses` suma conceptos aplicables.
- Si `ownVehicleChecked = true`, exige matricula, propietario, itinerario y km.
- Coherencia de dias: `mealDays <= tripDurationDays`.
- Si hay gasto de hotel, exige adjunto de tipo hotel.
- Si se marca tren/avion/autobus, exige justificante correspondiente.
- Firma manuscrita obligatoria para generar PDF.
- Checkboxes de justificantes en plantilla se marcan solo cuando existen adjuntos reales.

## Flujo PDF final

1. Crea documento PDF.
2. Renderiza pagina 1 sobre plantilla oficial real.
3. Superpone campos, importes, checkboxes y firma manuscrita.
4. Adjunta justificantes:
   - PDF: copia todas las paginas.
   - Imagen: inserta en pagina A4 ajustada.
5. Descarga fichero sugerido: `hoja-gastos-fecha-nombre.pdf`.

## Limitaciones conocidas

- Las coordenadas actuales son funcionales, pero requieren calibracion visual fina sobre tu plantilla oficial concreta.
- El borrador en localStorage guarda datos del formulario, no el contenido binario de adjuntos ni firma.
- PDF de previsualizacion embebida no incluido; se usa resumen funcional y preview basica de adjuntos.
- No hay firma del presidente (se deja `Pendiente`).

## Mejoras futuras

- Editor visual de coordenadas en tiempo real.
- Previsualizacion de la pagina 1 renderizada dentro de la app.
- Importacion/exportacion de borradores en JSON.
- Soporte para multiples plantillas oficiales por temporada.
- Test E2E para validaciones de negocio.
