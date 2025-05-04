export function createExpirationDate(days: number) {
  
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return expirationDate;
}