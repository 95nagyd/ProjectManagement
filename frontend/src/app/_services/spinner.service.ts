import { Injectable } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private callCount: number;

  constructor(private spinner: NgxSpinnerService) { 
    this.callCount = 0;
  }

  show() {
    if(this.callCount === 0) this.spinner.show();

    this.callCount++;
  }

  hide() {
    if(this.callCount === 1) this.spinner.hide();
    
    if(this.callCount > 0) this.callCount--;
  }

  forceHide() { while(this.callCount !== 0){ this.hide(); } }

  isSpinnerVisible() { return this.callCount > 0 ? true : false; }
}
