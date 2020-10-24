import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/_models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public getAll(): Observable<User[]> {
    return this.http.get<any>(`${environment.apiUrl}/users`).pipe(
      map(data => {
        data.map((user: any) => new User().deserialize(user))
        return data;
      })
    );
  }
  
}
