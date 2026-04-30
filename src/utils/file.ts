export const fileToBytes = async (file: File): Promise<Uint8Array> => {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export const webpToPngDataUrl = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('No se pudo convertir el fichero WEBP')
  }
  ctx.drawImage(bitmap, 0, 0)
  return canvas.toDataURL('image/png')
}

export const extensionFromFile = (fileName: string): string => {
  const chunk = fileName.split('.').pop()
  return (chunk ?? '').toLowerCase()
}
