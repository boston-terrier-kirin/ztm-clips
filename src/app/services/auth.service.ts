import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import User from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<Partial<User>>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.usersCollection = this.firestore.collection('users');
  }

  public async createUser(userData: User) {
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
