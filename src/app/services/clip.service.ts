import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Clip } from '../models/clip.model';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<Clip>;

  constructor(private firestore: AngularFirestore) {
    this.clipsCollection = this.firestore.collection('clips');
  }

  async createClip(data: Clip) {
    await this.clipsCollection.add(data);
  }
}
