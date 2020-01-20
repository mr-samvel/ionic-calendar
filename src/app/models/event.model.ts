import { IEvent } from 'ionic2-calendar/calendar';

export class EventModel implements IEvent {
    // Esses atributos implementam a interface IEvent -> essencial para o funcionamento do calendario
    title: string;
    startTime: Date; 
    endTime: Date;
    allDay: boolean;

    // P/ novo tipo
    start: Date;
    duration: number;
    studentQt: number;
    modality: string;

    constructor(title: string, startTime: Date, endTime: Date, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
    }
 }