import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BasicElement } from '@app/_models/basic-data';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';

@Component({
  selector: 'combo-box-dropdown',
  templateUrl: './combo-box-dropdown.component.html',
  styleUrls: ['./combo-box-dropdown.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBoxDropdownComponent implements OnInit {

  isVisible: Boolean;
  styleData: any;
  chosenName: string;
  choices: Array<BasicElement>;
  isClickOutside: Boolean;



  constructor(private comboBoxService: ComboBoxService, private scrollOffsetService: PageContentScrollOffsetService, private cdRef: ChangeDetectorRef) {
    this.comboBoxService.registerDropdown(this);


    this.isVisible = false;
    this.styleData = { x: -2000, y: -2000, minWidth: 0 };
    this.chosenName = '';
    this.choices = new Array<BasicElement>();
    this.isClickOutside = false;
  }

  ngOnInit(): void {
  }

  isExactMatch() {
    return !!this.choices.find((choice) => choice.name === this.chosenName)
  }

  show() {
    const comboRef = this.comboBoxService.getComboRef();

    // a megjelölendő elem szövege
    this.chosenName = comboRef.searchValue;

    // megjelenítéskor a teljes elemlista látszik
    this.choices = comboRef.searchResult;
    this.setPosition();
    this.cdRef.detectChanges();
  }

  setPosition() {
    let dropdownControl = this.comboBoxService.getComboRef().elementRef.nativeElement.firstElementChild.firstElementChild;
    let position = {
      x: dropdownControl.getBoundingClientRect().x + this.scrollOffsetService.getOffsetX(),
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

  hide() {
    this.isVisible = false;
    this.isClickOutside = false;
  }

  updateFields(choices: Array<BasicElement>, chosenName?: string){
    this.choices = choices;
    if (chosenName) { this.chosenName = chosenName; }
    this.cdRef.detectChanges();
  }

  onClickInOutEvent(isOut: Boolean) { 
    this.isClickOutside = isOut; 
  }

  choose(choiceIndex: number) { 
    this.comboBoxService.getComboRef().updateValue(choiceIndex); 
  }

}
