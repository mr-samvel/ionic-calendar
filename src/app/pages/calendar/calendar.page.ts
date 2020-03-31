import { Component, OnInit, ViewChild, Inject, LOCALE_ID, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { ClassModel } from 'src/app/models/event.model';
import { ModalController } from '@ionic/angular';
import { NewEventFormPage } from '../new-event-form/new-event-form.page';
import { AlocateStudentsPage } from '../alocate-students/alocate-students.page';
import { ClassDetailsPage } from '../class-details/class-details.page';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarPage implements AfterViewInit {
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public bgColor: string = '#3a87ad';
  public eventSource: Array<ClassModel>;

  constructor(private calendarService: CalendarService, private modalController: ModalController) { }

  ngAfterViewInit() {
    this.subscribeToEventChange();
  }

  private subscribeToEventChange() {
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      this.eventSource = eventSrc;
      this.calendarComponent.loadEvents();
    });
  }

  private randomColorHex():string {
    let c = "#" + (Math.random().toString(16) + "000000").slice(2, 8);
    console.log(c);
    return c;
  }

  private async showClassDetailsModal(event: ClassModel) {
    const modal = await this.modalController.create({
      component: ClassDetailsPage,
      componentProps: {
        'event': event
      }
    });
    modal.onDidDismiss().then((returnedData) => {
      console.log(returnedData);
    });
    return await modal.present();
  }

  async addEventModal() {
    const modal = await this.modalController.create({
      component: NewEventFormPage
    });
    return await modal.present();
  }

  async alocateStudentsModal() {
    const modal = await this.modalController.create({
      component: AlocateStudentsPage
    });
    return await modal.present();
  }

  onEventSelected(event) {
    this.showClassDetailsModal(event);
  }
}
