import { Role } from "./role";
import { User } from "./user";


export class Users {
    id: string;
    role:  Role;
    users: User[] = [];
}