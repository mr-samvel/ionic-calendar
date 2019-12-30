import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private authenticationService: AuthenticationService) {}

  isLogged() {
    return this.authenticationService.isLoggedIn();
  }

}
