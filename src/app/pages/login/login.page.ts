import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  // user: UserModel = new UserModel('', '');

  constructor(private authenticationService: AuthenticationService, private afAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  googleLogin() {
    this.authenticationService.googleLogin();
  }

  // submitUser() {
  //   this.authenticationService.logUser(this.user);
  // }
}
