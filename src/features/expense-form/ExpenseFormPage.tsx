import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AttachmentsManager } from '../attachments/AttachmentsManager'
import { generateExpensePdf } from '../pdf-generation/generateExpensePdf'
import { generateCalibrationPdf } from '../pdf-generation/generateCalibrationPdf'
import { buildAttachmentChecklist } from '../pdf-generation/shared/attachmentChecklist'
import { SignatureField } from '../signature/SignatureField'
import { computeDerivedValues } from './calculations'
import { FIXED_OVERNIGHT_AMOUNT, FIXED_RATE_PER_KM } from './allowances'
import { defaultExpenseValues } from './defaultValues'
import { exampleExpenseData } from './exampleData'
import {
  expenseSchema,
  type ExpenseSchemaInput,
  validateBusinessRulesWithAttachments,
} from '../validation/expenseSchema'
import { clearDraft, loadDraft, saveDraft } from '../../lib/draftStorage'
import type { AttachmentItem, ExpenseFormValues } from '../../types/expense'
import { downloadBlob } from '../../utils/download'
import { formatDateEs, formatEuro } from '../../utils/format'
import { buildGoogleMapsDirectionsUrl } from '../../utils/maps'

const SECTION_CLASS = 'panel-surface p-4 md:p-5'
const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#3e7f60] focus:ring-2 focus:ring-emerald-100'

type FieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</span>
      {children}
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </label>
  )
}

const boolOptions = [
  { name: 'regularTransportTrainChecked', label: 'Ferrocarril', amount: 'regularTransportTrainAmount' },
  { name: 'regularTransportPlaneChecked', label: 'Avion', amount: 'regularTransportPlaneAmount' },
  { name: 'regularTransportBusChecked', label: 'Autobus', amount: 'regularTransportBusAmount' },
  { name: 'regularTransportOtherChecked', label: 'Otros', amount: 'regularTransportOtherAmount' },
] as const

const toFilename = (form: ExpenseFormValues): string => {
  const dateValue = formatDateEs(form.tripDate).replaceAll('/', '-') || new Date().toISOString().slice(0, 10)
  const normalized = form.fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `hoja-gastos-${dateValue}-${normalized || 'arbitro'}.pdf`
}

