import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/_services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.authenticationService.isLoggedIn() && request.url.startsWith(environment.apiUrl)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authenticationService.getAccessToken()}`
                }
            });
            
            this.authenticationService.renewAccessToken()
                .subscribe(
                    () => { },
                    error => {
                        alert("Hiba új token generálásakor!")
                    }
                ); 
        }

        return next.handle(request);
    }
}