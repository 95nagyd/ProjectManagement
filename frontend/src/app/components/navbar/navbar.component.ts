import { Component, OnInit, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';

import { AuthenticationService } from '@app/_services/authentication.service';
import { User } from '@app/_models/user';
import { Role } from '@app/_models/role';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { ConfirmModalType } from '@app/_models/modals';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({
        overflow:'hidden',
        opacity:'1'
      })),
      state('collapsed', style({
        height:'0',
        overflow:'hidden',
        opacity:'0'
      })),
      transition('expanded <=> collapsed', animate(150)),
    ])
  ]
})
export class NavbarComponent implements OnInit {

  private currentUser: User;
  isNavbarCollapsed: boolean;
  isAnimationDisabled: boolean;


  constructor(private authenticationService: AuthenticationService) { 
    this.isNavbarCollapsed = this.isExpandable()
    this.isAnimationDisabled = false;
  }

  ngOnInit(): void { 
    this.currentUser = this.authenticationService.getCurrentUser();
  }

  logout() {
    this.authenticationService.logout();
  }

  isAdmin() { return this.currentUser && this.currentUser.role === Role.Admin; }

  isExpandable() { return window.innerWidth < 1200; }

  toggleNavbar() { this.isNavbarCollapsed = !this.isNavbarCollapsed; }

  public collapseIfPossible() {
    if(this.isExpandable() && !this.isNavbarCollapsed) { this.toggleNavbar(); }
  }

  @HostListener('window:resize')
  onResize() {
    this.isAnimationDisabled = this.isNavbarCollapsed ? false : this.isExpandable() ? true : false;
    if(this.isExpandable() && !this.isNavbarCollapsed){
      this.toggleNavbar();
    }else if(!this.isExpandable() && this.isNavbarCollapsed){
      this.toggleNavbar();
    }
    this.isNavbarCollapsed = this.isExpandable();
  }
}
