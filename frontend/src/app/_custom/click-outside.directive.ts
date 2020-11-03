import { Directive, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { SpinnerService } from '@app/_services/spinner.service';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef, private spinner: SpinnerService) { 
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    if(!this.spinner.isSpinnerVisible()) {
      if(this.el.nativeElement.classList.contains('combo-container') 
          && target?.parentElement?.classList.contains('dropdown-control') 
            || target?.parentElement?.parentElement?.classList.contains('dropdown-control')
      ){
        return;
      }
      if(!this.el.nativeElement.contains(target)){ this.clickOutside.emit(); }
    }
  }
}