import { Component, NgZone, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AuthenticationService } from '@app/_services/authentication.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { Router } from '@angular/router';
import { SpinnerService } from './_services/spinner.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { interval, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {
  @ViewChild(NavbarComponent) navbar: NavbarComponent;
  @ViewChild('page') page: ElementRef;
  private isLoggedInPastState: any;

  private intervalSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService, private router: Router, private _ngZone: NgZone, private spinner: SpinnerService,
    private scrollOffsetService: PageContentScrollOffsetService, private location: Location, private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {

    this.spinner.show();

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
    this.matIconRegistry.addSvgIcon(
      "save",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/save.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "save-disabled",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icon/save-disabled.svg")
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
    this.scrollOffsetService.setOffsetX(0);
    setTimeout(() => {
      this.spinner.hide();
    }, 0);
  }

  ngOnDestroy(){
    this.intervalSubscription?.unsubscribe();
  }

  initInterval() {
    this.intervalSubscription = interval(500).pipe(
      switchMap(() => {
        return of(this.isLoggedIn());
      }))
      .subscribe((isLoggedInActualState) => {
        if (isLoggedInActualState !== this.isLoggedInPastState) {
          if (isLoggedInActualState) this._ngZone.run(() => { this.router.navigate(['']); });
          if (!isLoggedInActualState) this._ngZone.run(() => { this.router.navigate(['/login']); });
          this.isLoggedInPastState = isLoggedInActualState;
        }
      });
  }

  isLoggedIn() { return this.authenticationService.isLoggedIn(); }

  setScrollTop(offset: number) { 
    if (this.page) { this.page.nativeElement.scrollTop = offset; } 
  }

  onScroll() { 
    this.scrollOffsetService.setOffsetY(this.page.nativeElement.scrollTop); 
    this.scrollOffsetService.setOffsetX(this.page.nativeElement.scrollLeft); 
  };

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
}
