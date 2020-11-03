import { Component, OnInit } from '@angular/core';
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
  chosen: string;
  choices: string[];
  isClickOutside: Boolean;



  constructor(private comboBoxService: ComboBoxService, private scrollOffsetService: PageContentScrollOffsetService) { 
    this.comboBoxService.registerDropdown(this);


    this.isVisible = false;
    this.styleData = {x: -2000, y:-2000, minWidth: 0};
    this.chosen = '';
    this.choices = [];
    this.isClickOutside = false;
  }

  ngOnInit(): void {
  }

  isExactMatch(){
    return this.choices.includes(this.chosen)
  }

  show(){
    this.comboBoxService.getComboRefList().then((comboBoxRefList: ComboBoxComponent[]) => {
      this.chosen = comboBoxRefList[0].searchValue;
      this.choices = comboBoxRefList[0].searchResult;
      this.setPosition();
    });
  }

  setPosition(){
    this.comboBoxService.getComboRefList().then((comboBoxRefList: ComboBoxComponent[]) => {
      let dropdownControl = comboBoxRefList[0].elementRef.nativeElement.firstElementChild.firstElementChild;
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
    });
  }

  hide(){
    this.isVisible = false;
    this.isClickOutside = false;
  }

  onClickInOutEvent(isOut: Boolean) {
    this.isClickOutside = isOut;
  }

  choose(choiceIndex: any){
    this.comboBoxService.getComboRefList().then((comboBoxRefList: ComboBoxComponent[]) => {
      comboBoxRefList[0].updateValue(choiceIndex);
    });
  }

}
