import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/_services/spinner.service';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { InfoModalType } from '@app/_models/modals';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private spinner: SpinnerService, private globalModalsService: GlobalModalsService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {

            if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {

                if(request.url.startsWith(environment.apiUrl)){
                    if(!this.globalModalsService.isInfoModalOpen()){
                        this.globalModalsService.openInfoModal(InfoModalType.Expired).then((() => {
                            this.authenticationService.logout();
                            this.globalModalsService.closeInfoModal();
                        }));
                    }
                    return EMPTY;
                }

                if(request.url.startsWith(environment.authApiUrl) && this.authenticationService.isLoggedIn()){
                    if(err.status === 403){
                        if(!this.globalModalsService.isErrorModalOpen()){
                            this.globalModalsService.openErrorModal(err.error.message || err).then(() => {
                                this.globalModalsService.closeErrorModal();
                            });
                        }
                        return EMPTY;
                    }

                    if(err.status === 401){
                        if(!this.globalModalsService.isErrorModalOpen()){
                            this.globalModalsService.openErrorModal(err.error.message || err).then(() => {
                                this.authenticationService.logout();
                                this.globalModalsService.closeErrorModal();
                            });
                        }
                        return EMPTY;
                    }
                }
            }

            
            if (err instanceof HttpErrorResponse && (err.status === 0)) {

                this.spinner.forceHide();
                err.error.message = "Az autentikációs szerver nem válaszol.";

                if(this.authenticationService.isLoggedIn()){
                    if(!this.globalModalsService.isErrorModalOpen()){
                        this.globalModalsService.openErrorModal(err.error.message || err).then(() => {
                            this.globalModalsService.closeErrorModal();
                        });
                    }
                    return EMPTY;
                }

            }
            



            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}