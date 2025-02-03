import { IUnity } from '../unity/unity';

interface IProductProps {
  name: string;
  company: string;
  cost: number;
  quatity: number;
  date: string;
  unity: IUnity;
  category: string;
}

export class Product {
  private props: IProductProps;

  constructor(props: IProductProps){
    this.props = props;
  }

  get name() {
    return this.props.name;
  }

  get company() {
    return this.props.company;
  }

  get cost() {
    return this.props.cost;
  }

  get quantity() {
    return this.props.quatity;
  }

  get date() {
    return this.props.date;
  }

  get unity() {
    return this.props.unity;
  }

  get category() {
    return this.props.category;
  }

} 