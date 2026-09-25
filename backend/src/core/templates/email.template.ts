export function requisitionEmailTemplate(number: string, status: string): string {
  return `Requisition ${number} status: ${status}`;
}
