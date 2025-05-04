import { UUID } from 'node:crypto';

interface CategoryProps {
  id: UUID;
  name: string;
  description: null | string;
  user: string;
  companyId: UUID;
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

  get companyId() {
    return this.props.companyId;
  }
}