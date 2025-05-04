import { UUID } from 'node:crypto';
import { IUnity } from '../unity/unity';

interface IProductProps {
  id: UUID;
  categoryId: UUID;
  companyId: UUID;
  user: string;
  name: string;
  pricePaid: number;
  unityMeasure: IUnity;
  quatity: number;
  entryDate: Date;
  expirationDate: Date;
}

export class Product {
  private props: IProductProps;

  constructor(props: IProductProps){
    this.props = props;

    if (props.expirationDate < props.entryDate) {
      throw new Error('Unable to record the product because the expiration date is no longer valid.');
    }

    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get categoryId() {
    return this.props.categoryId;
  }

  get companyId() {
    return this.props.companyId;
  }

  get user() {
    return this.props.user;
  }

  get name() {
    return this.props.name;
  }

  get pricePaid() {
    return this.props.pricePaid;
  }

  get unityMeasure() {
    return this.props.unityMeasure;
  }

  get quantity() {
    return this.props.quatity;
  }

  get entryDate() {
    return this.props.entryDate;
  }

  get expirationDate() {
    return this.props.expirationDate;
  }

} 