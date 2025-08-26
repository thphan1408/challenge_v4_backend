import { db } from '@/configs/firebase.config';
import { Timestamp } from 'firebase-admin/firestore';
import { BaseRepository } from './base.repository';
import { OwnerEntity } from '../entities/owner.entity';
import { AccessCodeEntity } from '../entities/access-code.entity';

export class OwnerRepository extends BaseRepository<OwnerEntity> {
  private accessCodeCollection;

  constructor() {
    super('owners');
    this.accessCodeCollection = db.collection('access_codes');
  }

  async validateAndMarkAccessCodeAsUsed(
    phoneNumber: string,
    accessCode: string,
    type:  'email' | 'phone' = 'phone',
  ): Promise<void> {
    const snapshot = await this.accessCodeCollection
      .where('phoneNumber', '==', phoneNumber)
      .where('accessCode', '==', accessCode)
      .where('type', '==', type)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error('Access code not found');

    const doc = snapshot.docs[0];
    const data = doc.data() as AccessCodeEntity;

    if (data.isUsed) {
      throw new Error('Access code has already been used');
    }

    if (data.expiresAt.toDate() < new Date()) {
      throw new Error('Access code has expired');
    }

    await this.accessCodeCollection
      .doc(doc.id)
      .update({ isUsed: true, accessCode: '', updatedAt: Timestamp.now() });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<OwnerEntity | null> {
    const owners = await this.findByField('phoneNumber', phoneNumber);
    return owners.length > 0 ? owners[0] : null;
  }

  async findActiveOwners(): Promise<OwnerEntity[]> {
    return this.findByField('isActive', true);
  }

  async saveAccessCode(
    phoneNumber: string,
    accessCode: string,
    type: 'email' | 'phone',
  ): Promise<void> {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));

    const accessCodeEntity: AccessCodeEntity = {
      id: this.accessCodeCollection.doc().id,
      phoneNumber,
      accessCode,
      expiresAt,
      isUsed: false,
      type,
      createdAt: now,
      updatedAt: now,
    };

    await this.accessCodeCollection.doc(accessCodeEntity.id).set(accessCodeEntity);
  }
}
