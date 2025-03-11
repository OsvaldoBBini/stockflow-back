import { UUID } from 'node:crypto';

interface CategoryProps {
  id: UUID;
  name: string;
  description: null | string;
  user: string;
  company: string;
}

export class Category {
  private props: CategoryProps;

  constructor(props: CategoryProps){
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get user() {
    return this.props.user;
  }

  get company() {
    return this.props.company;
  }
}