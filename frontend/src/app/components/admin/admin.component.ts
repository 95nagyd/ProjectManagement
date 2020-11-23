import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { first, delay } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';


import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';
import { SpinnerService } from '@app/_services/spinner.service'
import { AuthenticationService } from '@app/_services/authentication.service';
import { BasicElement, BasicDataType } from '@app/_models/basic-data';
import { Guid } from 'guid-typescript';
import { ChipComponent } from '../_core/chip/chip.component';
import { BasicDataService } from '@app/_services/basic-data.service';
import { take } from 'lodash-es';
import { GlobalModalsService } from '@app/_services/global-modals.service';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  //TODO: törlés, lekérni az összes 
  //TODO: ngafterviewinitbe settimeout hide - konstruktor a párja mindenhova

  selectedTab: BasicDataType;
  chipList: Array<BasicElement>;
  @ViewChildren(ChipComponent) chipRefList!: QueryList<ChipComponent>;
  isAddVisible: boolean;


  constructor(private spinner: SpinnerService, private basicDataService: BasicDataService, private globalModalsService: GlobalModalsService) {

    this.spinner.show();

    this.selectedTab = BasicDataType.PROJECT;
    this.getCurrentList();

    this.isAddVisible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.spinner.hide();
    }, 0);
  }

  getCurrentList() {
    this.spinner.show();
    this.basicDataService.getBasicElementsByType(this.selectedTab).subscribe((result) => {
      this.chipList = result;
      this.spinner.hide();
    }, (error) => {
      this.chipList = [];
      this.spinner.forceHide();
      if(!this.globalModalsService.isErrorModalOpen()){
        this.globalModalsService.openErrorModal(error.message).then(() => {
            this.globalModalsService.closeErrorModal();
        });
      }
    });
  }

  public get basicDataTab(): typeof BasicDataType {
    return BasicDataType;
  }


  switchToTab(tab: BasicDataType) {
    this.selectedTab = tab;
    this.getCurrentList();
  }


  saveChip(chipData: BasicElement) {
    this.spinner.show();
    const isValid = this.validateChips();
    if (isValid) {
      delete chipData.tempId;
      this.basicDataService.saveBasicElement(chipData, this.selectedTab).subscribe(() => {
        this.getCurrentList();
        //TODO: sikeres mentés toaster
        this.spinner.hide();
      }, (error) => {
        this.spinner.forceHide();
        if (error.message.code === 11000) {
          this.getCurrentList();
          if (!this.globalModalsService.isWarningModalOpen()) {
            this.globalModalsService.openWarningModal('Sikertelen mentés.\nIdőközben valaki már hozzáadta a(z) "' + chipData.name + '" nevű elemet.').then(() => {
              this.globalModalsService.closeWarningModal();
            });
          }
          return;
        }
        if(error.code === 404){
          this.getCurrentList();
          if(!this.globalModalsService.isWarningModalOpen()){
            this.globalModalsService.openWarningModal(error.message).then(() => {
                this.globalModalsService.closeWarningModal();
            });
          }
          return;
        }
        if(!this.globalModalsService.isErrorModalOpen()){
          this.globalModalsService.openErrorModal(error.message).then(() => {
              this.globalModalsService.closeErrorModal();
          });
        }
      });
    }
  }

  validateChips() {
    this.isAddVisible = false;
    this.chipRefList.forEach((chip, index, chipArray) => {
      chipArray[index].isAlreadyExist = false;
    });
    let unique = []
    const duplicates = this.chipList.filter(chip => {
      if (unique.find(x => x.name === chip.name)) { return true; }
      unique.push(chip);
      return false;
    });
    if (duplicates.length > 0) {
      duplicates.forEach(duplicate => {
        this.chipRefList.filter(chipRef => { return chipRef.chipData.name === duplicate.name }).forEach((duplicateChip, index, duplicateArray) => {
          duplicateArray[index].isAlreadyExist = true;
        });
      });
      return false;
    }

    if (this.chipRefList.some(chipRef => chipRef.isEmpty || chipRef.isAlreadyExist)) {
      console.log(this.chipRefList)
      return false;
    };
    this.isAddVisible = true;
    return true;
  }



  deleteChip(deleteChipId: Guid) {
    this.chipList = this.chipList.filter(chip => {
      return !chip.tempId.equals(deleteChipId);
    });
    setTimeout(() => {
      this.isAddVisible = this.validateChips();
    }, 0);

  }

  addChip() {
    this.isAddVisible = false;
    this.chipList.push(new BasicElement());
  }

}
