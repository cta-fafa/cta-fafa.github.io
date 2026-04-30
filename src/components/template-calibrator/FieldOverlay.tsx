import clsx from 'clsx'
import type { PointerEvent } from 'react'
import type { TemplateFieldDefinition, TemplateFieldPosition } from '../../types/templateFields'

type FieldOverlayProps = {
  definition: TemplateFieldDefinition
  position: TemplateFieldPosition
  scale: number
  isActive: boolean
  onSelect: (fieldId: string) => void
  onPointerStartDrag: (fieldId: string, event: PointerEvent<HTMLDivElement>) => void
}

export const FieldOverlay = ({
  definition,
  position,
  scale,
  isActive,
  onSelect,
  onPointerStartDrag,
}: FieldOverlayProps) => {
  const scaledStyle = {
    left: position.x * scale,
    top: position.y * scale,
    width: position.width * scale,
    height: position.height * scale,
    fontSize: Math.max(9, position.fontSize * scale),
    textAlign: position.align,
  } as const

  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx(
        'absolute cursor-move select-none overflow-hidden rounded border px-1 py-0.5 shadow-sm',
        isActive
          ? 'border-cyan-600 bg-cyan-100/85 text-cyan-900'
          : 'border-orange-500 bg-orange-100/80 text-orange-900',
      )}
      style={scaledStyle}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(definition.id)
      }}
      onPointerDown={(event) => onPointerStartDrag(definition.id, event)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(definition.id)
        }
      }}
      title={`${definition.label} (${definition.id})`}
    >
      <div className="truncate text-[0.68em] font-semibold uppercase tracking-wide opacity-85">
        {definition.label}
      </div>
      <div className="truncate leading-tight">{definition.sampleValue}</div>
    </div>
  )
}
