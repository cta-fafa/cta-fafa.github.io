import type { ExpenseFormValues } from '../types/expense'

const DRAFT_KEY = 'fafa-expense-draft-v1'

type StoredDraft = {
  updatedAt: string
  form: ExpenseFormValues
  signatureDataUrl: string
}

type LegacyStoredDraft = {
  updatedAt: string
  form: ExpenseFormValues
}

export const saveDraft = (form: ExpenseFormValues, signatureDataUrl: string): void => {
  const payload: StoredDraft = {
    updatedAt: new Date().toISOString(),
    form,
    signatureDataUrl,
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
}

export const loadDraft = (): StoredDraft | null => {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft> | LegacyStoredDraft
    return {
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      form: parsed.form as ExpenseFormValues,
      signatureDataUrl:
        typeof (parsed as Partial<StoredDraft>).signatureDataUrl === 'string'
          ? (parsed as Partial<StoredDraft>).signatureDataUrl ?? ''
          : '',
    }
  } catch {
    return null
  }
}

export const clearDraft = (): void => {
  localStorage.removeItem(DRAFT_KEY)
}
