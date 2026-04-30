import { z } from 'zod'
import type { AttachmentItem } from '../../types/expense'
import { FIXED_OVERNIGHT_AMOUNT } from '../expense-form/allowances'
import { isValidSpanishDniOrNie } from '../../utils/dni'

const moneyField = z.coerce.number().min(0, 'No puede ser negativo')

export const expenseSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Nombre y apellidos obligatorios'),
    dni: z
      .string()
      .trim()
      .min(1, 'DNI obligatorio')
      .refine((value) => isValidSpanishDniOrNie(value), 'DNI/NIE no valido'),
    role: z.string().trim().min(2, 'Cargo obligatorio'),
    travelReason: z.string().trim().min(3, 'Indica el motivo del desplazamiento'),
    place: z.string().trim().min(2, 'Lugar obligatorio'),
    country: z.string().trim().min(2, 'Pais obligatorio'),
    tripDurationDays: z.coerce.number().int().min(1, 'Minimo 1 dia'),
    tripDate: z.string().min(1, 'Fecha obligatoria'),

    regularTransportTrainChecked: z.boolean(),
    regularTransportTrainAmount: moneyField,
    regularTransportPlaneChecked: z.boolean(),
    regularTransportPlaneAmount: moneyField,
    regularTransportBusChecked: z.boolean(),
    regularTransportBusAmount: moneyField,
    regularTransportOtherChecked: z.boolean(),
    regularTransportOtherAmount: moneyField,

    ownVehicleChecked: z.boolean(),
    vehicleOwnerIsReferee: z.boolean(),
    vehiclePlate: z.string(),
    vehicleOwner: z.string(),
    route: z.string(),
    totalKm: z.coerce.number().min(0),
    ratePerKm: z.coerce.number().min(0),
    ownVehicleAmount: moneyField,

    tollOutward: moneyField,
    tollReturn: moneyField,
    tollAmount: moneyField,

    mealDays: z.coerce.number().int().min(0),
    mealAmountPerDay: moneyField,
    mealTotal: moneyField,
    hasOvernightRight: z.boolean(),
    overnightAmount: moneyField,
    hotelAmountPerDay: moneyField,
    hotelTotal: moneyField,

    totalExpenses: moneyField,
    iban: z.string().trim().min(10, 'IBAN obligatorio'),
    email: z.email('Correo invalido'),
  })
  .superRefine((data, ctx) => {
    if (data.ownVehicleChecked) {
      if (!data.vehiclePlate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vehiclePlate'],
          message: 'Matricula obligatoria si usas vehiculo propio',
        })
      }
      if (!data.vehicleOwner.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vehicleOwner'],
          message: 'Propietario obligatorio',
        })
      }
      if (!data.route.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['route'],
          message: 'Itinerario obligatorio',
        })
      }
    }

    if (data.totalKm <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalKm'],
        message: 'Los kilometros deben ser mayores de 0 para calcular la manutencion',
      })
    }

    if (!data.hasOvernightRight && data.mealDays > data.tripDurationDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mealDays'],
        message: 'Los dias de manutencion no pueden superar la duracion del desplazamiento',
      })
    }

    if (data.hasOvernightRight && data.mealAmountPerDay > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mealAmountPerDay'],
        message: 'Con pernocta, manutencion/dia debe ser 0',
      })
    }

    if (data.hasOvernightRight && Math.abs(data.mealTotal - FIXED_OVERNIGHT_AMOUNT) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mealTotal'],
        message: 'Con pernocta, el total manutencion debe coincidir con el importe de pernocta',
      })
    }

    if (!data.hasOvernightRight && data.overnightAmount > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['overnightAmount'],
        message: 'Sin derecho a pernocta, el importe pernocta debe ser 0',
      })
    }

    if (data.hasOvernightRight && Math.abs(data.overnightAmount - FIXED_OVERNIGHT_AMOUNT) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['overnightAmount'],
        message: 'El importe pernocta debe coincidir con el valor fijo oficial',
      })
    }
  })

export type ExpenseSchemaInput = z.input<typeof expenseSchema>
export type ExpenseSchemaOutput = z.output<typeof expenseSchema>

export type RuleMessage = {
  level: 'error' | 'warning'
  message: string
}

const hasAttachment = (attachments: AttachmentItem[], types: Array<AttachmentItem['type']>) =>
  attachments.some((item) => types.includes(item.type))

export const validateBusinessRulesWithAttachments = (
  data: ExpenseSchemaOutput,
  attachments: AttachmentItem[],
  hasSignature: boolean,
): RuleMessage[] => {
  const messages: RuleMessage[] = []

  if (!hasSignature) {
    messages.push({ level: 'error', message: 'La firma manuscrita del interesado es obligatoria' })
  }

  if (data.ownVehicleChecked && !hasAttachment(attachments, ['fuel'])) {
    messages.push({
      level: 'warning',
      message:
        'Para vehiculo propio se recomienda adjuntar ticket de repostaje del dia del desplazamiento',
    })
  }

  if (data.regularTransportTrainChecked && !hasAttachment(attachments, ['train'])) {
    messages.push({ level: 'error', message: 'Has marcado ferrocarril pero no hay justificante de tren' })
  }
  if (data.regularTransportPlaneChecked && !hasAttachment(attachments, ['plane'])) {
    messages.push({ level: 'error', message: 'Has marcado avion pero no hay justificante de avion' })
  }
  if (data.regularTransportBusChecked && !hasAttachment(attachments, ['bus'])) {
    messages.push({ level: 'error', message: 'Has marcado autobus pero no hay justificante de autobus' })
  }

  if (data.hotelTotal > 0 && !hasAttachment(attachments, ['hotel'])) {
    messages.push({
      level: 'error',
      message: 'Hay gasto de alojamiento pero falta factura de hotel adjunta',
    })
  }

  if (attachments.length === 0) {
    messages.push({
      level: 'warning',
      message: 'No hay justificantes adjuntos. No se marcara ninguna casilla de justificantes',
    })
  }

  return messages
}
