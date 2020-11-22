import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '@app/_services/spinner.service';

import { User } from '@app/_models/user';
import { AuthenticationService } from '@app/_services/authentication.service';


@Component({
  selector: 'working-time',
  templateUrl: './working-time.component.html',
  styleUrls: ['./working-time.component.css']
})
export class WorkingTimeComponent implements OnInit {

  constructor(private spinner: SpinnerService) { 
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }
}
