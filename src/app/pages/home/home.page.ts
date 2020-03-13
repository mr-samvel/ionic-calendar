import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserModel } from 'src/app/models/user.model';
import { UserContainerService } from 'src/app/services/user-container.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private authenticationService: AuthenticationService, private userContainerService: UserContainerService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  googleLogin() {
    this.authenticationService.googleLogin();
  }

  isLogged(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  getUsername(): string {
    if(this.userContainerService.getCurrentUser())
      return this.userContainerService.getUsername();
  }

  logoff() {
    this.authenticationService.logoff();
  }
}
