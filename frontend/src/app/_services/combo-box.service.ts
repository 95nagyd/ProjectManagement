import { Injectable } from '@angular/core';
import { ComboBoxDropdownComponent } from '@app/components/_core/combo-box/combo-box-dropdown/combo-box-dropdown.component';
import { ComboBoxComponent } from '@app/components/_core/combo-box/combo-box.component';
import { BasicElement } from '@app/_models/basic-data';

@Injectable({
  providedIn: 'root'
})
export class ComboBoxService {
  private comboBoxDropdown: ComboBoxDropdownComponent;
  private comboBoxRef: ComboBoxComponent;

  registerDropdown(comboBoxDropdown: ComboBoxDropdownComponent) {
    this.comboBoxDropdown = comboBoxDropdown;
  }

  externalCloseComboAndHideDropdown() {
    this.comboBoxDropdown?.hide();
    this.comboBoxRef?.closeComboBox();
  }


  showDropdown(comboBoxRef: ComboBoxComponent) {
    this.comboBoxRef?.closeComboBox();

    this.comboBoxRef = comboBoxRef;
    this.comboBoxDropdown.show();
  }
  hideDropdown() {
    this.comboBoxRef = null;
    this.comboBoxDropdown.hide();
  }

  updateDropdown(choices: Array<BasicElement>, chosenName?: string) {
    this.comboBoxDropdown.choices = choices;
    if (chosenName) this.comboBoxDropdown.chosenName = chosenName;
  }

  getComboRef() {
    return this.comboBoxRef;
  }

  isLastClickOutOfDropdown() {
    return this.comboBoxDropdown.isClickOutside;
  }
}
