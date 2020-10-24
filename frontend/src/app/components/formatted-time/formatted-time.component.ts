import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'formatted-time',
  templateUrl: './formatted-time.component.html',
  styleUrls: ['./formatted-time.component.css']
})
export class FormattedTimeComponent implements OnInit {

  private hasError: Boolean;
  private pattern;

  constructor() { 
    this.hasError = false;
    this.pattern = /^[0-9]{0,2}[\:]?[0-9]{0,2}$/;
  }

  ngOnInit(): void { }
  @Input() value: string;
  @Input() isDisabled: Boolean;

  public get isValid() : Boolean { return !this.hasError; }

  onFocusOut() {
    const input = this.value;
    let hours = 0;
    let minutes = 0;

    // --- üres input
    if(!input || input.length === 0) {
      this.hasError = false;
      this.value = '00:00';
      return;
    }

    // --- ha az input nem felel meg a regex-nek, akkor hiba
    if (!this.pattern.test(input)) { 
      this.hasError = true;
      return;
    }

    if(input.indexOf(':') == -1){
      // --- kevesebb mint 3 számjegy, csak az óra van megadva
      if(input.length < 3){
        hours = parseInt(input)
      }
      // --- 3 számjegy, első óra, többi perc
      if(input.length == 3){
        hours = parseInt(input.substring(0, 1));
        minutes = parseInt(input.substring(1, 3));
      }
      // --- 4 számjegy, első kettő óra, többi perc
      if(input.length == 4){
        hours = parseInt(input.substring(0, 2));
        minutes = parseInt(input.substring(2, 4));
      }
      // --- 5 számjegy, hibás
      if(input.length > 4) {  
        this.hasError = true; 
        return; 
      }
    } else {
      let parts = input.split(':');

      hours = isNaN(parseInt(parts[0])) ? 0 : parseInt(parts[0]);
      minutes = isNaN(parseInt(parts[1])) ? 0 : parseInt(parts[1]);
    }
  
    if(hours > 23 || minutes > 59){
      this.hasError = true;
      return;
    }

    this.hasError = false;
    this.value = (hours < 10 ? ('0' + hours) : hours.toString()) + ':' + (minutes < 10 ? ('0' + minutes) : minutes.toString())
  }

  onKeyPress(event: any){

    if(event.key === 'Enter') event.target.blur();

    if (!this.pattern.test(event.key)) { event.preventDefault(); }
  }
}
