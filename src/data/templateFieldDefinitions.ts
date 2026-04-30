import type { TemplateFieldDefinition } from '../types/templateFields'

export const templateFieldDefinitions: TemplateFieldDefinition[] = [
  { id: 'fullName', label: 'Nombre completo', sampleValue: 'Javier Martin Castro' },
  { id: 'dni', label: 'DNI', sampleValue: '12345678Z' },
  { id: 'licenseNumber', label: 'Numero de licencia', sampleValue: 'A-1234' },
  { id: 'category', label: 'Categoria', sampleValue: 'Primera Autonomica' },
  { id: 'matchDate', label: 'Fecha del partido', sampleValue: '29/04/2026' },
  { id: 'competition', label: 'Competicion', sampleValue: 'Liga Regular' },
  { id: 'venue', label: 'Sede', sampleValue: 'Estadio Municipal' },
  { id: 'origin', label: 'Origen', sampleValue: 'Sevilla' },
  { id: 'destination', label: 'Destino', sampleValue: 'Huelva' },
  { id: 'kilometers', label: 'Kilometros', sampleValue: '238' },
  { id: 'diet', label: 'Dieta', sampleValue: '10,00 EUR' },
  { id: 'hotel', label: 'Hotel', sampleValue: '40,82 EUR' },
  { id: 'tolls', label: 'Peajes', sampleValue: '8,40 EUR' },
  { id: 'parking', label: 'Parking', sampleValue: '2,20 EUR' },
  { id: 'total', label: 'Total', sampleValue: '61,42 EUR' },

  // Campos usados actualmente por el generador real.
  { id: 'travelReason', label: 'Motivo desplazamiento', sampleValue: 'Partido oficial' },
  { id: 'place', label: 'Lugar', sampleValue: 'Sevilla' },
  { id: 'country', label: 'Provincia', sampleValue: 'Sevilla' },
  { id: 'tripDurationDays', label: 'Dias', sampleValue: '1' },
  { id: 'tripDate', label: 'Fecha desplazamiento', sampleValue: '29/04/2026' },

  { id: 'regularTransportTrainChecked', label: 'Check tren', sampleValue: 'X' },
  { id: 'regularTransportTrainAmount', label: 'Importe tren', sampleValue: '0,00 EUR' },
  { id: 'regularTransportPlaneChecked', label: 'Check avion', sampleValue: 'X' },
  { id: 'regularTransportPlaneAmount', label: 'Importe avion', sampleValue: '0,00 EUR' },
  { id: 'regularTransportBusChecked', label: 'Check autobus', sampleValue: 'X' },
  { id: 'regularTransportBusAmount', label: 'Importe autobus', sampleValue: '0,00 EUR' },
  { id: 'regularTransportOtherChecked', label: 'Check otros', sampleValue: 'X' },
  { id: 'regularTransportOtherAmount', label: 'Importe otros', sampleValue: '0,00 EUR' },

  { id: 'ownVehicleChecked', label: 'Check vehiculo propio', sampleValue: 'X' },
  { id: 'vehiclePlate', label: 'Matricula', sampleValue: '1234-ABC' },
  { id: 'vehicleOwner', label: 'Propietario', sampleValue: 'Javier Martin Castro' },
  { id: 'route', label: 'Itinerario', sampleValue: 'Sevilla - Huelva - Sevilla' },
  { id: 'totalKm', label: 'KM recorridos', sampleValue: '238' },
  { id: 'ratePerKm', label: 'Importe por KM', sampleValue: '0,26 EUR' },
  { id: 'ownVehicleAmount', label: 'Importe vehiculo propio', sampleValue: '61,88 EUR' },

  { id: 'tollOutward', label: 'Peaje ida', sampleValue: '4,20 EUR' },
  { id: 'tollReturn', label: 'Peaje vuelta', sampleValue: '4,20 EUR' },
  { id: 'tollAmount', label: 'Total peajes', sampleValue: '8,40 EUR' },

  { id: 'mealDays', label: 'Dias manutencion', sampleValue: '1' },
  { id: 'mealAmountPerDay', label: 'Importe manutencion/dia', sampleValue: '10,00 EUR' },
  { id: 'mealTotal', label: 'Total manutencion', sampleValue: '10,00 EUR' },
  { id: 'overnightAmount', label: 'Importe pernocta', sampleValue: '40,82 EUR' },
  { id: 'hotelAmountPerDay', label: 'Importe hotel/dia', sampleValue: '40,82 EUR' },
  { id: 'hotelTotal', label: 'Total hotel', sampleValue: '40,82 EUR' },

  { id: 'totalExpenses', label: 'Total gastos', sampleValue: '120,10 EUR' },
  { id: 'iban', label: 'IBAN', sampleValue: 'ES7600190020961234567890' },
  { id: 'email', label: 'Correo', sampleValue: 'arbitro@example.com' },

  { id: 'signatureInterested', label: 'Firma interesado', sampleValue: 'Firma' },
  { id: 'attachmentsOriginalTicketsChecked', label: 'Check billetes originales', sampleValue: 'X' },
  { id: 'attachmentsHotelInvoiceChecked', label: 'Check factura hotel', sampleValue: 'X' },
  { id: 'attachmentsOtherChecked', label: 'Check otros justificantes', sampleValue: 'X' },
]
