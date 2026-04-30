import { rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { TemplateFieldMap, TemplateSize } from '../../types/templateFields'
import { scaleTemplateToPdf } from './coordinateScaling'

type DrawFieldTextParams = {
  page: PDFPage
  font: PDFFont
  fieldMap: TemplateFieldMap
  fieldId: string
  value: string
  baseSize: TemplateSize
}

const fitText = (text: string, maxWidth: number, measure: (input: string) => number): string => {
  if (!text) {
    return ''
  }
  if (measure(text) <= maxWidth) {
    return text
  }

  let trimmed = text
  while (trimmed.length > 1 && measure(`${trimmed}...`) > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed}...`
}

export const drawFieldText = ({
  page,
  font,
  fieldMap,
  fieldId,
  value,
  baseSize,
}: DrawFieldTextParams): void => {
  const cleanValue = value.trim()
  if (!cleanValue) {
    return
  }

  const sourcePosition = fieldMap[fieldId]
  if (!sourcePosition) {
    return
  }

  const pageSize = page.getSize()
  const position = scaleTemplateToPdf(sourcePosition, baseSize, pageSize)
  const measure = (input: string) => font.widthOfTextAtSize(input, position.fontSize)
  const text = fitText(cleanValue, Math.max(8, position.width), measure)
  const textWidth = measure(text)

  const horizontalPadding = Math.min(6, position.width * 0.1)
  let textX = position.x + horizontalPadding
  if (position.align === 'center') {
    textX = position.x + (position.width - textWidth) / 2
  }
  if (position.align === 'right') {
    textX = position.x + position.width - textWidth - horizontalPadding
  }

  // Baseline cercana al borde inferior de la caja para parecerse al formulario oficial.
  const textY = position.y + Math.max(1, position.height * 0.18)

  page.drawText(text, {
    x: textX,
    y: textY,
    size: position.fontSize,
    font,
    color: rgb(0.05, 0.05, 0.05),
  })
}
