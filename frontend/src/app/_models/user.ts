import { Role } from "./role";


export class User {

    _id: string;
    username: string;
    password: string;
    title: string;
    lastName: string;
    middleName: string;
    firstName: string;
    role: Role;

    telephone: string;
    email: string;
    

    constructor(data?: User) {
        data = data || <User>{};

        this._id = data._id || '-1';
        this.username = data.username || '';
        this.password = data.password || '';
        this.title = data.title || '';
        this.lastName = data.lastName || '';
        this.middleName = data.middleName || '';
        this.firstName = data.firstName || '';
        this.role = data.role || Role.USER;
        this.telephone = data.telephone || '';
        this.email = data.email || '';
    }
}