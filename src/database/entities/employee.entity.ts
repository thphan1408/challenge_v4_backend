import { BaseEntity } from './base.entity';

export interface EmployeeEntity extends BaseEntity {
  name?: string;
  email: string;
  department?: string;
}
