import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '@environments/environment';
import { SpinnerService } from '@app/_services/spinner.service';
import { User } from '@app/_models/user';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class AuthenticationService {

  private readonly ACCESS_TOKEN = 'ACCESS_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private jwtHelper: JwtHelperService;
  private currentUser: User;

  constructor(private http: HttpClient, private spinner: SpinnerService, private router: Router) {
    this.jwtHelper = new JwtHelperService();
  }

  private getAccessTokenPayload(){
    let payload = this.jwtHelper.decodeToken(this.getAccessToken());
    delete payload.iat;
    delete payload.exp;
    return payload;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.authApiUrl}/login`, { username, password })
        .pipe(map(res => {
            if (res.accessToken && res.refreshToken) {
              localStorage.setItem(this.ACCESS_TOKEN, res.accessToken);
              localStorage.setItem(this.REFRESH_TOKEN, res.refreshToken);
              this.currentUser = new User().deserialize(this.getAccessTokenPayload());
            }
        }))
  }

  logout(): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        refreshToken: this.getRefreshToken()
      }
    };
    return this.http.delete<any>(`${environment.authApiUrl}/logout`, options).pipe(
      map(() => {
        this.router.navigate(['/login']);
        localStorage.removeItem(this.ACCESS_TOKEN);
        localStorage.removeItem(this.REFRESH_TOKEN);
        this.currentUser = null;
        this.spinner.forceHide();
      })
    )
  }

  renewAccessToken(): Observable<any> {
    return this.http.post<any>(`${environment.authApiUrl}/token`, { refreshToken: this.getRefreshToken() })
        .pipe(map(res => {
          localStorage.setItem(this.ACCESS_TOKEN, res.accessToken);
        }));
  }

  getCurrentUser(): User { return this.currentUser; }

  getAccessToken(){ return localStorage.getItem(this.ACCESS_TOKEN); }

  getRefreshToken(){ return localStorage.getItem(this.REFRESH_TOKEN); }

  getTokenExpirationDateTime(){ return this.jwtHelper.getTokenExpirationDate(this.getAccessToken()).getTime(); }

  isLoggedIn() {
    if(!!this.getAccessToken() && !!this.getRefreshToken()) {
      if(!this.currentUser) this.currentUser = new User().deserialize(this.getAccessTokenPayload());

      return true;
    }
    return false;
  }
}
