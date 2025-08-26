import { BaseEntity } from './base.entity';

export interface OwnerEntity extends BaseEntity {
  phoneNumber: string;
  fullName?: string;
  email?: string;
  isActive: boolean;
}