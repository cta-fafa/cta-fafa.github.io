import type { TemplateFieldPosition, TemplateSize } from '../../types/templateFields'

export type ScaledFieldPosition = {
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  align: TemplateFieldPosition['align']
}

export const scaleTemplateToPdf = (
  position: TemplateFieldPosition,
  baseSize: TemplateSize,
  pdfSize: TemplateSize,
): ScaledFieldPosition => {
  const scaleX = pdfSize.width / baseSize.width
  const scaleY = pdfSize.height / baseSize.height

  const scaledX = position.x * scaleX
  const scaledTopY = position.y * scaleY
  const scaledWidth = position.width * scaleX
  const scaledHeight = position.height * scaleY

  // El calibrador trabaja con origen arriba-izquierda; PDF usa abajo-izquierda.
  const pdfBottomY = pdfSize.height - scaledTopY - scaledHeight

  return {
    x: scaledX,
    y: pdfBottomY,
    width: scaledWidth,
    height: scaledHeight,
    fontSize: position.fontSize * scaleY,
    align: position.align,
  }
}
