import { Injectable } from '@angular/core';
import { UserContainerService } from './user-container.service';
import { UserModel } from '../models/user-model';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private isLogged: boolean = false;

  constructor(private userContainerService: UserContainerService, private navCtrl: NavController) { }

  logUser(user: UserModel) {
    if(user){
      this.userContainerService.storeUser(user);
      this.isLogged = true;
      this.navCtrl.navigateRoot('/tabs/tab1');
    }
  }

  logoff() {
    this.isLogged = false;
  }

  isLoggedIn(): boolean {
    return this.isLogged;
  }

}
