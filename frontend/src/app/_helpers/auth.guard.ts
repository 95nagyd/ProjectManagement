import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { ConfirmModalType } from '@app/_models/modals';
import { AuthenticationService } from '@app/_services/authentication.service';
import { GlobalModalsService } from '@app/_services/global-modals.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private router: Router, private globalModalsService: GlobalModalsService) { }

  canActivate(route: ActivatedRouteSnapshot) {
    //changes
    if(this.globalModalsService?.hasChanges){
      return this.globalModalsService.openConfirmModal(ConfirmModalType.DISCARD).then((isDiscardRequired) => {
        if (isDiscardRequired) {
          this.globalModalsService.hasChanges = false;
        };
        this.globalModalsService.closeConfirmModal();
        return isDiscardRequired;
      });
    }

    //role
    if (this.authenticationService.isLoggedIn()) {
        if (route.data.expectedRole && (route.data.expectedRole !== this.authenticationService.getCurrentUser().role)) {
          this.router.navigate(['']);
          return false;
        }
        return true;
    }

    this.router.navigate(['login']);
    return false;
  }
}
