import { PDFDocument } from 'pdf-lib'
import type { AttachmentItem } from '../../../types/expense'
import { dataUrlToBytes, extensionFromFile, fileToBytes, webpToPngDataUrl } from '../../../utils/file'
import { A4_HEIGHT, A4_WIDTH } from '../template/templateAsset'

const drawImageAsPage = async (
  pdfDoc: PDFDocument,
  file: File,
): Promise<void> => {
  const extension = extensionFromFile(file.name)

  let image
  if (extension === 'png') {
    image = await pdfDoc.embedPng(await fileToBytes(file))
  } else if (extension === 'jpg' || extension === 'jpeg') {
    image = await pdfDoc.embedJpg(await fileToBytes(file))
  } else if (extension === 'webp') {
    const pngDataUrl = await webpToPngDataUrl(file)
    image = await pdfDoc.embedPng(dataUrlToBytes(pngDataUrl))
  } else {
    throw new Error(`Formato no soportado para imagen: ${extension}`)
  }

  const imageWidth = image.width
  const imageHeight = image.height
  const ratio = Math.min(A4_WIDTH / imageWidth, A4_HEIGHT / imageHeight)

  const width = imageWidth * ratio
  const height = imageHeight * ratio

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
  page.drawImage(image, {
    x: (A4_WIDTH - width) / 2,
    y: (A4_HEIGHT - height) / 2,
    width,
    height,
  })
}

export const appendAttachments = async (
  pdfDoc: PDFDocument,
  attachments: AttachmentItem[],
): Promise<void> => {
  for (const attachment of attachments) {
    const extension = extensionFromFile(attachment.file.name)
    if (extension === 'pdf') {
      const src = await PDFDocument.load(await fileToBytes(attachment.file))
      const pages = await pdfDoc.copyPages(src, src.getPageIndices())
      pages.forEach((page) => pdfDoc.addPage(page))
      continue
    }

    await drawImageAsPage(pdfDoc, attachment.file)
  }
}
