import { Component, OnInit } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage implements OnInit {
  public event: ClassModel;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  async closeModal() {
    let onClosedData = 'modal fechou';
    await this.modalController.dismiss(onClosedData);
  }

}
