import { Injectable } from '@angular/core';
import { ComboBoxDropdownComponent } from '@app/components/_core/combo-box/combo-box-dropdown/combo-box-dropdown.component';
import { ComboBoxComponent } from '@app/components/_core/combo-box/combo-box.component';
import { BasicElement } from '@app/_models/basic-data';

@Injectable({
  providedIn: 'root'
})
export class ComboBoxService {
  private comboBoxDropdown: ComboBoxDropdownComponent;
  comboBoxRefList: ComboBoxComponent[] = [];

  registerDropdown(comboBoxDropdown: ComboBoxDropdownComponent){
    this.comboBoxDropdown = comboBoxDropdown;
  }

  addComboRef(comboBoxRef: ComboBoxComponent) {
    if(this.comboBoxRefList.indexOf(comboBoxRef) === -1){
      this.comboBoxRefList.push(comboBoxRef);
    }
  }

  removeAndCloseOldComboRef(actualComboBoxRef: ComboBoxComponent){
    this.comboBoxRefList.forEach((comboBoxRef) => {
      if((comboBoxRef.elementRef.nativeElement !== actualComboBoxRef.elementRef.nativeElement)){
        this.removeAndCloseGivenComboRef(comboBoxRef);
      }
    });
  }

  removeAndCloseGivenComboRef(actualComboBoxRef: ComboBoxComponent){
    const indexOfActual = this.comboBoxRefList.indexOf(actualComboBoxRef);
    if(indexOfActual !== -1){
      actualComboBoxRef.closeComboBox();
      this.comboBoxRefList.splice(indexOfActual, 1);
    }
  }

  externalCloseComboAndHideDropdown(){
    if(this.comboBoxDropdown) { this.comboBoxDropdown.hide(); }
    if(this.comboBoxRefList.length > 0){
      this.comboBoxRefList[0].closeComboBox();
    }
  }

  getComboRefList() {
    return this.comboBoxRefList;
  }

  showDropdown() {
    this.comboBoxDropdown.show();
  }
  hideDropdown() {
    this.comboBoxDropdown.hide();
  }

  updateDropdown(choices: Array<BasicElement>, chosenName?: string){
    this.comboBoxDropdown.choices = choices;
    if(chosenName) this.comboBoxDropdown.chosenName = chosenName;
  }

  isLastClickOutOfDropdown(){
    return this.comboBoxDropdown.isClickOutside;
  }
}
