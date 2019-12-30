import { Injectable } from '@angular/core';
import { UserModel } from '../models/user-model';

@Injectable({
  providedIn: 'root'
})
export class UserContainerService {
  private currentUser: UserModel;

  constructor() { }

  storeUser(user: UserModel) {
    this.currentUser = user;
  }

  getUsername(): string {
    return this.currentUser.username;
  }
}
