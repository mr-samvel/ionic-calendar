import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-change-period',
  templateUrl: './change-period.page.html',
  styleUrls: ['./change-period.page.scss'],
})
export class ChangePeriodPage implements OnInit {
  ev: { startTime: Date, endTime: Date };
  strEvent: { strStartTime: string, strEndTime: string };

  menuCollapse: boolean = true;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.strEvent = {
      strStartTime: this.ev.startTime.toISOString(),
      strEndTime: this.ev.endTime.toISOString()
    };
  }

  validate() {
    return new Date(this.strEvent.strStartTime).getTime() < new Date(this.strEvent.strEndTime).getTime();
  }

  collapse() {
    this.menuCollapse = !this.menuCollapse;
  }

  closeModal(command) {
    if (command == 'update') {
      this.ev.startTime = new Date(this.strEvent.strStartTime);
      this.ev.endTime = new Date(this.strEvent.strEndTime);
    }
    this.modalController.dismiss({ 
      command: command,
      ev: this.ev
    });
  }

}
