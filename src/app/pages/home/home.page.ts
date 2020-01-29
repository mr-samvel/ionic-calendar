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

  goToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  isLogged(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  getUsername(): string {
    return this.userContainerService.getUsername();
  }

  logoff() {
    this.authenticationService.logoff();
  }
}
