import { PDFDocument } from 'pdf-lib'
import type { PdfGenerationPayload } from '../../types/expense'
import { appendAttachments } from './appendices/appendAttachments'
import { renderExpenseSheetPage } from './template/renderExpenseSheetPage'

export const generateExpensePdf = async (payload: PdfGenerationPayload): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()

  await renderExpenseSheetPage({
    pdfDoc,
    form: payload.form,
    checklist: payload.checklist,
    signatureDataUrl: payload.signatureDataUrl,
  })

  await appendAttachments(pdfDoc, payload.attachments)

  pdfDoc.setTitle('Hoja oficial de gastos arbitrales FAFA')
  pdfDoc.setSubject('Justificacion de gastos por indemnizacion de caracter individual')
  pdfDoc.setCreator('App de gastos arbitrales FAFA')
  pdfDoc.setProducer('pdf-lib')
  pdfDoc.setCreationDate(new Date())

  return pdfDoc.save()
}
