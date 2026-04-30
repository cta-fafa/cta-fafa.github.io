import {
  DEFAULT_TEMPLATE_FIELD_MAP,
  TEMPLATE_BASE_HEIGHT,
  TEMPLATE_BASE_WIDTH,
} from '../../../data/templateFieldMap'
import { scaleTemplateToPdf } from '../../../lib/pdf/coordinateScaling'

export type PdfFieldPosition = {
  x: number
  y: number
  maxWidth?: number
  fontSize?: number
  align?: 'left' | 'center' | 'right'
}

export const templateFieldMap: Record<string, PdfFieldPosition> = Object.fromEntries(
  Object.entries(DEFAULT_TEMPLATE_FIELD_MAP).map(([fieldId, position]) => {
    const scaled = scaleTemplateToPdf(
      position,
      { width: TEMPLATE_BASE_WIDTH, height: TEMPLATE_BASE_HEIGHT },
      { width: 595, height: 842 },
    )

    return [
      fieldId,
      {
        x: scaled.x,
        y: scaled.y,
        maxWidth: scaled.width,
        fontSize: scaled.fontSize,
        align: scaled.align,
      },
    ]
  }),
)
