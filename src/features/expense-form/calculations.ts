import type { ExpenseFormValues } from '../../types/expense'
import {
  FIXED_OVERNIGHT_AMOUNT,
  FIXED_RATE_PER_KM,
  resolveMealAllowancePerDay,
} from './allowances'

export const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.')
    if (!normalized) {
      return 0
    }
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export const computeDerivedValues = (values: ExpenseFormValues): ExpenseFormValues => {
  const totalKm = toSafeNumber(values.totalKm)
  const tollOutward = toSafeNumber(values.tollOutward)
  const tollReturn = toSafeNumber(values.tollReturn)
  const mealDays = toSafeNumber(values.mealDays)
  const regularTransportTrainAmount = toSafeNumber(values.regularTransportTrainAmount)
  const regularTransportPlaneAmount = toSafeNumber(values.regularTransportPlaneAmount)
  const regularTransportBusAmount = toSafeNumber(values.regularTransportBusAmount)
  const regularTransportOtherAmount = toSafeNumber(values.regularTransportOtherAmount)
  const hotelAmountPerDay = toSafeNumber(values.hotelAmountPerDay)

  const ratePerKm = FIXED_RATE_PER_KM
  const ownVehicleAmount = values.ownVehicleChecked
    ? roundMoney(totalKm * ratePerKm)
    : 0

  const mealAmountPerDay = values.hasOvernightRight ? 0 : resolveMealAllowancePerDay(totalKm)
  const tollAmount = roundMoney(tollOutward + tollReturn)
  const overnightAmount = values.hasOvernightRight ? FIXED_OVERNIGHT_AMOUNT : 0
  const mealTotal = values.hasOvernightRight
    ? overnightAmount
    : roundMoney(mealDays * mealAmountPerDay)
  const hotelTotal = roundMoney(hotelAmountPerDay)

  const regularTransportTotal = roundMoney(
    (values.regularTransportTrainChecked ? regularTransportTrainAmount : 0) +
      (values.regularTransportPlaneChecked ? regularTransportPlaneAmount : 0) +
      (values.regularTransportBusChecked ? regularTransportBusAmount : 0) +
      (values.regularTransportOtherChecked ? regularTransportOtherAmount : 0),
  )

  const totalExpenses = roundMoney(
    regularTransportTotal + ownVehicleAmount + tollAmount + mealTotal + hotelTotal,
  )

  return {
    ...values,
    vehicleOwnerIsReferee: Boolean(values.vehicleOwnerIsReferee),
    totalKm,
    tollOutward,
    tollReturn,
    mealDays,
    regularTransportTrainAmount,
    regularTransportPlaneAmount,
    regularTransportBusAmount,
    regularTransportOtherAmount,
    hotelAmountPerDay,
    ratePerKm,
    ownVehicleAmount,
    mealAmountPerDay,
    tollAmount,
    mealTotal,
    overnightAmount,
    hotelTotal,
    totalExpenses,
  }
}
