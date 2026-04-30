export type AttachmentType =
  | 'fuel'
  | 'toll'
  | 'hotel'
  | 'train'
  | 'plane'
  | 'bus'
  | 'other'

export type TransportType = 'train' | 'plane' | 'bus' | 'other'

export type ExpenseFormValues = {
  fullName: string
  dni: string
  role: string
  travelReason: string
  place: string
  country: string
  tripDurationDays: number
  tripDate: string

  regularTransportTrainChecked: boolean
  regularTransportTrainAmount: number
  regularTransportPlaneChecked: boolean
  regularTransportPlaneAmount: number
  regularTransportBusChecked: boolean
  regularTransportBusAmount: number
  regularTransportOtherChecked: boolean
  regularTransportOtherAmount: number

  ownVehicleChecked: boolean
  vehicleOwnerIsReferee: boolean
  vehiclePlate: string
  vehicleOwner: string
  route: string
  totalKm: number
  ratePerKm: number
  ownVehicleAmount: number

  tollOutward: number
  tollReturn: number
  tollAmount: number

  mealDays: number
  mealAmountPerDay: number
  mealTotal: number
  hasOvernightRight: boolean
  overnightAmount: number
  hotelAmountPerDay: number
  hotelTotal: number

  totalExpenses: number
  iban: string
  email: string
}

export type AttachmentItem = {
  id: string
  file: File
  type: AttachmentType
  description: string
  previewUrl: string
}

export type AttachmentChecklist = {
  attachmentsOriginalTicketsChecked: boolean
  attachmentsHotelInvoiceChecked: boolean
  attachmentsOtherChecked: boolean
}

export type PdfGenerationPayload = {
  form: ExpenseFormValues
  signatureDataUrl: string
  attachments: AttachmentItem[]
  checklist: AttachmentChecklist
}
