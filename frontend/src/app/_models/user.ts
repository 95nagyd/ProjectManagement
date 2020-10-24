import { Deserializable } from './deserializable';
import { Role } from "./role";

export class User implements Deserializable {

    id: number;
    title: string;
    lastName: string;
    middleName: string;
    firstName: string;
    role: Role;

    deserialize(input: any): this {
        Object.assign(this, input);
        
        //this.cars = input.cars.map(car => new Car().deserialize(car));
        return this;
    }

    public get fullName() {
        return (
            (this.title ? this.title + '. ' : '') + 
            this.lastName + ' ' + 
            (this.middleName ? this.middleName + ' ' : '') +
            this.firstName
        );
    }
}