export function ExpenseFormPage() {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [signatureDataUrl, setSignatureDataUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null)
  const [isDraftHydrated, setIsDraftHydrated] = useState(false)
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())
  const attachmentRef = useRef<AttachmentItem[]>([])
  const lastSavedSnapshotRef = useRef<string>('')

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ExpenseSchemaInput>({
    resolver: zodResolver(expenseSchema),
    mode: 'onChange',
    defaultValues: defaultExpenseValues,
  })

  const values = watch() as ExpenseFormValues

  useEffect(() => {
    const draft = loadDraft()
    let hydratedForm = computeDerivedValues(defaultExpenseValues)
    let hydratedSignatureDataUrl = ''

    if (draft?.form) {
      hydratedForm = computeDerivedValues({ ...defaultExpenseValues, ...draft.form })
      reset(hydratedForm)
      const parsedUpdatedAt = new Date(draft.updatedAt).getTime()
      if (Number.isFinite(parsedUpdatedAt)) {
        setLastDraftSavedAt(parsedUpdatedAt)
      }
    }
    if (draft?.signatureDataUrl) {
      hydratedSignatureDataUrl = draft.signatureDataUrl
      setSignatureDataUrl(hydratedSignatureDataUrl)
    }

    lastSavedSnapshotRef.current = JSON.stringify({
      form: hydratedForm,
      signatureDataUrl: hydratedSignatureDataUrl,
    })
    setIsDraftHydrated(true)
  }, [reset])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTimestamp(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!isDraftHydrated) {
      return
    }

    const calculated = computeDerivedValues(values)

    const updateIfDifferent = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
      if (getValues(key as keyof ExpenseSchemaInput) !== value) {
        setValue(key as keyof ExpenseSchemaInput, value as never, {
          shouldDirty: true,
          shouldValidate: false,
        })
      }
    }

    updateIfDifferent('ownVehicleAmount', calculated.ownVehicleAmount)
    updateIfDifferent('ratePerKm', calculated.ratePerKm)
    updateIfDifferent('tollAmount', calculated.tollAmount)
    updateIfDifferent('mealAmountPerDay', calculated.mealAmountPerDay)
    updateIfDifferent('mealTotal', calculated.mealTotal)
    updateIfDifferent('overnightAmount', calculated.overnightAmount)
    updateIfDifferent('hotelTotal', calculated.hotelTotal)
    updateIfDifferent('totalExpenses', calculated.totalExpenses)

    if (calculated.ownVehicleChecked && calculated.vehicleOwnerIsReferee) {
      updateIfDifferent('vehicleOwner', calculated.fullName)
    }

    const snapshot = JSON.stringify({ form: calculated, signatureDataUrl })
    if (snapshot === lastSavedSnapshotRef.current) {
      return
    }

    saveDraft(calculated, signatureDataUrl)
    lastSavedSnapshotRef.current = snapshot
    setLastDraftSavedAt(Date.now())
  }, [values, signatureDataUrl, setValue, getValues, isDraftHydrated])

  useEffect(() => {
    attachmentRef.current = attachments
  }, [attachments])

  useEffect(
    () => () => {
      attachmentRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    },
    [],
  )

  const currentValues = useMemo(() => computeDerivedValues(values), [values])
  const checklist = useMemo(() => buildAttachmentChecklist(attachments), [attachments])

  const businessMessages = useMemo(
    () => validateBusinessRulesWithAttachments(currentValues, attachments, Boolean(signatureDataUrl)),
    [attachments, currentValues, signatureDataUrl],
  )

  const blockingMessages = businessMessages.filter((item) => item.level === 'error')

  const onSubmit = handleSubmit(async (input) => {
    setGenerationError(null)
    const form = computeDerivedValues(input as ExpenseFormValues)

    const messages = validateBusinessRulesWithAttachments(form, attachments, Boolean(signatureDataUrl))
    const blockers = messages.filter((item) => item.level === 'error')
    if (blockers.length > 0) {
      setGenerationError(blockers.map((item) => item.message).join(' | '))
      return
    }

    try {
      setIsGenerating(true)
      const checklistResult = buildAttachmentChecklist(attachments)
      const bytes = await generateExpensePdf({
        form,
        signatureDataUrl,
        attachments,
        checklist: checklistResult,
      })
      const binary = new Uint8Array(bytes.byteLength)
      binary.set(bytes)
      downloadBlob(new Blob([binary], { type: 'application/pdf' }), toFilename(form))
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Error no controlado al generar PDF')
    } finally {
      setIsGenerating(false)
    }
  })

  const onDownloadCalibration = async () => {
    try {
      const bytes = await generateCalibrationPdf()
      const binary = new Uint8Array(bytes.byteLength)
      binary.set(bytes)
      downloadBlob(new Blob([binary], { type: 'application/pdf' }), 'calibracion-template-fafa.pdf')
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? `No se pudo generar el PDF de calibracion: ${error.message}`
          : 'No se pudo generar el PDF de calibracion',
      )
    }
  }

  const onOpenGoogleMaps = () => {
    const url = buildGoogleMapsDirectionsUrl(currentValues.route)
    if (!url) {
      setGenerationError('Debes indicar un itinerario para abrir Google Maps')
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="rounded-3xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_35px_-26px_rgba(18,52,36,0.38)]">
        <p className="fafa-heading text-xs uppercase tracking-[0.22em] text-[#2f6d50]">Federacion Andaluza de Futbol Americano</p>
        <h1 className="fafa-heading mt-2 text-3xl font-bold text-[#123925] md:text-4xl">
          Generador de Hoja Oficial de Gastos Arbitrales
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700 md:text-[15px]">
          La primera pagina del PDF usa la plantilla oficial real. El resto del documento incorpora los
          justificantes adjuntos en el orden que elijas.
        </p>
        <p className="mt-3 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
          Guardado automatico {lastDraftSavedAt ? formatAgo(lastDraftSavedAt) : 'pendiente'}
        </p>
      </header>

      <form className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]" onSubmit={onSubmit}>
        <div className="space-y-6">
          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">1. Datos personales</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Nombre y apellidos" error={errors.fullName?.message}>
                <input className={FIELD_CLASS} {...register('fullName')} />
              </Field>
              <Field label="DNI" error={errors.dni?.message}>
                <input className={FIELD_CLASS} {...register('dni')} />
              </Field>
              <Field label="Cargo" error={errors.role?.message}>
                <input readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('role')} />
              </Field>
              <Field label="Correo" error={errors.email?.message}>
                <input type="email" className={FIELD_CLASS} {...register('email')} />
              </Field>
              <Field label="Lugar del desplazamiento" error={errors.place?.message}>
                <input className={FIELD_CLASS} {...register('place')} />
              </Field>
              <Field label="Pais" error={errors.country?.message}>
                <input className={FIELD_CLASS} {...register('country')} />
              </Field>
              <Field label="Duracion (dias)" error={errors.tripDurationDays?.message}>
                <input type="number" min={1} className={FIELD_CLASS} {...register('tripDurationDays')} />
              </Field>
              <Field label="Fecha" error={errors.tripDate?.message}>
                <input type="date" className={FIELD_CLASS} {...register('tripDate')} />
              </Field>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">2. Motivo del desplazamiento</h2>
            <Field label="Partido o actividad" error={errors.travelReason?.message}>
              <textarea rows={3} className={FIELD_CLASS} {...register('travelReason')} />
            </Field>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">3. Gastos de locomocion</h2>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transporte regular</p>
              {boolOptions.map((item) => (
                <div key={item.name} className="grid items-center gap-3 md:grid-cols-[1fr_180px]">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...register(item.name)} /> {item.label}
                  </label>
                  <input type="number" step="0.01" min={0} className={FIELD_CLASS} {...register(item.amount)} />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input type="checkbox" {...register('ownVehicleChecked')} /> Vehiculo propio
              </label>

              <Field label="Matricula" error={errors.vehiclePlate?.message}>
                <input className={FIELD_CLASS} {...register('vehiclePlate')} />
              </Field>
              <Field label="Propietario" error={errors.vehicleOwner?.message}>
                <input
                  readOnly={currentValues.vehicleOwnerIsReferee}
                  className={`${FIELD_CLASS} ${currentValues.vehicleOwnerIsReferee ? 'bg-slate-100' : ''}`}
                  {...register('vehicleOwner')}
                />
              </Field>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input type="checkbox" {...register('vehicleOwnerIsReferee')} />
                El propietario del vehiculo es el propio arbitro (copiar nombre automaticamente)
              </label>
              <Field label="Itinerario" error={errors.route?.message}>
                <input className={FIELD_CLASS} {...register('route')} />
              </Field>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={onOpenGoogleMaps}
                  disabled={!currentValues.route.trim()}
                  className="rounded-xl border border-[#2f6d50] px-4 py-2 text-sm font-semibold text-[#2f6d50] transition hover:bg-[#2f6d50] hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                >
                  Abrir itinerario en Google Maps
                </button>
              </div>
              <Field label="KM recorridos" error={errors.totalKm?.message}>
                <input type="number" min={0} className={FIELD_CLASS} {...register('totalKm')} />
              </Field>
              <Field label="Importe / KM" error={errors.ratePerKm?.message}>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  readOnly
                  className={`${FIELD_CLASS} bg-slate-100`}
                  {...register('ratePerKm')}
                />
              </Field>
              <Field label="Importe vehiculo">
                <input type="number" readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('ownVehicleAmount')} />
              </Field>
              <Field label="Peaje ida">
                <input type="number" step="0.01" min={0} className={FIELD_CLASS} {...register('tollOutward')} />
              </Field>
              <Field label="Peaje vuelta">
                <input type="number" step="0.01" min={0} className={FIELD_CLASS} {...register('tollReturn')} />
              </Field>
              <Field label="Total peajes">
                <input type="number" readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('tollAmount')} />
              </Field>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">4. Dietas</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="N de dias" error={errors.mealDays?.message}>
                <input
                  type="number"
                  min={0}
                  readOnly={currentValues.hasOvernightRight}
                  className={`${FIELD_CLASS} ${currentValues.hasOvernightRight ? 'bg-slate-100' : ''}`}
                  {...register('mealDays')}
                />
              </Field>
              <Field label="Manutencion / dia">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  readOnly
                  className={`${FIELD_CLASS} bg-slate-100`}
                  {...register('mealAmountPerDay')}
                />
              </Field>
              <Field label="Total manutencion">
                <input type="number" readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('mealTotal')} />
              </Field>
              {currentValues.hasOvernightRight && (
                <div className="md:col-span-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Incluye pernocta
                  </span>
                </div>
              )}
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input type="checkbox" {...register('hasOvernightRight')} />
                Hay derecho a pernocta
              </label>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 md:col-span-2">
                Hay derecho a pernocta si se sale del lugar de origen antes de las 7:00 o se llega al
                domicilio despues de las 23:00. Si hay pernocta, el total manutencion toma el importe
                de pernocta.
              </div>
              <Field label="Importe hotel / dia">
                <input type="number" step="0.01" min={0} className={FIELD_CLASS} {...register('hotelAmountPerDay')} />
              </Field>
              <Field label="Total hotel">
                <input type="number" readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('hotelTotal')} />
              </Field>
              <p className="text-xs text-slate-600 md:col-span-2">
                El total hotel solo incluye el importe de hotel. La pernocta se calcula como concepto
                independiente.
              </p>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">5. Banco y total</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="IBAN" error={errors.iban?.message}>
                <input className={FIELD_CLASS} {...register('iban')} />
              </Field>
              <Field label="Total gastos">
                <input type="number" readOnly className={`${FIELD_CLASS} bg-slate-100`} {...register('totalExpenses')} />
              </Field>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Valores fijos: Importe/KM = {FIXED_RATE_PER_KM.toFixed(2)} EUR. Con derecho a pernocta,
              el total manutencion incluye {FIXED_OVERNIGHT_AMOUNT.toFixed(2)} EUR.
            </p>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">6. Firma</h2>
            <div className="mt-4">
              <SignatureField signatureDataUrl={signatureDataUrl} onChange={setSignatureDataUrl} />
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h2 className="fafa-heading text-xl font-semibold text-[#123925]">7. Adjuntos</h2>
            <div className="mt-4">
              <AttachmentsManager attachments={attachments} onChange={setAttachments} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={SECTION_CLASS}>
            <h3 className="fafa-heading text-lg font-semibold uppercase tracking-[0.08em] text-[#123925]">Previsualizacion</h3>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <dt>Arbitro</dt>
                <dd className="font-semibold">{currentValues.fullName || 'Pendiente'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Fecha</dt>
                <dd>{formatDateEs(currentValues.tripDate) || 'Pendiente'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Total gastos</dt>
                <dd className="fafa-heading text-2xl font-bold text-[#123925]">{formatEuro(currentValues.totalExpenses)} EUR</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Adjuntos</dt>
                <dd>{attachments.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Firma</dt>
                <dd>{signatureDataUrl ? 'OK' : 'Falta'}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700">
              Casillas automáticas de justificantes en plantilla:
              <ul className="mt-2 list-disc pl-5">
                <li>Billetes originales: {checklist.attachmentsOriginalTicketsChecked ? 'X' : '-'}</li>
                <li>Factura hotel: {checklist.attachmentsHotelInvoiceChecked ? 'X' : '-'}</li>
                <li>Otros: {checklist.attachmentsOtherChecked ? 'X' : '-'}</li>
              </ul>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h3 className="fafa-heading text-lg font-semibold uppercase tracking-[0.08em] text-[#123925]">Validacion</h3>
            <div className="mt-3 space-y-2 text-xs">
              {businessMessages.map((item, index) => (
                <p
                  key={`${item.message}-${index}`}
                  className={
                    item.level === 'error'
                      ? 'rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-rose-700'
                      : 'rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700'
                  }
                >
                  {item.message}
                </p>
              ))}
              {businessMessages.length === 0 && (
                <p className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700">
                  Sin avisos de negocio.
                </p>
              )}
              {generationError && (
                <p className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-rose-700">
                  {generationError}
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isGenerating || blockingMessages.length > 0}
                className="rounded-xl bg-[#2f6d50] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24563f] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isGenerating ? 'Generando PDF...' : 'Generar y descargar PDF final'}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearDraft()
                  reset(defaultExpenseValues)
                  setSignatureDataUrl('')
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Limpiar formulario y borrador
              </button>

              <button
                type="button"
                onClick={() => reset(exampleExpenseData)}
                className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
              >
                Cargar ejemplo inicial
              </button>

              <button
                type="button"
                onClick={onDownloadCalibration}
                className="rounded-xl border border-[#2f6d50] px-4 py-2 text-sm font-medium text-[#2f6d50] hover:bg-emerald-50"
              >
                Descargar PDF de calibracion
              </button>
            </div>
          </section>
        </aside>
      </form>
    </div>
  )
}
