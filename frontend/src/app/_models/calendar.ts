import { BasicElement } from './basic-data';

export interface CalendarDayDetails {
  number: number;
  name: string;
}


export interface CalendarData {
  [index: string]: Array<CalendarRowData> | any[]
}



export class CalendarRowData {
  workingTime: number;
  projectId: string;
  designPhaseId: string;
  structuralElementId: string;
  subtaskId: string;
  comment: string;

  constructor(data?: CalendarRowData) {
    data = data || <CalendarRowData>{};

    this.workingTime = data.workingTime || 0;
    this.projectId = data.projectId || '';
    this.designPhaseId = data.designPhaseId || '';
    this.structuralElementId = data.structuralElementId || '';
    this.subtaskId = data.subtaskId || '';
    this.comment = data.comment || '';
  }
}
