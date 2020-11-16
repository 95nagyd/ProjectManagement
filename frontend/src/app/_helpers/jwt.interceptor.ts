import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, EMPTY, from } from 'rxjs';

import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/_services/authentication.service';
import { take } from 'rxjs/operators';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { InfoModalType } from '@app/_models/modals';
import { SpinnerService } from '@app/_services/spinner.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService, private spinner: SpinnerService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.handle(request, next))
    }

    async handle(request: HttpRequest<any>, next: HttpHandler) {
        
        if (this.authenticationService.isLoggedIn() && request.url.startsWith(environment.apiUrl)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authenticationService.getAccessToken()}`
                }
            });
            
            if(!this.authenticationService.isTokenExpired()){ 
                return await this.authenticationService.renewAccessToken().then(() => {
                    return next.handle(request).toPromise();
                }, (err) => {
                    return EMPTY.toPromise();
                });
            } else {
                return EMPTY.toPromise();
            }
        } 
        return next.handle(request).toPromise();
    }
    
}