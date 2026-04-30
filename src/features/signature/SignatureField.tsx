import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

type SignatureFieldProps = {
  signatureDataUrl: string
  onChange: (dataUrl: string) => void
}

export function SignatureField({ signatureDataUrl, onChange }: SignatureFieldProps) {
  const padRef = useRef<SignatureCanvas | null>(null)

  const commit = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      onChange('')
      return
    }
    onChange(padRef.current.toDataURL('image/png'))
  }

  const clear = () => {
    padRef.current?.clear()
    onChange('')
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-300 bg-white/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">Firma manuscrita del interesado</p>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
        >
          Limpiar firma
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white p-2">
        <SignatureCanvas
          ref={padRef}
          penColor="#0f172a"
          canvasProps={{
            className: 'signature-canvas',
            width: 680,
            height: 180,
          }}
          onEnd={commit}
        />
      </div>

      <p className="text-xs text-slate-600">
        La firma debe hacerse aqui. El flujo principal no permite subir una imagen para sustituir la firma.
      </p>

      {signatureDataUrl && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Firma capturada correctamente.
        </div>
      )}
    </div>
  )
}
