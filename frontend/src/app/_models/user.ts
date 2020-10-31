import { Role } from "./role";


export class User {

    id: number;
    title: string;
    lastName: string;
    middleName: string;
    firstName: string;
    role: Role;

    constructor(data?: User) {
        data = data || <User>{};

        this.id = data.id || -1;
        this.title = data.title || '';
        this.lastName = data.lastName || '';
        this.middleName = data.middleName || '';
        this.firstName = data.firstName || '';
        this.role = data.role || Role.User;
    }
}