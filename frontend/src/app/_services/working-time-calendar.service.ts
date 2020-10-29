import { Injectable } from '@angular/core';
import { CalendarDayData } from '@app/_models/calendarDayData';


@Injectable({
  providedIn: 'root'
})
export class WorkingTimeCalendarService {

  private calendarViewData: CalendarDayData[] = [];

  constructor() { 
    this.calendarViewData = [];
  }

  //majd dao-s getcalendardata api hívással
  getCalendarDataDataAccessOperation(choosenPeriod: Date){
    this.calendarViewData["01"] = [
      {
        workingTime:'01:00',
        project:'asdasd',
        designPhase:'izébizé'
      }
    ];
     return this.calendarViewData;
  }

  getCalendarActualData(): CalendarDayData[]{
     return this.calendarViewData;
  }
  

}
