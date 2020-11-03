import { Injectable, NgZone } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { ComboBoxService } from './combo-box.service';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private callCount: number;

  constructor(private spinner: NgxSpinnerService, private comboBoxService: ComboBoxService, private _ngZone: NgZone) { 
    this.callCount = 0;
  }

  show() {
    if(this.callCount === 0) this.spinner.show();

    this._ngZone.runOutsideAngular(() => {
      this.comboBoxService.externalCloseComboAndHideDropdown();
    });

    this.callCount++;
  }

  hide() {
    if(this.callCount === 1) this.spinner.hide();
    
    if(this.callCount > 0) this.callCount--;
  }

  forceHide() { while(this.callCount !== 0){ this.hide(); } }

  isSpinnerVisible() { return this.callCount > 0 ? true : false; }
}
