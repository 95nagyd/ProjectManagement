import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicElement, BasicDataType } from '@app/_models/basic-data';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BasicDataService {

  constructor(private http: HttpClient) { }


  getBasicData(type: BasicDataType): Observable<BasicElement[]> {
    return this.http.get<any>(`${environment.apiUrl}/basicData/${type}`).pipe(
      map(res => {
        const data = res.map((data: any) => new BasicElement(data));
        return data;
      })
    );
  }

  getAllBasicElements() {
    return this.http.get<any>(`${environment.apiUrl}/basicData/all`).pipe(
      map(res => {
        let data: { projects: Array<BasicElement>; designPhases: Array<BasicElement>; structuralElements: Array<BasicElement>; subtasks: Array<BasicElement>; } = {
          projects : res.projects.map((data: any) => new BasicElement(data, true)),
          designPhases : res.designPhases.map((data: any) => new BasicElement(data, true)),
          structuralElements : res.structuralElements.map((data: any) => new BasicElement(data, true)),
          subtasks : res.subtasks.map((data: any) => new BasicElement(data, true))
        };
        return data;
      })
    );
  }

}
