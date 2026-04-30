import { StandardFonts, type PDFDocument } from 'pdf-lib'
import {
  TEMPLATE_BASE_HEIGHT,
  TEMPLATE_BASE_WIDTH,
  resolveTemplateFieldMap,
} from '../../../data/templateFieldMap'
import { drawFieldText } from '../../../lib/pdf/drawFieldText'
import { scaleTemplateToPdf } from '../../../lib/pdf/coordinateScaling'
import type { AttachmentChecklist, ExpenseFormValues } from '../../../types/expense'
import { dataUrlToBytes } from '../../../utils/file'
import { createPageFromTemplate } from './templateAsset'
import { toPrintableFields } from './fieldFormatters'

type RenderExpenseSheetParams = {
  pdfDoc: PDFDocument
  form: ExpenseFormValues
  checklist: AttachmentChecklist
  signatureDataUrl: string
}

export const renderExpenseSheetPage = async ({
  pdfDoc,
  form,
  checklist,
  signatureDataUrl,
}: RenderExpenseSheetParams): Promise<void> => {
  const page = await createPageFromTemplate(pdfDoc)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fieldMap = await resolveTemplateFieldMap()
  const baseSize = { width: TEMPLATE_BASE_WIDTH, height: TEMPLATE_BASE_HEIGHT }

  const printable = toPrintableFields(form)

  // Integracion real: todos los textos del PDF pasan por el mapa calibrable (JSON).
  Object.entries(printable).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      return
    }
    drawFieldText({ page, font, fieldMap, fieldId: key, value, baseSize })
  })

  const checkValue = (condition: boolean, fieldName: keyof AttachmentChecklist | keyof ExpenseFormValues) => {
    if (!condition) {
      return
    }

    drawFieldText({
      page,
      font,
      fieldMap,
      fieldId: String(fieldName),
      value: 'X',
      baseSize,
    })
  }

  checkValue(form.regularTransportTrainChecked, 'regularTransportTrainChecked')
  checkValue(form.regularTransportPlaneChecked, 'regularTransportPlaneChecked')
  checkValue(form.regularTransportBusChecked, 'regularTransportBusChecked')
  checkValue(form.regularTransportOtherChecked, 'regularTransportOtherChecked')
  checkValue(form.ownVehicleChecked, 'ownVehicleChecked')

  checkValue(checklist.attachmentsOriginalTicketsChecked, 'attachmentsOriginalTicketsChecked')
  checkValue(checklist.attachmentsHotelInvoiceChecked, 'attachmentsHotelInvoiceChecked')
  checkValue(checklist.attachmentsOtherChecked, 'attachmentsOtherChecked')

  if (signatureDataUrl) {
    const bytes = dataUrlToBytes(signatureDataUrl)
    const signatureImage = await pdfDoc.embedPng(bytes)
    const signatureArea = fieldMap.signatureInterested
    if (!signatureArea) {
      throw new Error('No existe mapeo de coordenadas para signatureInterested')
    }

    const pageSize = page.getSize()
    const scaled = scaleTemplateToPdf(signatureArea, baseSize, pageSize)

    page.drawImage(signatureImage, {
      x: scaled.x,
      y: scaled.y,
      width: Math.max(80, scaled.width),
      height: Math.max(28, scaled.height),
    })
  }
}
