import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/_services/spinner.service';

import { AuthenticationService } from '@app/_services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private spinner: SpinnerService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.log(err)
            if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
                this.authenticationService.logout().subscribe(() => {}, 
                    error => {
                        alert("Sikertelen kijelentkezés!")
                    });
            }
            
            if (err instanceof HttpErrorResponse && (err.status === 0)) {
                this.spinner.forceHide();
                err.error.message = "Az API szerver nem válaszol";
            }
            

            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}