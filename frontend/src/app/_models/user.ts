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

export const UserRegexPatterns: Record<string, RegExp> = {
    'username': new RegExp('^[a-zA-Z0-9]*$'),
    'password': new RegExp('^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐUÚÜŰ@$!%*#?&]*$'),
    'title': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
    'lastname': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
    'middlename': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
    'firstname': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
    'telephone': new RegExp('^(?=.{14,15}$)\\+36 (\\d{2}) (\\d{3}) (\\d{3,4})$'),
    'email': new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
};