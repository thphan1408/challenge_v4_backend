import { Timestamp } from 'firebase-admin/firestore';

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}