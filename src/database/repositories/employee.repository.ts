import { db } from '@/configs/firebase.config';
import { EmployeeEntity } from '../entities/employee.entity';
import { BaseRepository } from './base.repository';
import { Timestamp } from 'firebase-admin/firestore';
import { AccessCodeEntity } from '../entities/access-code.entity';
export class EmployeeRepository extends BaseRepository<EmployeeEntity> {
  private employeeCollection;
  private accessCodeCollection;

  constructor() {
    super('employees');
    this.employeeCollection = db.collection('employees');
    this.accessCodeCollection = db.collection('access_codes');
  }

  async findById(employeeId: string): Promise<EmployeeEntity | null> {
    const snapshot = await this.employeeCollection.where('id', '==', employeeId).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const employeeData = snapshot.docs[0].data() as EmployeeEntity;
    return employeeData;
  }

  async findByEmail(email: string): Promise<EmployeeEntity | null> {
    const snapshot = await this.employeeCollection.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const employeeData = snapshot.docs[0].data() as EmployeeEntity;
    return employeeData;
  }

  async saveEmployee(employee: EmployeeEntity): Promise<void> {
    await this.employeeCollection.doc(employee.id).set(employee);
  }

  async saveAccessCode(email: string, accessCode: string, type: 'email' | 'phone'): Promise<void> {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));

    const accessCodeEntity: AccessCodeEntity = {
      id: this.accessCodeCollection.doc().id,
      email,
      accessCode,
      expiresAt,
      isUsed: false,
      type,
      createdAt: now,
      updatedAt: now,
    };

    await this.accessCodeCollection.doc(accessCodeEntity.id).set(accessCodeEntity);
  }

  async validateAndMarkAccessCodeAsUsed(
    email: string,
    accessCode: string,
    type: 'email' | 'phone' = 'email',
  ) {
    const snapshot = await this.accessCodeCollection
      .where('email', '==', email)
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
}
