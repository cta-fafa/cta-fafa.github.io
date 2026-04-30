import { useMemo } from 'react'
import type { AttachmentItem, AttachmentType } from '../../types/expense'
import { makeId } from '../../utils/id'

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.webp'

const attachmentOptions: Array<{ label: string; value: AttachmentType }> = [
  { label: 'Gasolina', value: 'fuel' },
  { label: 'Peaje', value: 'toll' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Tren', value: 'train' },
  { label: 'Avion', value: 'plane' },
  { label: 'Autobus', value: 'bus' },
  { label: 'Otro', value: 'other' },
]

type AttachmentsManagerProps = {
  attachments: AttachmentItem[]
  onChange: (next: AttachmentItem[]) => void
}

export function AttachmentsManager({ attachments, onChange }: AttachmentsManagerProps) {
  const onAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    const next = Array.from(files).map<AttachmentItem>((file) => ({
      id: makeId(),
      file,
      type: 'other',
      description: file.name,
      previewUrl: URL.createObjectURL(file),
    }))

    onChange([...attachments, ...next])
  }

  const totalSizeMb = useMemo(
    () => attachments.reduce((acc, item) => acc + item.file.size, 0) / (1024 * 1024),
    [attachments],
  )

  const updateItem = (id: string, patch: Partial<AttachmentItem>) => {
    onChange(attachments.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeItem = (id: string) => {
    const target = attachments.find((item) => item.id === id)
    if (target) {
      URL.revokeObjectURL(target.previewUrl)
    }
    onChange(attachments.filter((item) => item.id !== id))
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= attachments.length) {
      return
    }
    const list = [...attachments]
    const [item] = list.splice(index, 1)
    if (!item) {
      return
    }
    list.splice(nextIndex, 0, item)
    onChange(list)
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-300 bg-white/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Adjuntos y justificantes</h3>
        <span className="text-xs text-slate-500">
          {attachments.length} adjunto(s), {totalSizeMb.toFixed(2)} MB
        </span>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
        <span>Anadir ficheros</span>
        <input
          type="file"
          className="hidden"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={(event) => onAddFiles(event.target.files)}
        />
      </label>

      <div className="space-y-3">
        {attachments.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_170px_auto]">
              <input
                type="text"
                value={item.description}
                onChange={(event) => updateItem(item.id, { description: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Descripcion visible"
              />

              <select
                value={item.type}
                onChange={(event) =>
                  updateItem(item.id, {
                    type: event.target.value as AttachmentType,
                  })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {attachmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              {item.file.name} • {(item.file.size / 1024).toFixed(1)} KB
            </p>

            <div className="mt-2">
              {item.file.type === 'application/pdf' ? (
                <a
                  href={item.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-sky-700 underline"
                >
                  Previsualizar PDF
                </a>
              ) : (
                <img
                  src={item.previewUrl}
                  alt={item.description}
                  className="max-h-44 rounded-lg border border-slate-200 object-contain"
                />
              )}
            </div>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-600">
            Sin justificantes todavia.
          </p>
        )}
      </div>
    </div>
  )
}
