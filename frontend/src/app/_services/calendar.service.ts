import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalendarData, CalendarRowData } from '@app/_models/calendar';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {


  constructor(private http: HttpClient) { 
  }



  getUserWorkingTimeByGivenPeriod(period: number, userID?: string): Observable<any> {
    const url = userID 
      ? `${environment.apiUrl}/workingTime/${userID}/${period}`
      : `${environment.apiUrl}/workingTime/${period}`
    return this.http.get<any>(url).pipe(
      map(data => {
        console.log(data)
        return data;
      })
    );
  }

  saveWorkingTime(period: number, periodData: CalendarData): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/workingTime/save/${period}`, { periodData: periodData });
  }

  getFirstSavedPeriod(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/firstPeriod`);
  }

}
