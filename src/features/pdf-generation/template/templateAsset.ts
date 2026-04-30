import { PDFDocument } from 'pdf-lib'

export const A4_WIDTH = 595.28
export const A4_HEIGHT = 841.89

// Ajuste global para esta version de plantilla FAFA.
// Si cambias de plantilla oficial, revisa este offset junto con templateFieldMap.
export const TEMPLATE_OFFSET_X = 0
export const TEMPLATE_OFFSET_Y = 0

export type TemplateAsset =
  | {
      kind: 'pdf'
      bytes: Uint8Array
    }
  | {
      kind: 'image'
      imageType: 'png'
      bytes: Uint8Array
    }

const toBytes = async (response: Response): Promise<Uint8Array> => {
  const data = await response.arrayBuffer()
  return new Uint8Array(data)
}

const loadIfExists = async (url: string): Promise<Response | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    return response
  } catch {
    return null
  }
}

export const resolveTemplateAsset = async (): Promise<TemplateAsset> => {
  const base = import.meta.env.BASE_URL
  const pdfResponse = await loadIfExists(`${base}assets/expense-sheet-template.pdf`)
  if (pdfResponse) {
    return {
      kind: 'pdf',
      bytes: await toBytes(pdfResponse),
    }
  }

  const pngResponse = await loadIfExists(`${base}assets/expense-sheet-template.png`)
  if (pngResponse) {
    return {
      kind: 'image',
      imageType: 'png',
      bytes: await toBytes(pngResponse),
    }
  }

  throw new Error(
    'No existe plantilla oficial. Coloca /public/assets/expense-sheet-template.pdf o .png',
  )
}

export const createPageFromTemplate = async (targetDoc: PDFDocument) => {
  const template = await resolveTemplateAsset()

  if (template.kind === 'pdf') {
    const sourceDoc = await PDFDocument.load(template.bytes)
    const [templatePage] = await targetDoc.copyPages(sourceDoc, [0])
    targetDoc.addPage(templatePage)
    return targetDoc.getPage(targetDoc.getPageCount() - 1)
  }

  const page = targetDoc.addPage([A4_WIDTH, A4_HEIGHT])
  const image = await targetDoc.embedPng(template.bytes)
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  })
  return page
}
