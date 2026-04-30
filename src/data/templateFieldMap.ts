import { templateFieldDefinitions } from './templateFieldDefinitions'
import type { TemplateFieldMap, TemplateFieldPosition, TemplateTextAlign } from '../types/templateFields'

export const TEMPLATE_BASE_WIDTH = 1240
export const TEMPLATE_BASE_HEIGHT = 1754
export const TEMPLATE_MAP_ASSET_RELATIVE_PATH = 'assets/template-field-map.json'

const TEMPLATE_MAP_STORAGE_KEY = 'template-calibrator-field-map.v1'

const DEFAULT_FIELD_POSITION: TemplateFieldPosition = {
  x: 40,
  y: 40,
  width: 220,
  height: 28,
  fontSize: 18,
  align: 'left',
}

type LegacyPdfFieldPosition = {
  x: number
  y: number
  maxWidth?: number
  fontSize?: number
  align?: TemplateTextAlign
}

const LEGACY_PDF_WIDTH = 595
const LEGACY_PDF_HEIGHT = 842

const legacyPdfMap: Record<string, LegacyPdfFieldPosition> = {
  fullName: { x: 200, y: 669, maxWidth: 250, fontSize: 9 },
  dni: { x: 96, y: 649, maxWidth: 110, fontSize: 9 },
  travelReason: { x: 170, y: 629, maxWidth: 215, fontSize: 8 },
  place: { x: 170, y: 612, maxWidth: 215, fontSize: 8 },
  country: { x: 402, y: 612, maxWidth: 80, fontSize: 8, align: 'center' },
  tripDurationDays: { x: 333, y: 592, maxWidth: 26, fontSize: 8, align: 'center' },
  tripDate: { x: 365, y: 592, maxWidth: 95, fontSize: 8 },

  regularTransportTrainChecked: { x: 129, y: 556, fontSize: 10 },
  regularTransportTrainAmount: { x: 487, y: 556, maxWidth: 60, fontSize: 8, align: 'right' },
  regularTransportPlaneChecked: { x: 129, y: 539, fontSize: 10 },
  regularTransportPlaneAmount: { x: 487, y: 539, maxWidth: 60, fontSize: 8, align: 'right' },
  regularTransportBusChecked: { x: 129, y: 522, fontSize: 10 },
  regularTransportBusAmount: { x: 487, y: 522, maxWidth: 60, fontSize: 8, align: 'right' },
  regularTransportOtherChecked: { x: 129, y: 505, fontSize: 10 },
  regularTransportOtherAmount: { x: 487, y: 505, maxWidth: 60, fontSize: 8, align: 'right' },

  ownVehicleChecked: { x: 129, y: 486, fontSize: 10 },
  vehiclePlate: { x: 293, y: 486, maxWidth: 80, fontSize: 8 },
  vehicleOwner: { x: 455, y: 486, maxWidth: 95, fontSize: 8 },
  route: { x: 129, y: 452, maxWidth: 230, fontSize: 8 },
  totalKm: { x: 307, y: 436, maxWidth: 55, fontSize: 8, align: 'right' },
  ratePerKm: { x: 372, y: 436, maxWidth: 48, fontSize: 8, align: 'right' },
  ownVehicleAmount: { x: 487, y: 436, maxWidth: 60, fontSize: 8, align: 'right' },

  tollOutward: { x: 340, y: 388, maxWidth: 60, fontSize: 8, align: 'right' },
  tollReturn: { x: 340, y: 371, maxWidth: 60, fontSize: 8, align: 'right' },
  tollAmount: { x: 487, y: 380, maxWidth: 60, fontSize: 8, align: 'right' },

  mealDays: { x: 164, y: 340, maxWidth: 25, fontSize: 8, align: 'center' },
  mealAmountPerDay: { x: 339, y: 340, maxWidth: 60, fontSize: 8, align: 'right' },
  mealTotal: { x: 487, y: 340, maxWidth: 60, fontSize: 8, align: 'right' },
  overnightAmount: { x: 339, y: 323, maxWidth: 60, fontSize: 8, align: 'right' },
  hotelAmountPerDay: { x: 339, y: 289, maxWidth: 60, fontSize: 8, align: 'right' },
  hotelTotal: { x: 487, y: 289, maxWidth: 60, fontSize: 8, align: 'right' },

  totalExpenses: { x: 487, y: 258, maxWidth: 60, fontSize: 8, align: 'right' },
  iban: { x: 206, y: 181, maxWidth: 225, fontSize: 9 },
  email: { x: 204, y: 159, maxWidth: 180, fontSize: 7 },

  signatureInterested: { x: 434, y: 128, maxWidth: 80, fontSize: 10 },
  attachmentsOriginalTicketsChecked: { x: 129, y: 71, fontSize: 10 },
  attachmentsHotelInvoiceChecked: { x: 129, y: 54, fontSize: 10 },
  attachmentsOtherChecked: { x: 129, y: 38, fontSize: 10 },
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const toBaseFromLegacy = (legacy: LegacyPdfFieldPosition): TemplateFieldPosition => {
  const legacyFontSize = legacy.fontSize ?? 9
  const legacyHeight = legacyFontSize + 8
  const topY = LEGACY_PDF_HEIGHT - legacy.y - legacyHeight

  const scaleX = TEMPLATE_BASE_WIDTH / LEGACY_PDF_WIDTH
  const scaleY = TEMPLATE_BASE_HEIGHT / LEGACY_PDF_HEIGHT

  return {
    x: Math.round(legacy.x * scaleX),
    y: Math.round(topY * scaleY),
    width: Math.max(24, Math.round((legacy.maxWidth ?? 160) * scaleX)),
    height: Math.max(20, Math.round(legacyHeight * scaleY)),
    fontSize: Math.max(10, Math.round(legacyFontSize * scaleY)),
    align: legacy.align ?? 'left',
  }
}

const createDefaultFieldMap = (): TemplateFieldMap => {
  const map: TemplateFieldMap = {}

  templateFieldDefinitions.forEach((definition, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)

    map[definition.id] = {
      ...DEFAULT_FIELD_POSITION,
      x: 32 + col * 390,
      y: 28 + row * 34,
    }
  })

  Object.entries(legacyPdfMap).forEach(([fieldId, position]) => {
    map[fieldId] = toBaseFromLegacy(position)
  })

  return map
}

