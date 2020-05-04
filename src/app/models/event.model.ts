import { IEvent } from 'ionic2-calendar/calendar';
import { ModalityModel } from './modality.model';
import * as firebase from 'firebase';
import { UserModel } from './user.model';

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
    uid: string;
    professional: UserModel;
    startTime: Date;
    endTime: Date;
    modality: ModalityModel;
    students: Array<UserModel>;
    studentQt: number;

    constructor(uid: string, prof: UserModel, start: Date, end: Date, modality: ModalityModel, students: UserModel[], studentQt: number) {
        this.uid = uid;
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
    professionalUID: string; // UID
    modalityUID: string; // UID
    studentQt: number;
    startDate: firebase.firestore.Timestamp; // o Firebase armazena em Timpestamp
    endDate: firebase.firestore.Timestamp; // sempre vai ser sabado (dia de numero 6)
    startTime: string; // Date.toTimeString()::'hh:mm:ss GMT-0300'
    endTime: string;
    weekday: Array<boolean> = new Array(7);
    exceptionDays: firebase.firestore.Timestamp[];

    constructor(pro: UserModel, mod: ModalityModel, studQt: number,
            stDate: Date, endDate: Date, stTime: string, 
            endTime: string, wkday: Array<boolean>, uid: string,
            exceptionDays: Date[]) {
        this.professionalUID = pro.uid;
        this.modalityUID = mod.uid;
        this.studentQt = studQt;
        this.startDate = firebase.firestore.Timestamp.fromDate(stDate);
        this.endDate = firebase.firestore.Timestamp.fromDate(endDate);
        this.startTime = stTime;
        this.endTime = endTime;
        this.weekday = wkday;
        this.uid = uid;
        if (exceptionDays) {
            this.exceptionDays = new Array();
            exceptionDays.forEach(d => {
                this.exceptionDays.push(firebase.firestore.Timestamp.fromDate(d));
            });
        } else
            this.exceptionDays = null;
            
    }
}