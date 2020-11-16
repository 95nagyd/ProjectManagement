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
  //TODO: telefonszám automata space töltés
  //TODO: scroll nem jó helyen van

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCurrentUser();
    this.isAdmin = this.currentUser.role === Role.Admin;

    this.refreshUserList();
  }

  ngAfterViewInit() {
    this.spinner.hide();
  }

  refreshUserList(){
    this.spinner.show();
    this.users = [];
    this.userService.getAll().subscribe(users => {
      users.map(user => { if(this.currentUser._id !== user._id) this.users.push(new User(user)) });
      this.spinner.hide();
    }, error => {
      alert("Hiba a felhasználók lekérdezésekor!")
      this.spinner.forceHide();
    });
  }

  getUserFullName(user: User){
    return this.userService.getFullName(user);
  }

  selectUser(user?: User){
    this.selectedUser = user || null;
    if(!user){
      this.refreshUserList();
    }
  }

  openUserModal(modifyUser?: User){
    this.userModal.open(modifyUser);
  }





  
}
