import { IEvent } from 'ionic2-calendar/calendar';
import { ModalityModel } from './modality.model';
import * as firebase from 'firebase';
import { UserModel } from './user.model';

// Essa classe implementa a interface IEvent do componente ionic2-calendar
export class EventModel implements IEvent {
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

// Essa classe implementa os eventos "locais" que são gerados a partir da tradução de DBClassTemplate
export class ClassModel {
    uid: string; // id que adquire na tradução do DBClassTemplate
    professional: UserModel; // profissional assinalado a aula através da tradução de DBClassTemplate
    startTime: Date; // Date de início da aula
    endTime: Date; // Date de término da aula
    modality: ModalityModel; // modalidade assinalada a aula através da tradução de DBClassTemplate
    students: Array<UserModel>; // estudantes assinalados a aula através da tradução de StudentClassModel
    studentQt: number; // quantidade máxima de estudantes na aula

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

// Essa classe armazena no servidor as regras p/ gerar as aulas.
export class DBClassTemplate {
    uid: string; // id unico gerado pelo firebase p/ armazenamento
    professionalUID: string; // uid do profissional encarregado pela aula
    modalityUID: string; // uid da modalidade assinalada a aula
    studentQt: number; // quantidade máxima de estudantes por aula
    startDate: firebase.firestore.Timestamp; // dia de início em que as aulas descritas por essa classe devem ser geradas
    endDate: firebase.firestore.Timestamp; // marca a ultima semana em que as aulas devem ser geradas; endDate sempre deve ser sabado (dia de numero 6)
    startTime: string; // marca o horário de início das aulas que devem ser geradas; Date.toTimeString()::'hh:mm:ss GMT-0300'
    endTime: string; // marca o horário de término das aulas que devem ser geradas
    weekday: Array<boolean> = new Array(7); // marca em que dias da semana as aulas devem ser geradas
    exceptionDays: firebase.firestore.Timestamp[]; // marca os dias em que as aulas não devem ser geradas

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