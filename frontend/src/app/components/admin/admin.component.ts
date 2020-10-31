import { Component, OnInit } from '@angular/core';
import { first, delay } from 'rxjs/operators';

import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';
import { SpinnerService } from '@app/_services/spinner.service'
import { AuthenticationService } from '@app/_services/authentication.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  
  constructor(private spinner: SpinnerService, private userService: UserService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.userService.getAll().subscribe(users => {
      this.users = users;
      users.map(x => { this.users.push(new User(x)) });

      this.spinner.hide();
    }, error => {
      alert("Hiba a felhasználók lekérdezésekor!")
      this.spinner.hide();
    });
  }

  test(){
  
  }

}
