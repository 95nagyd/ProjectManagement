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

            //TODO: error-t egységesre formálni itt és és backend-en is

            if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
                if(request.url.startsWith(environment.apiUrl)){
                    if(!this.globalModalsService.isInfoModalOpen()){
                        this.globalModalsService.openInfoModal(InfoModalType.Expired).then((() => {
                            this.authenticationService.logout();
                            this.globalModalsService.closeInfoModal();
                        }));
                    }
                }

                if(request.url.startsWith(environment.authApiUrl) && this.authenticationService.isLoggedIn()){
                    this.authenticationService.logout().then(() => {
                        setTimeout(() => {
                            if(!this.globalModalsService.isErrorModalOpen()){
                                this.globalModalsService.openErrorModal(err.error.message || err).then(() => {
                                    this.globalModalsService.closeErrorModal();
                                });
                            }
                        }, 0);
                    });
                }

            }

            
            if (err instanceof HttpErrorResponse && (err.status === 0)) {

                
                this.spinner.forceHide();
                err.error.message = (request.url.startsWith(environment.authApiUrl) ? "Az autentikációs szerver nem válaszol." : "Az szerver nem válaszol.") +" Kérem próbálja meg később."

                if(this.authenticationService.isLoggedIn()){
                    if(!this.globalModalsService.isErrorModalOpen()){
                        this.globalModalsService.openErrorModal(err.error.message).then(() => {
                            this.globalModalsService.closeErrorModal();
                        });
                    }
                }

            }


            if(err instanceof HttpErrorResponse && (err.status === 406)){
                this.authenticationService.logout().then(() => {
                    setTimeout(() => {
                        if(!this.globalModalsService.isInfoModalOpen()){
                            this.globalModalsService.openCustomInfoModal('Változás', err.error.message || err).then((() => {
                                this.globalModalsService.closeInfoModal();
                            }));
                        }
                    }, 0);
                });
            }

            

            const error = { 
                code: err.status,
                message: err.error.message
            };
            return throwError(error);
        }))
    }
}