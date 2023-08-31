
import { Role } from './role';
import { Schedule } from './schedule';

export class User {
    id: string;
    firstName: string;
    secondName: string;
    email: string;
    function: string;
    scheduleGroup : string;
    date: Date;
}