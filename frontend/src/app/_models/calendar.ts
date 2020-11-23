import { BasicElement } from './basic-data';

export interface CalendarDayDetails {
  number: number;
  name: string;
  backgroundColor: string;
}


export interface CalendarData {
  [index: string]: Array<CalendarRowData> | any[]
}



export class CalendarRowData {
  workingTime: string;
  projectId: string;
  designPhaseId: string;
  structuralElementId: string;
  subtaskId: string;
  comment: string;

  constructor(data?: CalendarRowData) {
    data = data || <CalendarRowData>{};

    this.workingTime = data.workingTime || '00:00';
    this.projectId = data.projectId || '';
    this.designPhaseId = data.designPhaseId || '';
    this.structuralElementId = data.structuralElementId || '';
    this.subtaskId = data.subtaskId || '';
    this.comment = data.comment || '';
  }
}
