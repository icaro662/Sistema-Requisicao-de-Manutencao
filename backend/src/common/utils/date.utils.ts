export function isWithinDays(date: Date, days: number): boolean {
  const age = Date.now() - date.getTime();
  return age >= 0 && age <= days * 24 * 60 * 60 * 1000;
}
