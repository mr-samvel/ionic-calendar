import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private authenticationService: AuthenticationService, private userService: UserService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  googleLogin() {
    this.authenticationService.googleLogin();
  }

  isLogged(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  getUsername(): string {
    if(this.userService.getCurrentUser())
      return this.userService.getUsername();
  }

  logoff() {
    this.authenticationService.logoff();
  }
}
