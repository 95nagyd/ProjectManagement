import { Component, OnInit, OnDestroy } from '@angular/core';
import { InfoModalType } from '@app/_models/modals';
import { AuthenticationService } from '@app/_services/authentication.service';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { SpinnerService } from '@app/_services/spinner.service';
import { UserService } from '@app/_services/user.service';
import { interval, of, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'navbar-user-details',
  templateUrl: './navbar-user-details.component.html',
  styleUrls: ['./navbar-user-details.component.css']
})

export class NavbarUserDetailsComponent implements OnInit, OnDestroy {

  currentUserFullName: string;
  timeLeft: number;
  intervalSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService, private userService: UserService, private globalModalsService: GlobalModalsService, private spinner: SpinnerService) {
    this.initInterval();
  }

  ngOnInit(): void {
    this.currentUserFullName = this.userService.getFullName(this.authenticationService.getCurrentUser());
  }

  ngOnDestroy() {
    this.intervalSubscription?.unsubscribe();
  }

  initInterval() {
    this.intervalSubscription = interval(1000).pipe(
      takeWhile(() => this.authenticationService.isLoggedIn()),
      switchMap(() => {
        const diff = (this.authenticationService.getTokenExpirationDateTime() - Date.now()) / 1000;
        if (diff < 0) return of(true);
        this.timeLeft = diff;
        return of(false);
      })
    ).subscribe((isExpired) => {
      if (isExpired) {
        this.spinner.forceHide();
        if (!this.globalModalsService.isInfoModalOpen()) {
          this.globalModalsService.openInfoModal(InfoModalType.EXPIRED).then((() => {
            this.authenticationService.logout();
            this.globalModalsService.closeInfoModal();
          }));
        }
      }
    })
  }

  isTimeLeftIndicatorReady() {
    return this.timeLeft ? !Number.isNaN(this.timeLeft) : false;
  }
}
