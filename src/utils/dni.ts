const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

const normalize = (value: string): string => value.trim().toUpperCase().replace(/\s+/g, '')

const isDni = (value: string): boolean => /^\d{8}[A-Z]$/.test(value)

const isNie = (value: string): boolean => /^[XYZ]\d{7}[A-Z]$/.test(value)

const expectedLetter = (numericPart: number): string => DNI_LETTERS[numericPart % 23] ?? ''

export const isValidSpanishDniOrNie = (rawValue: string): boolean => {
  const value = normalize(rawValue)

  if (isDni(value)) {
    const numbers = Number(value.slice(0, 8))
    const letter = value.slice(8)
    return expectedLetter(numbers) === letter
  }

  if (isNie(value)) {
    const prefix = value.charAt(0) as 'X' | 'Y' | 'Z'
    const map: Record<'X' | 'Y' | 'Z', string> = { X: '0', Y: '1', Z: '2' }
    const numericBase = `${map[prefix]}${value.slice(1, 8)}`
    const numbers = Number(numericBase)
    const letter = value.slice(8)
    return expectedLetter(numbers) === letter
  }

  return false
}
