import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Clip } from '../models/clip.model';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<Clip>;

  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private fireStorage: AngularFireStorage
  ) {
    this.clipsCollection = this.firestore.collection('clips');
  }

  createClip(data: Clip): Promise<DocumentReference<Clip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.fireAuth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<Clip>).docs)
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  async deleteClip(clip: Clip) {
    const clipRef = this.fireStorage.ref(`clips/${clip.fileName}`);
    const screenShotRef = this.fireStorage.ref(
      `screenShots/${clip.screenShotFileName}`
    );

    await clipRef.delete();
    await screenShotRef.delete();

    await this.clipsCollection.doc(clip.docId).delete();
  }
}
