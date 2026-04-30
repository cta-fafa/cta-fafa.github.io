import type { ExpenseFormValues } from '../../../types/expense'
import { formatDateEs, formatEuro, formatNumber } from '../../../utils/format'

const cleanText = (value: string): string => value.trim()

const formatDurationDays = (days: number): string => {
  if (days <= 0) {
    return ''
  }

  const normalizedDays = formatNumber(days)
  return `${normalizedDays} ${days === 1 ? 'día' : 'días'}`
}

export const toPrintableFields = (form: ExpenseFormValues) => ({
  fullName: cleanText(form.fullName),
  dni: cleanText(form.dni),
  role: '',
  travelReason: cleanText(form.travelReason),
  place: cleanText(form.place),
  country: cleanText(form.country),
  tripDurationDays: formatDurationDays(form.tripDurationDays),
  tripDate: formatDateEs(form.tripDate),

  regularTransportTrainChecked: form.regularTransportTrainChecked,
  regularTransportTrainAmount: form.regularTransportTrainChecked
    ? formatEuro(form.regularTransportTrainAmount)
    : '',
  regularTransportPlaneChecked: form.regularTransportPlaneChecked,
  regularTransportPlaneAmount: form.regularTransportPlaneChecked
    ? formatEuro(form.regularTransportPlaneAmount)
    : '',
  regularTransportBusChecked: form.regularTransportBusChecked,
  regularTransportBusAmount: form.regularTransportBusChecked ? formatEuro(form.regularTransportBusAmount) : '',
  regularTransportOtherChecked: form.regularTransportOtherChecked,
  regularTransportOtherAmount: form.regularTransportOtherChecked
    ? formatEuro(form.regularTransportOtherAmount)
    : '',

  ownVehicleChecked: form.ownVehicleChecked,
  vehiclePlate: form.ownVehicleChecked ? cleanText(form.vehiclePlate) : '',
  vehicleOwner: form.ownVehicleChecked ? cleanText(form.vehicleOwner) : '',
  route: form.ownVehicleChecked ? cleanText(form.route) : '',
  totalKm: form.totalKm > 0 ? formatNumber(form.totalKm) : '',
  ratePerKm: form.ownVehicleChecked ? formatEuro(form.ratePerKm) : '',
  ownVehicleAmount: form.ownVehicleChecked ? formatEuro(form.ownVehicleAmount) : '',

  tollOutward: form.tollOutward ? formatEuro(form.tollOutward) : '',
  tollReturn: form.tollReturn ? formatEuro(form.tollReturn) : '',
  tollAmount: form.tollAmount ? formatEuro(form.tollAmount) : '',

  mealDays: form.mealDays > 0 ? formatNumber(form.mealDays) : '',
  mealAmountPerDay: form.mealAmountPerDay ? formatEuro(form.mealAmountPerDay) : '',
  mealTotal: form.mealTotal ? formatEuro(form.mealTotal) : '',
  overnightAmount: form.overnightAmount ? formatEuro(form.overnightAmount) : '',
  hotelAmountPerDay: form.hotelAmountPerDay ? formatEuro(form.hotelAmountPerDay) : '',
  hotelTotal: form.hotelTotal ? formatEuro(form.hotelTotal) : '',

  totalExpenses: formatEuro(form.totalExpenses),
  iban: cleanText(form.iban),
  email: cleanText(form.email),
})
