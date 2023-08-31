import { Role } from './role';
import { Schedule } from './schedule';
import { UserFunction } from './userfunction';

export class Account {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    schedules: Schedule[] = [];
    userFunctions: UserFunction[] = [];
    jwtToken?: string;
    date: Date;
    dob: Date;
    availability: boolean;
    password: string;
    confirmPassword : string
    isVerified : boolean
    isDeleting : boolean
}