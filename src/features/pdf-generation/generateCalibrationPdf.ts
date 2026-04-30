import { PDFDocument } from 'pdf-lib'
import { renderCalibrationPage } from './template/renderCalibrationPage'

export const generateCalibrationPdf = async (): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()
  await renderCalibrationPage(pdfDoc)

  pdfDoc.setTitle('Calibracion plantilla FAFA')
  pdfDoc.setSubject('Referencia visual de coordenadas para templateFieldMap')
  pdfDoc.setCreator('App de gastos arbitrales FAFA')

  return pdfDoc.save()
}
