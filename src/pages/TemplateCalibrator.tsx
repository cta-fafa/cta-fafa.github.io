import { useEffect, useMemo, useState } from 'react'
import { FieldSidebar } from '../components/template-calibrator/FieldSidebar'
import { TemplateCanvas } from '../components/template-calibrator/TemplateCanvas'
import { templateFieldDefinitions } from '../data/templateFieldDefinitions'
import {
  DEFAULT_TEMPLATE_FIELD_MAP,
  TEMPLATE_BASE_HEIGHT,
  TEMPLATE_BASE_WIDTH,
  TEMPLATE_MAP_ASSET_RELATIVE_PATH,
  getTemplateFieldMap,
  loadTemplateFieldMapFromAsset,
  parseTemplateFieldMapInput,
  saveTemplateFieldMap,
} from '../data/templateFieldMap'
import type { TemplateFieldMap, TemplateFieldPosition } from '../types/templateFields'

const cloneFieldMap = (fieldMap: TemplateFieldMap): TemplateFieldMap =>
  Object.fromEntries(
    Object.entries(fieldMap).map(([fieldId, position]) => [fieldId, { ...position }]),
  )

const TEMPLATE_ACTIVE_FIELD_STORAGE_KEY = 'template-calibrator-active-field.v1'

const getInitialActiveFieldId = (): string => {
  if (typeof window === 'undefined') {
    return templateFieldDefinitions[0]?.id ?? ''
  }

  const saved = window.localStorage.getItem(TEMPLATE_ACTIVE_FIELD_STORAGE_KEY)
  if (saved && templateFieldDefinitions.some((item) => item.id === saved)) {
    return saved
  }

  return templateFieldDefinitions[0]?.id ?? ''
}

export const TemplateCalibrator = () => {
  const [fieldMap, setFieldMap] = useState<TemplateFieldMap>(() => cloneFieldMap(getTemplateFieldMap()))
  const [activeFieldId, setActiveFieldId] = useState<string>(() => getInitialActiveFieldId())
  const [lastSavedAt, setLastSavedAt] = useState<number>(() => Date.now())
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())

  const formatAgo = (savedAt: number): string => {
    const seconds = Math.max(0, Math.floor((nowTimestamp - savedAt) / 1000))
    if (seconds < 5) {
      return 'justo ahora'
    }
    if (seconds < 60) {
      return `hace ${seconds} s`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `hace ${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    return `hace ${hours} h`
  }

  const templateImageUrl = `${import.meta.env.BASE_URL}assets/expense-sheet-template.png`

  const baseSize = useMemo(
    () => ({ width: TEMPLATE_BASE_WIDTH, height: TEMPLATE_BASE_HEIGHT }),
    [],
  )

  const updateField = (fieldId: string, position: TemplateFieldPosition) => {
    setFieldMap((previous) => {
      return { ...previous, [fieldId]: position }
    })
  }

  const deleteField = (fieldId: string) => {
    setFieldMap((previous) => {
      const { [fieldId]: _removed, ...rest } = previous
      return rest
    })
  }

  const resetField = (fieldId: string) => {
    const source = DEFAULT_TEMPLATE_FIELD_MAP[fieldId]
    if (!source) {
      return
    }

    updateField(fieldId, { ...source })
  }

  const restoreField = (fieldId: string) => {
    const source = DEFAULT_TEMPLATE_FIELD_MAP[fieldId]
    if (!source) {
      return
    }

    updateField(fieldId, { ...source })
  }

  const resetAll = () => {
    const next = cloneFieldMap(DEFAULT_TEMPLATE_FIELD_MAP)
    setFieldMap(next)
  }

  const exportJson = async () => {
    const json = JSON.stringify(fieldMap, null, 2)

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template-field-map.json'
    link.click()
    URL.revokeObjectURL(url)

    try {
      await navigator.clipboard.writeText(json)
    } catch {
      // Si el navegador bloquea portapapeles, al menos ya se descargó el archivo.
    }
  }

  const importJson = (input: string): boolean => {
    try {
      const parsed = JSON.parse(input)
      const normalized = parseTemplateFieldMapInput(parsed, { includeDefaults: false })
      setFieldMap(normalized)
      return true
    } catch {
      return false
    }
  }

  const importCurrentAssetMap = async (): Promise<boolean> => {
    const fromAsset = await loadTemplateFieldMapFromAsset()
    if (!fromAsset) {
      return false
    }

    const normalized = parseTemplateFieldMapInput(fromAsset, { includeDefaults: false })
    setFieldMap(normalized)
    return true
  }

  useEffect(() => {
    saveTemplateFieldMap(fieldMap)
    setLastSavedAt(Date.now())
  }, [fieldMap])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTimestamp(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(TEMPLATE_ACTIVE_FIELD_STORAGE_KEY, activeFieldId)
  }, [activeFieldId])

  return (
    <main className="min-h-screen bg-page pb-8 pt-4 text-slate-900">
      <div className="mx-auto grid w-[min(1700px,96vw)] grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <FieldSidebar
          definitions={templateFieldDefinitions}
          fieldMap={fieldMap}
          activeFieldId={activeFieldId}
          onSelectField={setActiveFieldId}
          onUpdateField={updateField}
          onDeleteField={deleteField}
          onResetField={resetField}
          onRestoreField={restoreField}
          onResetAll={resetAll}
          onExportJson={exportJson}
          onImportJson={importJson}
          onLoadAssetJson={importCurrentAssetMap}
          recommendedAssetPath={`/public/${TEMPLATE_MAP_ASSET_RELATIVE_PATH}`}
        />

        <section className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <p>
              Haz clic en la plantilla para ubicar el campo activo o arrastra cualquier caja para ajustar
              posicion. Las coordenadas se guardan en localStorage y se exportan/importan como JSON.
            </p>
            <p className="mt-2 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Guardado automatico {formatAgo(lastSavedAt)}
            </p>
          </div>

          <TemplateCanvas
            definitions={templateFieldDefinitions}
            fieldMap={fieldMap}
            activeFieldId={activeFieldId}
            baseSize={baseSize}
            templateImageUrl={templateImageUrl}
            onSelectField={setActiveFieldId}
            onUpdateField={updateField}
          />
        </section>
      </div>
    </main>
  )
}
