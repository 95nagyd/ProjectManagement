import { Injectable } from '@angular/core';
import { ComboBoxDropdownComponent } from '@app/components/_core/combo-box/combo-box-dropdown/combo-box-dropdown.component';
import { ComboBoxComponent } from '@app/components/_core/combo-box/combo-box.component';

@Injectable({
  providedIn: 'root'
})
export class ComboBoxService {

  private comboBox: ComboBoxComponent;
  private comboBoxDropdown: ComboBoxDropdownComponent;

  constructor() {
  }

  registerComboBox(comboBox: ComboBoxComponent){
    this.comboBox = comboBox;
  }

  deregisterComboBox(){
    this.comboBox = null;
  }

  registerDropdown(comboBoxDropdown: ComboBoxDropdownComponent){
    this.comboBoxDropdown = comboBoxDropdown;
  }

  openDropdown(dropdownControl: any, chosen: string, choices: string[]) {
    this.comboBoxDropdown.show(dropdownControl, chosen, choices)
  }

  updateDropdown(choices: string[], chosen?: string){
    this.comboBoxDropdown.choices = choices;
    
    if(chosen) this.comboBoxDropdown.chosen = chosen;
  }

  closeDropdown(){
    this.comboBoxDropdown.hide();
  }

  isLastClickOutOfDropdown(){
    return this.comboBoxDropdown.isClickOutside;
  }

  chooseByClick(choiceIndex: number){
    if(this.comboBox.isActive){ this.comboBox.updateValue(choiceIndex); }
  }

  externalCloseDropdown(){
    if(this.comboBox && this.comboBox.isActive){ this.comboBox.closeComboBox(); }
  }

}
