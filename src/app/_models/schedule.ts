export class Schedule {
    id: string;
    date: Date;
    newDate: Date;
    required: boolean;
    userAvailability: boolean;

    userFunction : string;
    scheduleGroup : string;
    newUserFunction : string;
    deleting : boolean;
}