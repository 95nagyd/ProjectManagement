import { Injectable } from '@angular/core';
import { CalendarData, CalendarDayData } from '@app/_models/calendar';


@Injectable({
  providedIn: 'root'
})
export class WorkingTimeCalendarService {

  private calendarViewData: CalendarData;

  constructor() { 
    this.calendarViewData = {};
  }

  //majd dao-s getcalendardata api hívással
  getCalendarDataDataAccessOperation(chosenPeriod: Date){

    let test: CalendarData = {
      1 : [
        {
          workingTime:'01:00',
          project:'Project1',
          designPhase:'DesignPhase1',
          structuralElement:'StructuralElement1',
          subtask:'Subtask1',
          comment:'Comment1'
        },
        {
          workingTime:'02:00',
          project:'Project2',
          designPhase:'DesignPhase2',
          structuralElement:'StructuralElement2',
          subtask:'Subtask2',
          comment:'Comment2'
        }
      ]
    }
    //console.log(JSON.parse(JSON.stringify(test)))
    //console.log(test)
    
    this.calendarViewData = {};
    this.calendarViewData = test;
    return this.calendarViewData;
  }

  getCalendarActualData(): CalendarData {
     return this.calendarViewData;
  }
  

}
