import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '@environments/environment';
import { SpinnerService } from '@app/_services/spinner.service';
import { User } from '@app/_models/user';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { GlobalModalsService } from './global-modals.service';

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

  private getAccessTokenPayload() {
    let payload = this.jwtHelper.decodeToken(this.getAccessToken());
    delete payload.iat;
    delete payload.exp;
    return payload;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.authApiUrl}/login`, { username, password })
      .pipe(map(res => {
        if (res.username) { return res; }
        if (res.accessToken && res.refreshToken) {
          localStorage.setItem(this.ACCESS_TOKEN, res.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN, res.refreshToken);
          this.currentUser = new User(this.getAccessTokenPayload());
        }
      }));
  }

  logout() {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        refreshToken: this.getRefreshToken()
      }
    };
    this.spinner.forceHide();
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    this.currentUser = null;
    this.http.delete<any>(`${environment.authApiUrl}/logout`, options).pipe(take(1)).subscribe();
    return this.router.navigate(['/login']);
  }

  renewAccessToken() {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.authApiUrl}/token`, { refreshToken: this.getRefreshToken() }).pipe(take(1)).subscribe((res) => {
        localStorage.setItem(this.ACCESS_TOKEN, res.accessToken);
        resolve();
      }, (err) => {
        reject(err);
      });
    })
  }

  getCurrentUser(): User { return this.currentUser; }

  getAccessToken() { 
    return localStorage.getItem(this.ACCESS_TOKEN); 
  }

  getRefreshToken() { 
    return localStorage.getItem(this.REFRESH_TOKEN); 
  }

  getTokenExpirationDateTime() { 
    return this.jwtHelper.getTokenExpirationDate(this.getAccessToken()).getTime(); 
  }

  isTokenExpired() { 
    return this.jwtHelper.isTokenExpired(this.getAccessToken()) 
  }

  isLoggedIn() {
    if (!!this.getAccessToken() && !!this.getRefreshToken()) {
      if (!this.currentUser) this.currentUser = new User(this.getAccessTokenPayload());
      return true;
    }
    return false;
  }
}
