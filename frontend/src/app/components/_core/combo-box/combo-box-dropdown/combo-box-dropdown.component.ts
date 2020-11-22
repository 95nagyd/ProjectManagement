import { Component, OnInit } from '@angular/core';
import { BasicElement } from '@app/_models/basic-data';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { ComboBoxComponent } from '../combo-box.component';

@Component({
  selector: 'combo-box-dropdown',
  templateUrl: './combo-box-dropdown.component.html',
  styleUrls: ['./combo-box-dropdown.component.css']
})
export class ComboBoxDropdownComponent implements OnInit {

  isVisible: Boolean;
  styleData: any;
  chosenName: string;
  choices: Array<BasicElement>;
  isClickOutside: Boolean;



  constructor(private comboBoxService: ComboBoxService, private scrollOffsetService: PageContentScrollOffsetService) { 
    this.comboBoxService.registerDropdown(this);


    this.isVisible = false;
    this.styleData = {x: -2000, y:-2000, minWidth: 0};
    this.chosenName = '';
    this.choices = new Array<BasicElement>();
    this.isClickOutside = false;
  }

  ngOnInit(): void {
  }

  isExactMatch(){
    return !!this.choices.find((choice) => choice.name === this.chosenName)
  }

  show(){
    const firstComboRef = this.comboBoxService.getComboRefList()[0];

    // a megjelölendő elem szövege
    this.chosenName = firstComboRef.searchValue;

    // megjelenítéskor a teljes elemlista látszik
    this.choices = firstComboRef.searchResult;
    this.setPosition();
  }

  setPosition(){
    const firstComboRef = this.comboBoxService.getComboRefList()[0];
    let dropdownControl = firstComboRef.elementRef.nativeElement.firstElementChild.firstElementChild;
    let position = { 
      x: dropdownControl.getBoundingClientRect().x,  
      y: dropdownControl.getBoundingClientRect().y + this.scrollOffsetService.getOffsetY(),
      minWidth: dropdownControl.getBoundingClientRect().width
    };
    position.x -= 9;
    position.y -= 56;
    this.styleData = position;
    this.isVisible = true;
    dropdownControl.firstElementChild.focus();
    dropdownControl.firstElementChild.select();
  }

  hide(){
    this.isVisible = false;
    this.isClickOutside = false;
  }

  onClickInOutEvent(isOut: Boolean) {
    this.isClickOutside = isOut;
  }

  choose(choiceIndex: any){
    this.comboBoxService.getComboRefList()[0].updateValue(choiceIndex);
  }

}
