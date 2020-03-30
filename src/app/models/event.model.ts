import { IEvent } from 'ionic2-calendar/calendar';
import { ProfessionalModel } from './professional.model';
import { ModalityModel } from './modality.model';
import { StudentModel } from './student.model';

export class EventModel implements IEvent {
    // Esses atributos implementam a interface IEvent do componente ionic2-calendar
    title: string;
    startTime: Date;
    endTime: Date;
    allDay: boolean;

    constructor(title: string, startTime: Date, endTime: Date, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
    }
}

export class ClassModel {
    professional: ProfessionalModel;
    startTime: Date;
    endTime: Date;
    modality: ModalityModel;
    students: Array<StudentModel>;
    studentQt: number;

    constructor(prof: ProfessionalModel, start: Date, end: Date, modality: ModalityModel, students: StudentModel[], studentQt: number) {
        this.professional = prof;
        this.startTime = start;
        this.endTime = end;
        this.modality = modality;
        this.students = students;
        this.studentQt = studentQt;
     }
}

export class DBClassTemplate {
    uid: string;
    professional: ProfessionalModel; // trocar por UID
    modality: ModalityModel; // trocar por UID
    students: Array<StudentModel>; // trocar por UID
    studentQt: number;
    startDate: Date;
    endDate: Date; // sempre vai ser sabado (dia 6)
    startTime: string; // Date.toTimeString()::'hh:mm:ss GMT-0300'
    endTime: string;
    weekday: Array<boolean> = new Array(7);

    constructor(pro: ProfessionalModel, mod: ModalityModel, studs: Array<StudentModel>, studQt: number,
            stDate: Date, endDate: Date, stTime: string, 
            endTime: string, wkday: Array<boolean>, uid?: string) {
        this.professional = pro;
        this.modality = mod;
        this.students = studs;
        this.studentQt = studQt;
        this.startDate = stDate;
        this.endDate = endDate;
        this.startTime = stTime;
        this.endTime = endTime;
        this.weekday = wkday;
        this.uid = uid;
    }
}