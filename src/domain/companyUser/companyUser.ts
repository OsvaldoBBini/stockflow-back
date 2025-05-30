import { UUID } from 'node:crypto';

export type IRole = 'ADMIN' | 'VIEW' | 'WRITE'

interface CompanyUserProps {
  userId: UUID;
  companyId: UUID;
  role: IRole;
}

export class CompanyUser {
  private props: CompanyUserProps;

  constructor(props: CompanyUserProps){
    this.props = props;
  }

  get userId() {
    return this.props.userId;
  }

  get companyId() {
    return this.props.companyId;
  }

  get role() {
    return this.props.role;
  }
}