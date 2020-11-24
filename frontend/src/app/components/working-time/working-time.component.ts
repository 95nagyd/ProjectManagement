import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '@app/_services/spinner.service';


@Component({
  selector: 'working-time',
  templateUrl: './working-time.component.html',
  styleUrls: ['./working-time.component.css']
})
export class WorkingTimeComponent implements OnInit {

  constructor(private spinner: SpinnerService) {
    this.spinner.show();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.spinner.hide();
    }, 0);
  }
}
