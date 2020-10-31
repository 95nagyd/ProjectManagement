import { Injectable } from '@angular/core';
import { CalendarDayData } from '@app/_models/calendar';


@Injectable({
  providedIn: 'root'
})
export class WorkingTimeCalendarService {

  private calendarViewData: CalendarDayData[] = [];

  constructor() { 
    this.calendarViewData = [];
  }

  //majd dao-s getcalendardata api hívással
  getCalendarDataDataAccessOperation(chosenPeriod: Date){
    /*
    let fakeData = {
      "01" : [
        {
          0 : {
            workingTime:'01:00',
            project:'Project1',
            designPhase:'DesignPhase1',
            structuralElement:'StructuralElement1',
            subtask:'',
            comment:''
          }
        }
      ],
      "02" : [
        {
          0 : {
            workingTime:'02:00',
            project:'Project2',
            designPhase:'DesignPhase2',
            structuralElement:'StructuralElement2',
            subtask:'',
            comment:''
          }
        }
      ]
    }
    */
    //console.log(fakeData)
    this.calendarViewData = [];
     return this.calendarViewData;
  }

  getCalendarActualData(): CalendarDayData[]{
     return this.calendarViewData;
  }
  

}
