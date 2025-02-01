interface IProductProps {
  name: string;
}

export class Product {
  private props: IProductProps;

  constructor(props: IProductProps){
    this.props = props;
  }

  get name() {
    return this.props.name;
  }

} 