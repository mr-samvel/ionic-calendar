import { IEvent } from 'ionic2-calendar/calendar';

export class EventModel implements IEvent {
    // Esses atributos implementam a interface IEvent -> essencial para o funcionamento do calendario
    title: string;
    startTime: Date; 
    endTime: Date;
    allDay: boolean;
    
    strStartTime: string; // Date em formato ISO8601
    strEndTime: string; // Date em formato ISO8601

    constructor(title: string, startTime: Date, endTime: Date, strStart: string, strEnd: string, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.strStartTime = strStart;
        this.strEndTime = strEnd;
        this.allDay = allDay;
    }
 }