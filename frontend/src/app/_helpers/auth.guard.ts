import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '@app/_services/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot) {
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
