import { Component, ElementRef, HostListener, Input, OnInit, Output } from '@angular/core';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'combo-box',
  templateUrl: './combo-box.component.html',
  styleUrls: ['./combo-box.component.css']
})
export class ComboBoxComponent implements OnInit {


  hasError: Boolean;
  hasValue: Boolean;
  isActive: Boolean;
  searchResult: string[];
  searchValue: string;
  arrowIndex: number;


  @Input() isDisabled: Boolean;
  @Input() chosen: string;
  @Input() choices: string[];
  @Input() comboWidth: number;
  @Input() isRequired: Boolean;
  @Output() update: EventEmitter<string>;

  constructor(private comboBoxService: ComboBoxService) { 
    this.hasError = false;
    this.hasValue = false;
    this.isActive = false;
    this.searchResult = [];
    this.update = new EventEmitter();
    
  }

  ngOnInit(): void {
    this.hasValue = !(!this.chosen || this.chosen.length === 0);
    this.searchResult = this.choices;
    this.searchValue = this.chosen;
  }
  
  toggleDropdown(event: any, fromInput?: Boolean) {
    if(this.isActive && fromInput) {
      return;
    }
    if(!this.isActive){
      const currentParentNode = event.currentTarget.parentNode;
      setTimeout(() => {
        this.comboBoxService.registerComboBox(this);
        this.isActive = true;
        this.searchResult = this.choices;
        this.arrowIndex = (this.choices && this.choices.indexOf(this.chosen) != -1) ? this.choices.indexOf(this.chosen) : 0;
        this.comboBoxService.openDropdown(currentParentNode, this.searchValue, this.searchResult);
        currentParentNode.children[0].focus();
        currentParentNode.children[0].select();
      }, 0);
      return;
    } 
    this.closeComboBox();

  }

  closeComboBox(){
    this.comboBoxService.deregisterComboBox();
    this.isActive = false;
    this.arrowIndex = 0;
    this.searchResult = [];
    this.comboBoxService.closeDropdown();
    
    this.hasError = !this.isValueValid();
  }

  clickedOutside(){
    if(this.comboBoxService.isLastClickOutOfDropdown()){
      if(this.searchValue != this.chosen) this.searchValue = this.chosen;
      this.closeComboBox();
    }
  }

  isValueValid(){
    if(this.isRequired){
      return this.searchValue && this.searchValue.length != 0 && this.choices.includes(this.searchValue);
    }
    return !this.searchValue || this.searchValue.length === 0 || this.choices.includes(this.searchValue);
  }

  updateValue(choiceIndex?: number) {
    this.arrowIndex = choiceIndex ? choiceIndex : this.arrowIndex;
    if(this.searchResult.length > 0) {
      console.log(this.searchResult[this.arrowIndex] + " ;service update match index "+ this.arrowIndex)
      this.searchValue = this.searchResult[this.arrowIndex];
      this.comboBoxService.updateDropdown(this.searchResult, this.searchValue);
      this.chosen = this.searchValue;
      this.hasValue = !(!this.chosen || this.chosen.length === 0);
      this.update.emit(this.chosen);
    }

    this.hasError = !this.isValueValid();
    this.closeComboBox();
  }

  clearValue(){
    this.searchValue = '';
    this.chosen = this.searchValue;
    this.hasValue = !(!this.chosen || this.chosen.length === 0);
    this.update.emit(this.chosen);
  }

  onKeyPress(event: any){
    if(event.key === 'Enter') { 
      this.updateValue();
      event.currentTarget.blur()
      return; 
    }
  }

  onKeyDown(event: any){
    if (event.code === 'ArrowUp') { 
      this.arrowIndex = this.arrowIndex === 0 ? this.arrowIndex : this.arrowIndex-1; 
      event.preventDefault();
    } 
    if (event.code === 'ArrowDown') { 
      this.arrowIndex = this.arrowIndex === this.searchResult.length-1 ? this.arrowIndex : this.arrowIndex+1;
      event.preventDefault(); 
    }
    this.comboBoxService.updateDropdown(this.searchResult, this.searchResult[this.arrowIndex]);
  }

  filter(value: any) {
    this.arrowIndex = 0;
    this.searchResult = [];
    if(value.length > 0){
      for(let index = 0; index < this.choices.length; index++){
        if(this.choices[index].toLowerCase().includes(value.toLowerCase())) this.searchResult.push(this.choices[index]);
      }
    } else {
      this.searchResult = this.choices
    }
    this.comboBoxService.updateDropdown(this.searchResult, this.searchResult[0]);
  }

  
  

}
