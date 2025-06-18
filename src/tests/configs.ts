import { randomUUID } from 'node:crypto';
import { IUnity } from '../domain/unity/unity';
import { createExpirationDate } from './utils/createExpirationDate';

export const successMockProduct = {
  id: randomUUID(),
  categoryId: randomUUID(),
  companyId: randomUUID(),
  name: 'test-name',
  userId: randomUUID(),
  pricePaid: 30,
  quatity: 1,
  unityMeasure: 'kg' as IUnity,
  entryDate: new Date(),
  expirationDate: createExpirationDate(1),
};

export const errorMockProduct = {
  id: randomUUID(),
  categoryId: randomUUID(),
  companyId: randomUUID(),
  name: 'test-name',
  userId: randomUUID(),
  pricePaid: 30,
  quatity: 1,
  unityMeasure: 'kg' as IUnity,
  entryDate: new Date(),
  expirationDate: createExpirationDate(-1),
};