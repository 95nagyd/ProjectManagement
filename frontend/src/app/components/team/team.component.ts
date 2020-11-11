import { Component, OnInit, ViewChild } from '@angular/core';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { AuthenticationService } from '@app/_services/authentication.service';
import { SpinnerService } from '@app/_services/spinner.service';
import { UserService } from '@app/_services/user.service';
import { UserModalComponent } from './user-modal/user-modal.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  users: User[] = [];
  currentUser: User;
  selectedUser: User;
  isAdmin: Boolean;

  @ViewChild(UserModalComponent) userModal : UserModalComponent;

  constructor(public authenticationService: AuthenticationService, private spinner: SpinnerService, private userService: UserService) { 
    this.spinner.show();
  }

  //TODO: alert-ek toasterbe

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCurrentUser();
    this.isAdmin = this.currentUser.role === Role.Admin;

    this.userService.getAll().subscribe(users => {
      users.map(user => { if(this.currentUser._id !== user._id) this.users.push(new User(user)) });
    }, error => {
      alert("Hiba a felhasználók lekérdezésekor!")
    });
  }

  ngAfterViewInit() {
    this.spinner.hide();
  }

  getUserFullName(user: User){
    return this.userService.getFullName(user);
  }

  selectUser(user: User){
    this.selectedUser = user;
  }

  openUserModal(modifyUser?: User){
    this.userModal.open(modifyUser);
  }





  
}
