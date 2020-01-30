import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationService } from './services/authentication.service';
import { UserContainerService } from './services/user-container.service';
import { CalendarService } from './services/calendar.service';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { ClassDetailsPageModule } from './pages/class-details/class-details.module';
import { NewEventFormPageModule } from './pages/new-event-form/new-event-form.module';
import { ProfessionalContainerService } from './services/professional-container.service';
import { StudentContainerService } from './services/student-container.service';
import { ModalityContainerService } from './services/modality-container.service';
import { IonicSelectableModule } from 'ionic-selectable';

registerLocaleData(ptBr);
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ClassDetailsPageModule,
    NewEventFormPageModule,
    IonicSelectableModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthenticationService,
    UserContainerService,
    ProfessionalContainerService,
    StudentContainerService,
    ModalityContainerService,
    CalendarService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'pt' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
