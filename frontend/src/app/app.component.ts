import { Component, NgZone, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService } from '@app/_services/authentication.service';
import { Router } from '@angular/router';
import { SpinnerService } from './_services/spinner.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { interval, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  private isLoggedInPastState: any;

  @ViewChild(NavbarComponent) navbar: NavbarComponent;
  @ViewChild('page')
  page: ElementRef;

  constructor(private authenticationService: AuthenticationService, private router: Router, 
                private ngZone: NgZone, private spinner: SpinnerService) { 
    this.isLoggedInPastState = this.isLoggedIn();

    if (this.isLoggedInPastState) this.router.navigate(['']);

    this.initInterval();
  }


  initInterval() {
    interval(500).pipe(
      switchMap(() => {
        return of(this.isLoggedIn());
      }))
      .subscribe((isLoggedInActualState) => { 
        if(isLoggedInActualState !== this.isLoggedInPastState){
          if(isLoggedInActualState) this.ngZone.run(() => this.router.navigate(['']) );
          if(!isLoggedInActualState) this.ngZone.run(() => this.router.navigate(['/login']) );
          this.isLoggedInPastState = isLoggedInActualState;
        }
      })
  }

  isLoggedIn(){
    return this.authenticationService.isLoggedIn();
  }

  
  scrollTop(){
    this.page.nativeElement.scrollTop = 0;
  }

  @HostListener('document:keydown', ['$event'])   
  onKeydown(event: KeyboardEvent) {
    if(this.spinner.isSpinnerVisible()){
      event.preventDefault();
    }
  }
}
