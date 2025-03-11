import { UUID } from 'node:crypto';
import { IUnity } from '../unity/unity';

interface IProductProps {
  id: UUID;
  category: string;
  company: string;
  user: string;
  name: string;
  pricePaid: number;
  unityMeasure: IUnity;
  quatity: number;
  date: string;
}

export class Product {
  private props: IProductProps;

  constructor(props: IProductProps){
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get category() {
    return this.props.category;
  }

  get company() {
    return this.props.company;
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

  get date() {
    return this.props.date;
  }

} 