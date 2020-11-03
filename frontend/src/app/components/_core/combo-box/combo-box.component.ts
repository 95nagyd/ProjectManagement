import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { EventEmitter } from '@angular/core'
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

@Component({
  selector: 'combo-box',
  templateUrl: './combo-box.component.html',
  styleUrls: ['./combo-box.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBoxComponent implements OnInit {


  hasError: Boolean;
  hasValue: Boolean;
  isActive: Boolean;
  searchResult: string[];
  searchValue: string;
  arrowIndex: number;

  @ViewChild('search') search: ElementRef;
  @Input() isDisabled: Boolean;
  @Input() chosen: string;
  @Input() choices: string[];
  @Input() comboWidth: number;
  @Input() isRequired: Boolean;
  @Output() update: EventEmitter<string>;

  constructor(private comboBoxService: ComboBoxService, public elementRef: ElementRef, private cdRef: ChangeDetectorRef) { 
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
  
  
  toggleDropdown(fromClick?: Boolean) {
    if(this.isActive && fromClick) {
      return;
    }
    if(!this.isActive){
      this.comboBoxService.registerComboBox(this);
      const currentParentNode = this.elementRef.nativeElement.children[0].firstChild;
      this.isActive = true;
      this.searchResult = this.choices;
      this.arrowIndex = (this.choices && this.choices.indexOf(this.chosen) != -1) ? this.choices.indexOf(this.chosen) : 0;
      this.comboBoxService.openDropdown(currentParentNode, this.searchValue, this.searchResult);
      currentParentNode.children[0].focus();
      currentParentNode.children[0].select();
      return;
    } 
    this.closeComboBox();

  }

  closeComboBox(){
    this.isActive = false;
    this.arrowIndex = 0;
    this.searchResult = [];
    this.comboBoxService.closeDropdown();
    this.hasError = !this.isValueValid();
    this.comboBoxService.deregisterComboBox();
  }

  clickedOutside(){
    if(this.comboBoxService.isLastClickOutOfDropdown()){
      if(this.searchValue != this.chosen) {
        this.searchValue = this.chosen;
      }
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
    this.arrowIndex = choiceIndex === undefined ? this.arrowIndex : choiceIndex;
    if(this.searchResult.length > 0) {
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
      event.currentTarget.blur();
      return; 
    }
  }

  onKeyDown(event: any){
    if(event.code === 'Tab') { 
      this.closeComboBox();
      return; 
    }
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

  isTooltipRequired(){
    if(!this.search) { return false; }
    return this.search.nativeElement.offsetWidth < this.search.nativeElement.scrollWidth
  }
}
