import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user-model';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user: UserModel = new UserModel('', '');

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  submitUser() {
    this.authenticationService.logUser(this.user);
  }
}
