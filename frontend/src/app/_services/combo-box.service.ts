import { Injectable } from '@angular/core';
import { ComboBoxDropdownComponent } from '@app/components/_core/combo-box/combo-box-dropdown/combo-box-dropdown.component';
import { ComboBoxComponent } from '@app/components/_core/combo-box/combo-box.component';

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
    return new Promise((resolve) => {
      if(this.comboBoxRefList.indexOf(comboBoxRef) === -1){
        this.comboBoxRefList.push(comboBoxRef);
      }
      resolve();
    });
  }

  removeAndCloseOldComboRef(actualComboBoxRef: ComboBoxComponent){
    return new Promise((resolve) => {
      this.comboBoxRefList.forEach((comboBoxRef) => {
        if((comboBoxRef.elementRef.nativeElement !== actualComboBoxRef.elementRef.nativeElement)){
          this.removeAndCloseGivenComboRef(comboBoxRef);
        }
      });
      resolve();
    });
  }

  removeAndCloseGivenComboRef(actualComboBoxRef: ComboBoxComponent){
    return new Promise((resolve) => {
      const indexOfActual = this.comboBoxRefList.indexOf(actualComboBoxRef);
      if(indexOfActual !== -1){
        actualComboBoxRef.closeComboBox();
        this.comboBoxRefList.splice(indexOfActual, 1);
      }
      resolve();
    });
  }

  externalCloseComboAndHideDropdown(){
    return new Promise((resolve) => {
      if(this.comboBoxDropdown) { this.comboBoxDropdown.hide(); }
      if(this.comboBoxRefList.length > 0){
        this.comboBoxRefList[0].closeComboBox();
      }
      resolve();
    });
  }

  getComboRefList() {
    return new Promise((resolve) => {
      resolve(this.comboBoxRefList)
    });
  }

  showDropdown() {
    this.comboBoxDropdown.show();
  }
  hideDropdown() {
    this.comboBoxDropdown.hide();
  }

  updateDropdown(choices: string[], chosen?: string){
    this.comboBoxDropdown.choices = choices;
    
    if(chosen) this.comboBoxDropdown.chosen = chosen;
  }

  isLastClickOutOfDropdown(){
    return this.comboBoxDropdown.isClickOutside;
  }
}
