import { db } from '@/configs/firebase.config';
import {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { BaseEntity } from '../entities/base.entity';

export abstract class BaseRepository<T extends BaseEntity> {
  protected collection: CollectionReference<DocumentData>;

  constructor(collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const now = Timestamp.now();

    const docRef = this.collection.doc();

    const newDoc = {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    } as T;

    await docRef.set(newDoc);
    return newDoc;
  }

  async findById(id: string): Promise<T | null> {
    const doc: DocumentSnapshot = await this.collection.doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }

  async findByField(field: string, value: any): Promise<T[]> {
    const snapshot = await this.collection.where(field, '==', value).get();
    return snapshot.docs.map((doc) => doc.data() as T);
  }

  async findAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => doc.data() as T);
  }

  async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T | null> {
    const docRef = this.collection.doc(id);

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      return false;
    }
  }
}
