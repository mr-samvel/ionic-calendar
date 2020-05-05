import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: UserModel;

  constructor(private afs: AngularFirestore) { }

  storeCurrentUser(user: UserModel) {
    this.currentUser = user;
  }

  retrieveUserFromServer(uid) {
    const snapshot = this.afs.collection<UserModel>('Users').doc(uid).get();
    return snapshot.toPromise().then(data => {
      return {
        uid: data.id,
        ...data.data()
      } as UserModel
    });//.catch(() => { return null; });
  }

  deleteCurrentUser() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUsername(): string {
    return this.currentUser.username;
  }
}
