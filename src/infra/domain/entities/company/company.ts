export interface CompanyInterface {
  userId: string;
  companyName: string;
  role: 'owner' | 'admin' | 'user';
}