import { format } from 'date-fns'

export const formatEuro = (value: number): string =>
  new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export const formatDateEs = (isoDate: string): string => {
  if (!isoDate) {
    return ''
  }
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return format(date, 'dd/MM/yyyy')
}

export const formatNumber = (value: number): string =>
  Number.isFinite(value) ? String(value) : ''
