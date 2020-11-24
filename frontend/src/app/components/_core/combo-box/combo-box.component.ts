import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { EventEmitter } from '@angular/core'
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { BasicElement } from '@app/_models/basic-data';

@Component({
  selector: 'combo-box',
  templateUrl: './combo-box.component.html',
  styleUrls: ['./combo-box.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBoxComponent implements OnInit, OnChanges {

  @ViewChild('search') search: ElementRef;
  @Input() isDisabled: Boolean;
  @Input() chosenId: string;
  @Input() choices: Array<BasicElement>;
  @Input() comboWidth: number;
  @Input() isRequired: Boolean;
  @Output() update: EventEmitter<string>;

  hasError: Boolean;
  hasValue: Boolean;
  isActive: Boolean;

  arrowIndex: number;
  mouseEventCounter: number;

  //a szűrés listája
  searchResult: Array<BasicElement>;

  //a szűrő értéke
  searchValue: string;

  constructor(private comboBoxService: ComboBoxService, public elementRef: ElementRef, private cdRef: ChangeDetectorRef) {
    this.hasError = false;
    this.hasValue = false;
    this.isActive = false;
    this.searchResult = new Array<BasicElement>();
    this.update = new EventEmitter();
    this.mouseEventCounter = 0;
  }

  ngOnInit(): void {
    this.hasValue = !(!this.chosenId || this.chosenId.length === 0);

    //kezdetben a szúrés értéke (a megjelenített név) a mentett id-hez tartozó név vagy üres string
    this.searchValue = this.getChosenName();
  }

  ngOnChanges() {
    if (this.chosenId && !this.getChosenName()) {
      setTimeout(() => {
        this.hasError = true;
        this.clearValue();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  getChosenName() {
    return this.choices?.find(choice => choice._id === this.chosenId)?.name || '';
  }

  indexOfElementByName(name: string) {
    return this.choices.findIndex(choice => choice.name === name);
  }

  toggleDropdown(event: any) {
    const isToggle = event.target.classList.contains('toggle') || event.target.classList.contains('toggle-icon')
    if ((this.isActive && !isToggle) || event.target.classList.contains('clear-icon')) {
      return;
    }
    if (!this.isActive) {
      this.openComboBox();
      return;
    }
    this.comboBoxService.hideDropdown();
    this.closeComboBox();
  }

  openComboBox() {
    this.isActive = true;
    //minden megnyitáskor a teljes elem lista látszik
    this.searchResult = this.choices;
    this.arrowIndex = (this.choices && this.indexOfElementByName(this.searchValue) != -1) ? this.indexOfElementByName(this.searchValue) : 0;
    this.comboBoxService.showDropdown(this);
  }

  closeComboBox() {
    this.isActive = false;
    // szűrés lista kiürítése
    this.searchResult = [];
    this.arrowIndex = 0;
    this.hasError = !this.isValueValid();
    this.search?.nativeElement?.blur();

  }


  clickedOutside() {
    if (this.comboBoxService.isLastClickOutOfDropdown() && this.mouseEventCounter === 0) {
      const chosenName = this.getChosenName();
      //ha a szűrés nem egyezik a korábban kiválasztott értékkel akkor a kiválasztott név marad
      if (this.searchValue != chosenName) { this.searchValue = chosenName; }
      this.comboBoxService.hideDropdown();
      this.closeComboBox();
    }
  }

  onMouseEvent(add: number) {
    this.mouseEventCounter = add;
  }

  clickOutsidePreventClose() { if (this.mouseEventCounter !== 0) { this.mouseEventCounter = 0; } }

  isValueValid() {
    const isExist = this.indexOfElementByName(this.searchValue) != -1;
    if (this.isRequired) {
      return this.searchValue && this.searchValue.length != 0 && isExist;
    }
    return !this.searchValue || this.searchValue.length === 0 || isExist;
  }


  updateValue(choiceIndex?: number) {
    this.arrowIndex = choiceIndex === undefined ? this.arrowIndex : choiceIndex;
    if (this.searchResult.length > 0) {
      this.searchValue = this.searchResult[this.arrowIndex].name;
      this.chosenId = this.choices.find(choice => choice.name === this.searchValue)?._id || '';
      this.hasValue = !(!this.chosenId || this.chosenId.length === 0);
      this.update.emit(this.chosenId);
    }
    this.hasError = !this.isValueValid();
    this.comboBoxService.hideDropdown();
    this.closeComboBox();

  }

  clearValue() {
    this.searchValue = '';
    this.chosenId = '';
    this.hasValue = !(!this.chosenId || this.chosenId.length === 0);
    this.update.emit(this.chosenId);
  }

  onKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.updateValue();
      event.currentTarget.blur();
      return;
    }
  }

  onKeyDown(event: any) {
    if (event.code === 'Tab') {
      this.comboBoxService.hideDropdown();
      this.closeComboBox();
      return;
    }
    if (event.code === 'ArrowUp') {
      this.arrowIndex = this.arrowIndex === 0 ? this.arrowIndex : this.arrowIndex - 1;
      event.preventDefault();
    }
    if (event.code === 'ArrowDown') {
      this.arrowIndex = this.arrowIndex === this.searchResult.length - 1 ? this.arrowIndex : this.arrowIndex + 1;
      event.preventDefault();
    }

    // dropdown frissítése a szűrt listára, és a megjelölendő névre
    this.comboBoxService.updateDropdown(this.searchResult, this.searchResult[this.arrowIndex]?.name || '');
  }

  filter(value: any) {
    this.arrowIndex = 0;
    //szűrés kiürítése
    this.searchResult = [];
    if (value.length > 0) {
      for (let index = 0; index < this.choices.length; index++) {
        //szűrt lista a választható elemek neveiben való előfordulás alapján
        if (this.choices[index].name.toLowerCase().includes(value.toLowerCase())) this.searchResult.push(this.choices[index]);
      }
    } else {
      //ha a szűrő üres, akkor a teljes lista látszik
      this.searchResult = this.choices;
    }
    // dropdown frissítése a szűrt listára, és a megjelölendő névre
    this.comboBoxService.updateDropdown(this.searchResult, this.searchResult[0]?.name || '');
  }

  isTooltipRequired() {
    if (!this.search) { return false; }
    return this.search.nativeElement.offsetWidth < this.search.nativeElement.scrollWidth;
  }

  @HostListener('window:resize')
  onResize() {
    this.comboBoxService.hideDropdown();
    this.closeComboBox();
  }

}
