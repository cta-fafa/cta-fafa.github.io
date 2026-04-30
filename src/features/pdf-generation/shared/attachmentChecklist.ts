import type { AttachmentChecklist, AttachmentItem } from '../../../types/expense'

export const buildAttachmentChecklist = (
  attachments: AttachmentItem[],
): AttachmentChecklist => {
  const hasTickets = attachments.some((item) => ['train', 'plane', 'bus'].includes(item.type))
  const hasHotel = attachments.some((item) => item.type === 'hotel')
  const hasOther = attachments.some((item) => ['fuel', 'toll', 'other'].includes(item.type))

  return {
    attachmentsOriginalTicketsChecked: hasTickets,
    attachmentsHotelInvoiceChecked: hasHotel,
    attachmentsOtherChecked: hasOther,
  }
}
