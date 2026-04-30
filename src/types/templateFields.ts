export type TemplateTextAlign = 'left' | 'center' | 'right'

export type TemplateFieldDefinition = {
  id: string
  label: string
  sampleValue: string
}

export type TemplateFieldPosition = {
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  align: TemplateTextAlign
}

export type TemplateFieldMap = Record<string, TemplateFieldPosition>

export type TemplateSize = {
  width: number
  height: number
}
