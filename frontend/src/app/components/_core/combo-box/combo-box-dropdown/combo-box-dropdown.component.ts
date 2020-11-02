import { Component, HostListener, OnInit } from '@angular/core';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';

@Component({
  selector: 'combo-box-dropdown',
  templateUrl: './combo-box-dropdown.component.html',
  styleUrls: ['./combo-box-dropdown.component.css']
})
export class ComboBoxDropdownComponent implements OnInit {

  isVisible: Boolean;
  styleData: any;
  dropdownControl: any;
  chosen: string;
  choices: string[];
  isClickOutside: Boolean;



  constructor(private comboBoxService: ComboBoxService, private scrollOffsetService: PageContentScrollOffsetService) { 
    this.comboBoxService.registerDropdown(this);


    this.isVisible = false;
    this.styleData = {x: -2000, y:-2000, minWidth: 0};
    this.dropdownControl = null;
    this.chosen = '';
    this.choices = [];
    this.isClickOutside = true;
  }

  ngOnInit(): void {
  }

  isExactMatch(){
    return this.choices.includes(this.chosen)
  }

  show(dropdownControl: any, chosen: string, choices: string[]){
    setTimeout(() => {
      if(dropdownControl)  this.dropdownControl = dropdownControl;
      this.chosen = chosen;
      this.choices = choices;
      this.isVisible = true;

      this.setPosition();
    }, 50);
    
  }

  setPosition(){
    setTimeout(() => {
      if(this.dropdownControl){
        let position = { 
          x: this.dropdownControl.getBoundingClientRect().x,  
          y: this.dropdownControl.getBoundingClientRect().y + this.scrollOffsetService.getOffsetY(),
          minWidth: this.dropdownControl.getBoundingClientRect().width
        };
        position.x -= 9;
        position.y -= 56;
        this.styleData = position;
        this.isVisible = true;
      }
    }, 0);
  }

  hide(){
    if(this.dropdownControl){
      this.isVisible = false;
      this.dropdownControl = null;
      this.isClickOutside = true;
    }
  }

  onClickOutside() {
    this.isClickOutside = true;
  }

  onClickInside(){
    this.isClickOutside = false;
  }

  choose(choiceIndex: any){
    this.comboBoxService.chooseByClick(choiceIndex);
  }

  @HostListener('window:resize')
  onResize() {
    if(this.dropdownControl && this.isVisible){
      this.setPosition();
    }
  }

}
