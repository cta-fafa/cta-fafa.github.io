import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { FieldOverlay } from './FieldOverlay'
import type {
  TemplateFieldDefinition,
  TemplateFieldMap,
  TemplateFieldPosition,
  TemplateSize,
} from '../../types/templateFields'

type TemplateCanvasProps = {
  definitions: TemplateFieldDefinition[]
  fieldMap: TemplateFieldMap
  activeFieldId: string
  baseSize: TemplateSize
  templateImageUrl: string
  onSelectField: (fieldId: string) => void
  onUpdateField: (fieldId: string, position: TemplateFieldPosition) => void
}

type DragState = {
  fieldId: string
  pointerOffsetX: number
  pointerOffsetY: number
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

export const TemplateCanvas = ({
  definitions,
  fieldMap,
  activeFieldId,
  baseSize,
  templateImageUrl,
  onSelectField,
  onUpdateField,
}: TemplateCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(baseSize.width)
  const [dragState, setDragState] = useState<DragState | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width
      if (nextWidth && nextWidth > 0) {
        setContainerWidth(nextWidth)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const scale = useMemo(() => {
    if (baseSize.width <= 0) {
      return 1
    }
    return containerWidth / baseSize.width
  }, [baseSize.width, containerWidth])

  const containerHeight = baseSize.height * scale

  useEffect(() => {
    if (!dragState) {
      return
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const container = containerRef.current
      if (!container) {
        return
      }

      const currentPosition = fieldMap[dragState.fieldId]
      if (!currentPosition) {
        return
      }

      const rect = container.getBoundingClientRect()
      const pointerX = (event.clientX - rect.left) / scale
      const pointerY = (event.clientY - rect.top) / scale

      const nextX = clamp(
        pointerX - dragState.pointerOffsetX,
        0,
        baseSize.width - currentPosition.width,
      )
      const nextY = clamp(
        pointerY - dragState.pointerOffsetY,
        0,
        baseSize.height - currentPosition.height,
      )

      onUpdateField(dragState.fieldId, {
        ...currentPosition,
        x: Math.round(nextX),
        y: Math.round(nextY),
      })
    }

    const handlePointerUp = () => setDragState(null)

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [baseSize.height, baseSize.width, dragState, fieldMap, onUpdateField, scale])

  const handleCanvasClick = (event: PointerEvent<HTMLDivElement>) => {
    const active = fieldMap[activeFieldId]
    const container = containerRef.current
    if (!active || !container || dragState) {
      return
    }

    const rect = container.getBoundingClientRect()
    const x = (event.clientX - rect.left) / scale
    const y = (event.clientY - rect.top) / scale

    onUpdateField(activeFieldId, {
      ...active,
      x: Math.round(clamp(x, 0, baseSize.width - active.width)),
      y: Math.round(clamp(y, 0, baseSize.height - active.height)),
    })
  }

  const handleStartDrag = (fieldId: string, event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const container = containerRef.current
    const currentPosition = fieldMap[fieldId]
    if (!container || !currentPosition) {
      return
    }

    const rect = container.getBoundingClientRect()
    const pointerX = (event.clientX - rect.left) / scale
    const pointerY = (event.clientY - rect.top) / scale

    setDragState({
      fieldId,
      pointerOffsetX: pointerX - currentPosition.x,
      pointerOffsetY: pointerY - currentPosition.y,
    })
    onSelectField(fieldId)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-hidden rounded-xl border border-slate-300 bg-white"
        style={{ height: containerHeight }}
        onClick={handleCanvasClick}
      >
        <img
          src={templateImageUrl}
          alt="Plantilla oficial"
          className="absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />

        {definitions.map((definition) => {
          const position = fieldMap[definition.id]
          if (!position) {
            return null
          }

          return (
            <FieldOverlay
              key={definition.id}
              definition={definition}
              position={position}
              scale={scale}
              isActive={definition.id === activeFieldId}
              onSelect={onSelectField}
              onPointerStartDrag={handleStartDrag}
            />
          )
        })}
      </div>
    </div>
  )
}
