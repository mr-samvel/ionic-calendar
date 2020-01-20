import { IEvent } from 'ionic2-calendar/calendar';

export class EventModel implements IEvent {
    // Esses atributos implementam a interface IEvent -> essencial para o funcionamento do calendario
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
    professional: string;
    startTime: Date;
    endTime: Date;
    modality: string;
    students: Array<string>;
    studentQt: number;

    constructor(prof: string, start: Date, end: Date, modality: string, students: Array<string>, studentQt: number) {
        this.professional = prof;
        this.startTime = start;
        this.endTime = end;
        this.modality = modality;
        this.students = students;
        this.studentQt = studentQt;
     }
}