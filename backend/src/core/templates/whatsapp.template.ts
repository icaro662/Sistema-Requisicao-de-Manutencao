export function requisitionWhatsappTemplate(number: string, status: string): string {
  return `Maintenance requisition ${number}: ${status}`;
}
