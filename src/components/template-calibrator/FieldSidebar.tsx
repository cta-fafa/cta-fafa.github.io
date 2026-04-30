import { useState } from 'react'
import clsx from 'clsx'
import type {
  TemplateFieldDefinition,
  TemplateFieldMap,
  TemplateFieldPosition,
  TemplateTextAlign,
} from '../../types/templateFields'

type FieldSidebarProps = {
  definitions: TemplateFieldDefinition[]
  fieldMap: TemplateFieldMap
  activeFieldId: string
  onSelectField: (fieldId: string) => void
  onUpdateField: (fieldId: string, position: TemplateFieldPosition) => void
  onDeleteField: (fieldId: string) => void
  onResetField: (fieldId: string) => void
  onRestoreField: (fieldId: string) => void
  onResetAll: () => void
  onExportJson: () => void
  onImportJson: (input: string) => boolean
  onLoadAssetJson: () => Promise<boolean>
  recommendedAssetPath: string
}

const ALIGN_OPTIONS: TemplateTextAlign[] = ['left', 'center', 'right']

const toNumberInput = (value: string, fallback: number): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return parsed
}

export const FieldSidebar = ({
  definitions,
  fieldMap,
  activeFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onResetField,
  onRestoreField,
  onResetAll,
  onExportJson,
  onImportJson,
  onLoadAssetJson,
  recommendedAssetPath,
}: FieldSidebarProps) => {
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<string>('')

  const activeField = definitions.find((field) => field.id === activeFieldId) ?? definitions[0]
  const activePosition = activeField ? fieldMap[activeField.id] : undefined

  const patchActive = (patch: Partial<TemplateFieldPosition>) => {
    if (!activeField || !activePosition) {
      return
    }

    onUpdateField(activeField.id, {
      ...activePosition,
      ...patch,
    })
  }

  return (
    <aside className="flex h-full min-h-[720px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-lg font-semibold text-slate-900">TemplateCalibrator</h1>
        <p className="mt-1 text-xs text-slate-600">
          Selecciona un campo, colocalo en la plantilla y ajusta sus medidas con precision.
        </p>
        <p className="mt-2 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
          Para que la web use el JSON exportado, guardalo en {recommendedAssetPath}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 border-b border-slate-200 p-3">
        <button
          type="button"
          className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          onClick={onExportJson}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          onClick={onResetAll}
        >
          Reset all
        </button>
      </div>

      <div className="grid gap-2 border-b border-slate-200 p-3">
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          className="h-24 resize-y rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800"
          placeholder="Pega aqui el JSON de posiciones"
        />
        <button
          type="button"
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          onClick={() => {
            const ok = onImportJson(importText)
            setImportStatus(ok ? 'Importado correctamente' : 'JSON invalido')
          }}
        >
          Import JSON
        </button>
        <button
          type="button"
          className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={async () => {
            const ok = await onLoadAssetJson()
            setImportStatus(
              ok
                ? `Mapa cargado desde ${recommendedAssetPath}`
                : `No se pudo cargar ${recommendedAssetPath}`,
            )
          }}
        >
          Cargar mapa actual del asset
        </button>
        {importStatus ? <p className="text-xs text-slate-600">{importStatus}</p> : null}
      </div>

      <div className="border-b border-slate-200 p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Campos</h2>
        <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1">
          {definitions.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onSelectField(field.id)}
              className={clsx(
                'w-full rounded-md border px-2 py-1.5 text-left text-xs',
                !fieldMap[field.id] && 'border-rose-200 bg-rose-50 text-rose-700',
                field.id === activeFieldId
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              <div className="font-semibold">{field.label}</div>
              <div className="opacity-70">{field.id}</div>
              {!fieldMap[field.id] ? <div className="text-[11px] font-semibold">Eliminado</div> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Ajustes del campo activo</h2>
        {!activeField ? (
          <p className="text-sm text-slate-600">Selecciona un campo para editar.</p>
        ) : !activePosition ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Este campo esta eliminado del mapa actual.</p>
            <button
              type="button"
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={() => onRestoreField(activeField.id)}
            >
              Restaurar campo
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {activeField.label} ({activeField.id})
            </p>

            <label className="grid grid-cols-2 items-center gap-2">
              <span>X</span>
              <input
                type="number"
                value={activePosition.x}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) => patchActive({ x: toNumberInput(event.target.value, activePosition.x) })}
              />
            </label>
            <label className="grid grid-cols-2 items-center gap-2">
              <span>Y</span>
              <input
                type="number"
                value={activePosition.y}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) => patchActive({ y: toNumberInput(event.target.value, activePosition.y) })}
              />
            </label>
            <label className="grid grid-cols-2 items-center gap-2">
              <span>Width</span>
              <input
                type="number"
                value={activePosition.width}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) =>
                  patchActive({ width: Math.max(24, toNumberInput(event.target.value, activePosition.width)) })
                }
              />
            </label>
            <label className="grid grid-cols-2 items-center gap-2">
              <span>Height</span>
              <input
                type="number"
                value={activePosition.height}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) =>
                  patchActive({ height: Math.max(16, toNumberInput(event.target.value, activePosition.height)) })
                }
              />
            </label>
            <label className="grid grid-cols-2 items-center gap-2">
              <span>Font size</span>
              <input
                type="number"
                value={activePosition.fontSize}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) =>
                  patchActive({ fontSize: Math.max(6, toNumberInput(event.target.value, activePosition.fontSize)) })
                }
              />
            </label>
            <label className="grid grid-cols-2 items-center gap-2">
              <span>Align</span>
              <select
                value={activePosition.align}
                className="rounded border border-slate-300 px-2 py-1"
                onChange={(event) => patchActive({ align: event.target.value as TemplateTextAlign })}
              >
                {ALIGN_OPTIONS.map((align) => (
                  <option key={align} value={align}>
                    {align}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
              onClick={() => onResetField(activeField.id)}
            >
              Reset field
            </button>

            <button
              type="button"
              className="w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              onClick={() => onDeleteField(activeField.id)}
            >
              Eliminar campo
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
