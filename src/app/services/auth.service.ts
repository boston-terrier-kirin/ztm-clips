import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import User from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<Partial<User>>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.usersCollection = this.firestore.collection('users');
    this.isAuthenticated$ = this.auth.user.pipe(map((user) => !!user));
  }

  public async createUser(userData: User) {
    // ユーザを作った時点でIndexedDBにtokenが格納されて、次回以降のリクエストは自動的にtokenがセットされる仕組みのよう。
    const userCredential = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    if (!userCredential.user) {
      throw new Error('User creation faild.');
    }

    // usersのキーがuidと同じ値になるようにする。
    await this.usersCollection.doc(userCredential.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCredential.user.updateProfile({
      displayName: userData.name,
    });
  }
}
