import { Component, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CalendarService } from 'src/app/services/calendar.service';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ClassModel } from 'src/app/models/event.model';
import { ProfessionalContainerService } from 'src/app/services/professional-container.service';
import { ModalityContainerService } from 'src/app/services/modality-container.service';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-alocate-students',
  templateUrl: './alocate-students.page.html',
  styleUrls: ['./alocate-students.page.scss'],
})
export class AlocateStudentsPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  private events: Map<ClassModel, boolean> = new Map();
  private eventsRep: Array<{uid: string, dayRep: Date, weekdayRep: number, exceptions: Date[]}> = new Array();
  public filteredEvents: Array<ClassModel>;

  public collapseStudents: boolean;
  public collapseFilters: boolean;

  public selectedStudents: Array<UserModel>;

  public currentDate: Date = new Date();
  public viewTitle: string = '';

  public loaded: boolean = false;

  constructor(private modalController: ModalController, private calendarService: CalendarService,
    private studentsContainer: StudentContainerService, private professionalsContainer: ProfessionalContainerService,
    private modalitiesContainer: ModalityContainerService,
    private toastController: ToastController, private alertController: AlertController) {
    this.resetAll();
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      this.filteredEvents = eventSrc;
      for (let i in eventSrc) {
        this.events.set(eventSrc[i], false);
      }
    });
  }

  async ngAfterViewInit() {
    this.selectableComponentQuery._results.forEach((selectableComponent: IonicSelectableComponent) => {
      selectableComponent.clearButtonText = "Limpar";
      selectableComponent.searchPlaceholder = "Procurar";
      selectableComponent.closeButtonText = "Cancelar";
      selectableComponent.addButtonText = "Novo";
    });

    // Sim. Isso ta horrivel, mas é o que funciona kkkk 
    // Boa sorte tentando resolver.
    // Adicione aqui cada hora gasta:
    //   4 horas
    await this.timeout(1000);
    this.loaded = true;
    await this.timeout(500);
    this.calendarComponent.loadEvents();
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color
    });
    return toast.present();
  }


  resetAll() {
    this.collapseStudents = true;
    this.collapseFilters = true;
    this.selectedStudents = new Array();
  }

  changeTitle(title) {
    this.viewTitle = title;
  }

  addStudent(email: string) {
    this.studentsContainer.addStudent(email);
  }

  validateStudentSelectable() {
    let error: boolean = false;
    this.events.forEach((value: boolean, ev: ClassModel) => {
      if (value) {
        if (this.selectedStudents.length > (ev.studentQt - ev.students.length)) {
          error = true;
          this.events.set(ev, false);
        }
      }
    });
    if (error)
      this.presentToast('Os eventos que ficariam superlotados foram desmarcados', 'warning');
  }

  isSelected(ev: ClassModel) {
    return this.events.get(ev);
  }

  filterByPro(pro: string) {
    if (pro) {
      pro = pro.trim();
      this.events.forEach((value: boolean, key: ClassModel) => {
        if (pro != key.professional.username) {
          console.log(pro, '!=', key.professional.username);
          this.filteredEvents.splice(this.filteredEvents.indexOf(key), 1);
        }
      });
    }
  }

  filterByMod(mod: string) {
    if (mod) {
      mod = mod.trim();
      this.events.forEach((value: boolean, key: ClassModel) => {
        if (mod != key.modality.name)
          this.filteredEvents.splice(this.filteredEvents.indexOf(key), 1);
      });
    }
  }

  applyFilters(pro: string, mod: string) {
    this.filterByPro(pro);
    this.filterByMod(mod);
    this.calendarComponent.loadEvents();
  }

  clearFilters() {
    this.filteredEvents = Array.from(this.events.keys());
    this.calendarComponent.loadEvents();
  }

  private async selectClasses(ev: ClassModel) {
    const alert = await this.alertController.create({
      header: 'Adicionar às aulas?',
      message: `Selecionar todas as aulas de ${ev.modality.name}, 
        do(a) profissional ${ev.professional.username}, às ${ev.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${ev.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.events.set(ev, true);
            this.eventsRep.push({uid: ev.uid, dayRep: ev.startTime, weekdayRep: null, exceptions: []});
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.events.forEach((value: boolean, key: ClassModel) => {
              let vDate = ev.startTime.getDay() == key.startTime.getDay();
              let vUID = ev.uid == key.uid;
              if (vDate && vUID)
                this.events.set(key, true);
            });
            this.eventsRep.push({uid: ev.uid, dayRep: null, weekdayRep: ev.startTime.getDay(), exceptions: []});
          }
        }
      ]
    });
    await alert.present();
  }

  private async deselectClasses(ev: ClassModel) {
    const alert = await this.alertController.create({
      header: 'Desselecionar as aulas?',
      message: `Desselecionar todas as aulas de ${ev.modality.name}, 
        do(a) profissional ${ev.professional.username}, às ${ev.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${ev.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.events.set(ev, false);
            let i = this.eventsRep.findIndex(e => e.uid == ev.uid && (e.dayRep == ev.startTime || e.weekdayRep == ev.startTime.getDay()));
            if (this.eventsRep[i].weekdayRep)
              this.eventsRep[i].exceptions.push(ev.startTime);
            else if (this.eventsRep[i].dayRep)
              this.eventsRep.splice(i, 1);
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.events.forEach((value: boolean, key: ClassModel) => {
              let vDate = ev.startTime.getDay() == key.startTime.getDay();
              let vUID = ev.uid == key.uid;
              if (vDate && vUID)
                this.events.set(key, false);
            });
            let i = this.eventsRep.findIndex(e => e.uid == ev.uid && (e.dayRep == ev.startTime || e.weekdayRep == ev.startTime.getDay()));
            this.eventsRep.splice(i, 1);
          }
        }
      ]
    });
    await alert.present();
  }

  async onEventSelected(ev: ClassModel) {
    if (!this.events.get(ev)) {
      if (this.selectedStudents.length <= (ev.studentQt - ev.students.length)) {
        return this.selectClasses(ev);
      } else {
        this.presentToast('Erro: mais alunos do que o máximo', 'danger');
      }
    } else
      return this.deselectClasses(ev);
  }

  submit() {
    for (let sendEvent of this.eventsRep) {
      let exc = null;
      if (sendEvent.exceptions.length > 0)
        exc = sendEvent.exceptions;
      this.calendarService.addStudentsToClasses(this.selectedStudents, sendEvent.uid, sendEvent.dayRep, sendEvent.weekdayRep, exc);
    }
    this.resetAll();
    this.presentToast('Feito!', 'success');
    this.closeModal();
  }
}
