import { BaseEntity } from './base.entity';
import { Timestamp } from 'firebase-admin/firestore';

export interface AccessCodeEntity extends BaseEntity {
  email?: string;
  phoneNumber?: string;
  accessCode: string;
  expiresAt: Timestamp;
  isUsed: boolean;
  type: 'email' | 'phone';
}
