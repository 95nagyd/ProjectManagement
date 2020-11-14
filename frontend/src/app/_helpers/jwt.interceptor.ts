import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/_services/authentication.service';
import { take } from 'rxjs/operators';
import { GlobalModalsService } from '@app/_services/global-modals.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService, private globalModalsService: GlobalModalsService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.authenticationService.isLoggedIn() && request.url.startsWith(environment.apiUrl)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authenticationService.getAccessToken()}`
                }
            });
            
            if(!this.authenticationService.isTokenExpired()){ 
                this.authenticationService.renewAccessToken().pipe(take(1)).subscribe();
            }
        }
        return next.handle(request);
    }
}