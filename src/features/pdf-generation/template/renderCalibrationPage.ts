import { rgb, StandardFonts, type PDFDocument } from 'pdf-lib'
import { createPageFromTemplate } from './templateAsset'
import { templateFieldMap } from './templateFieldMap'

export const renderCalibrationPage = async (pdfDoc: PDFDocument): Promise<void> => {
  const page = await createPageFromTemplate(pdfDoc)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  Object.entries(templateFieldMap).forEach(([fieldName, position], index) => {
    const markerColor = index % 2 === 0 ? rgb(0.84, 0.05, 0.24) : rgb(0.03, 0.44, 0.74)
    const x = position.x
    const y = position.y

    // Cross marker for exact point reference.
    page.drawLine({
      start: { x: x - 4, y },
      end: { x: x + 4, y },
      thickness: 0.8,
      color: markerColor,
    })
    page.drawLine({
      start: { x, y: y - 4 },
      end: { x, y: y + 4 },
      thickness: 0.8,
      color: markerColor,
    })

    page.drawText(fieldName, {
      x: x + 6,
      y: y + 2,
      size: 6,
      font,
      color: markerColor,
      maxWidth: 160,
    })

    if (position.maxWidth) {
      page.drawRectangle({
        x,
        y: y - 2,
        width: position.maxWidth,
        height: (position.fontSize ?? 10) + 3,
        borderWidth: 0.35,
        borderColor: rgb(0.35, 0.35, 0.35),
        opacity: 0.45,
      })
    }
  })

  page.drawText('MODO CALIBRACION: ajusta coordenadas en /template-calibrator y exporta JSON', {
    x: 42,
    y: 24,
    size: 8,
    font,
    color: rgb(0.22, 0.22, 0.22),
  })
}
