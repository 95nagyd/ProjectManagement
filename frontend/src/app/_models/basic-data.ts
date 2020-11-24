import { Guid } from "guid-typescript";

export class BasicElement {
    _id: string;
    name: string;
    tempId?: Guid;

    constructor(data?: BasicElement, isReadOnly?: boolean) {
        data = data || <BasicElement>{};

        this._id = data._id || '-1';
        this.name = data.name || '';
        if (data && !isReadOnly) {
            this.tempId = data.tempId || Guid.create();
        }
    }
}


export enum BasicDataType {
    PROJECT = 'projects',
    DESIGN_PHASE = 'designPhases',
    STRUCTURAL_ELEMENT = 'structuralElements',
    SUBTASK = 'subtasks'
}