export const DEFAULT_TEMPLATE_FIELD_MAP: TemplateFieldMap = createDefaultFieldMap()

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback
  }
  return value
}

const toAlign = (value: unknown, fallback: TemplateTextAlign): TemplateTextAlign => {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }
  return fallback
}

type NormalizeOptions = {
  includeDefaults?: boolean
}

const sanitizePosition = (
  position: unknown,
  fallback: TemplateFieldPosition,
): TemplateFieldPosition => {
  if (!isObjectRecord(position)) {
    return fallback
  }

  const width = clamp(toNumber(position.width, fallback.width), 24, TEMPLATE_BASE_WIDTH)
  const height = clamp(toNumber(position.height, fallback.height), 16, TEMPLATE_BASE_HEIGHT)

  return {
    x: clamp(toNumber(position.x, fallback.x), 0, TEMPLATE_BASE_WIDTH - width),
    y: clamp(toNumber(position.y, fallback.y), 0, TEMPLATE_BASE_HEIGHT - height),
    width,
    height,
    fontSize: clamp(toNumber(position.fontSize, fallback.fontSize), 6, 120),
    align: toAlign(position.align, fallback.align),
  }
}

export const normalizeTemplateFieldMap = (
  raw: unknown,
  options: NormalizeOptions = {},
): TemplateFieldMap => {
  const includeDefaults = options.includeDefaults ?? true
  const normalized: TemplateFieldMap = includeDefaults ? { ...DEFAULT_TEMPLATE_FIELD_MAP } : {}
  if (!isObjectRecord(raw)) {
    return normalized
  }

  Object.entries(raw).forEach(([fieldId, rawPosition]) => {
    const fallback = normalized[fieldId] ?? DEFAULT_TEMPLATE_FIELD_MAP[fieldId] ?? DEFAULT_FIELD_POSITION
    normalized[fieldId] = sanitizePosition(rawPosition, fallback)
  })

  return normalized
}

const toImportData = (raw: unknown): unknown => {
  if (!isObjectRecord(raw)) {
    return raw
  }

  if (isObjectRecord(raw.fieldMap)) {
    return raw.fieldMap
  }

  return raw
}

export const parseTemplateFieldMapInput = (
  raw: unknown,
  options: NormalizeOptions = {},
): TemplateFieldMap => normalizeTemplateFieldMap(toImportData(raw), options)

const readLocalStorageRaw = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(TEMPLATE_MAP_STORAGE_KEY)
}

export const getTemplateFieldMap = (): TemplateFieldMap => {
  const raw = readLocalStorageRaw()
  if (!raw) {
    return DEFAULT_TEMPLATE_FIELD_MAP
  }

  try {
    return parseTemplateFieldMapInput(JSON.parse(raw), { includeDefaults: false })
  } catch {
    return DEFAULT_TEMPLATE_FIELD_MAP
  }
}

export const saveTemplateFieldMap = (fieldMap: TemplateFieldMap): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(TEMPLATE_MAP_STORAGE_KEY, JSON.stringify({ fieldMap }))
}

export const loadTemplateFieldMapFromAsset = async (): Promise<TemplateFieldMap | null> => {
  if (typeof window === 'undefined') {
    return null
  }

  const assetUrl = `${import.meta.env.BASE_URL}${TEMPLATE_MAP_ASSET_RELATIVE_PATH}`

  try {
    const response = await fetch(assetUrl)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return parseTemplateFieldMapInput(data, { includeDefaults: false })
  } catch {
    return null
  }
}

export const resolveTemplateFieldMap = async (): Promise<TemplateFieldMap> => {
  const local = getTemplateFieldMap()
  if (readLocalStorageRaw()) {
    return local
  }

  const fromAsset = await loadTemplateFieldMapFromAsset()
  if (fromAsset) {
    return fromAsset
  }

  return DEFAULT_TEMPLATE_FIELD_MAP
}
