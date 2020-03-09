import { Injectable } from '@angular/core';
import { UserContainerService } from './user-container.service';
import { UserModel } from '../models/user.model';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private user: User;

  constructor(private userContainerService: UserContainerService, private navCtrl: NavController, private afAuth: AngularFireAuth) {
    this.monitorUserChanges();
   }

  private monitorUserChanges() {
    this.afAuth.authState.subscribe((user: User) => {
      this.user = user;
      console.log('user changed:', this.user);
    });
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then((userCredential: auth.UserCredential) => {
      // store on container
      this.navCtrl.navigateRoot('/tabs/tab1');
    });
  }

  logoff() {
    this.afAuth.auth.signOut();
  }

  isLoggedIn(): boolean {
    if (this.user) 
      return true;
    return false;
  }

}
