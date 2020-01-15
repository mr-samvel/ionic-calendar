export class EventModel {
    title: string;
    startTime: Date; // recebe ISO nao sei das quantas ou Date
    endTime: Date; // recebe ISO nao sei das quantas ou Date
    allDay: boolean;

    constructor(title: string, startTime: Date, endTime: Date, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
    }
}