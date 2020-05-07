import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import { NavController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userState: boolean;
  private usersRef: AngularFirestoreCollection<UserModel>;
  private recentlyLoggedIn: boolean = false;

  constructor(private userService: UserService, private navCtrl: NavController, private afAuth: AngularFireAuth,
    private afStore: AngularFirestore, private loadingController: LoadingController) {
      this.usersRef = this.afStore.collection<UserModel>('Users');
      this.monitorUserStateChanges();
  }
  
  private async presentLoader() {
    (await this.loadingController.create({message: 'Autenticando...'})).present();
  }
  private dismissLoader() {
    this.loadingController.getTop().then(loader => loader.dismiss());
  }

  private monitorUserStateChanges() {
    this.afAuth.authState.subscribe(async (user: User) => {
      if (user) {
        this.userState = true;
        if (!this.recentlyLoggedIn) {
          this.presentLoader();
          let dbUser = await this.userService.retrieveUserFromServer(user.uid);
          this.userService.storeCurrentUser(dbUser);
          this.dismissLoader();
        }
      } else {
        this.userState = false;
        this.userService.deleteCurrentUser();
      }
    });
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then((userCredential: auth.UserCredential) => {
      let username = userCredential.user.displayName;
      let uid = userCredential.user.uid;
      let email = userCredential.user.email;
      let user = new UserModel(username, uid, [UserModel.STUDENT_PROFILE], email);
      this.userService.storeCurrentUser(user);
      this.usersRef.doc(uid).get().toPromise().then(snap => {
        let retrievedUser: UserModel = {uid: snap.id, ...snap.data()} as UserModel;
        let clone = Object.assign({}, user);
        delete clone.uid;
        if (!snap.exists) {
          this.usersRef.doc(uid).set(clone);
        }
      });
      this.recentlyLoggedIn = true;
      this.navCtrl.navigateRoot('/tabs/tab1');
    });
  }

  logoff() {
    this.afAuth.auth.signOut();
  }

  isLoggedIn(): boolean {
    return this.userState;
  }

}
