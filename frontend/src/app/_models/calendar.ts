export interface CalendarDayDetails {
  number: number;
  name: string;
  backgroundColor: string;
}


export interface CalendarData {
  [index: number] : CalendarDayData[] | any[]
}


export class CalendarDayData {
  workingTime: string;
  project: string;
  designPhase: string;
  structuralElement: string;
  subtask: string;
  comment: string;

  constructor(data?: CalendarDayData) {
    data = data || <CalendarDayData>{};

    this.workingTime = data.workingTime || '00:00';
    this.project = data.project || '';
    this.designPhase = data.designPhase || '';
    this.structuralElement = data.structuralElement || '';
    this.subtask = data.subtask || '';
    this.comment = data.comment || '';
  }
}
