import { UUID } from 'node:crypto';

interface CompanyProps {
  id: UUID;
  name: string;
}

export class Company {
  private props: CompanyProps;

  constructor(props: CompanyProps){
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }
}