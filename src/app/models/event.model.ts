import { BehaviorSubject } from 'rxjs';

export class EventModel {
    title: string;
    startTime: Date; 
    endTime: Date;
    strStartTime: string; // Date em formato ISO8601
    strEndTime: string; // Date em formato ISO8601
    allDay: boolean;

    constructor(title: string, startTime: Date, endTime: Date, strStart: string, strEnd: string, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.strStartTime = strStart;
        this.strEndTime = strEnd;
        this.allDay = allDay;
    }
 }