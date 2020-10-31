import { Directive, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { SpinnerService } from '@app/_services/spinner.service';

@Directive({
  selector: '[clickInside]',
})
export class ClickInsideDirective {

  @Output() clickInside = new EventEmitter<void>();

  constructor(private el: ElementRef, private spinner: SpinnerService) { 
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    if(!this.spinner.isSpinnerVisible()) {
      if(this.el.nativeElement.classList.contains('combo-container') && !this.el.nativeElement.children[0].classList.contains('dropdown-visible')){
        return;
      }
      if(this.el.nativeElement.contains(target)){ this.clickInside.emit(); }
    }
  }
}
