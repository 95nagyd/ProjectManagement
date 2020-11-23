import { Component, NgZone, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService } from '@app/_services/authentication.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from './_services/spinner.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { interval, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GlobalModalsService } from './_services/global-modals.service';
import { ComboBoxService } from './_services/combo-box.service';
import { Location } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  private isLoggedInPastState: any;

  @ViewChild(NavbarComponent) navbar: NavbarComponent;
  @ViewChild('page') page: ElementRef;

  constructor(private authenticationService: AuthenticationService, private router: Router, private _ngZone: NgZone, private spinner: SpinnerService,
    private scrollOffsetService: PageContentScrollOffsetService, private location: Location, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {

    this.matIconRegistry.addSvgIcon(
      "project",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/project.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "design-phase",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/design-phase.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "structural-element",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/structural-element.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "subtask",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/subtask.svg")
    );

    this.scrollOffsetService.register(this);

    this.isLoggedInPastState = this.isLoggedIn();

    if (this.isLoggedInPastState) this.router.navigate([this.location.path()]);

    this._ngZone.runOutsideAngular(() => {
      this.initInterval();
    });
  }


  ngAfterViewInit() {
    this.scrollOffsetService.setOffsetY(0);
  }


  initInterval() {
    interval(500).pipe(
      switchMap(() => {
        return of(this.isLoggedIn());
      }))
      .subscribe((isLoggedInActualState) => {
        if (isLoggedInActualState !== this.isLoggedInPastState) {
          if (isLoggedInActualState) this._ngZone.run(() => { this.router.navigate(['']); });
          if (!isLoggedInActualState) this._ngZone.run(() => { this.router.navigate(['/login']); });
          this.isLoggedInPastState = isLoggedInActualState;
        }
      })
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }

  setScrollTop(offset: number) {
    if (this.page) { this.page.nativeElement.scrollTop = offset; }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.spinner.isSpinnerVisible()) {
      event.preventDefault();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.spinner.isSpinnerVisible()) {
      event.preventDefault();
    }
  }

  onScroll() {
    this.scrollOffsetService.setOffsetY(this.page.nativeElement.scrollTop);
  };
}
