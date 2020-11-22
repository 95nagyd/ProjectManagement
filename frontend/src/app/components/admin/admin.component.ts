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

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  //TODO: lekezelni, hogy ha egy módosítandó elem lastmodified nem annyi mint ami itt van akkor infoba, hogy valamki más módosította, kérem próbálja újra és újra lekérni a listát
  selectedTab: BasicDataType;
  chipList: Array<BasicElement>;
  @ViewChildren(ChipComponent) chipRefList!: QueryList<ChipComponent>;
  isAddVisible: boolean;
  
  
  constructor(private spinner: SpinnerService, private basicDataService: BasicDataService) { 

    this.spinner.show();
    
    this.selectedTab = BasicDataType.PROJECT;
    this.getCurrentList();

    this.isAddVisible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.spinner.hide();
  }

  getCurrentList(){
    this.spinner.show();
    this.basicDataService.getBasicData(this.selectedTab).subscribe((result) => {
      this.chipList = result;
      console.log(this.chipList)
      this.spinner.hide();
    }, (error) => {
      this.chipList = [];
      //TODO: hiba modal
      console.log("nem siker")
      this.spinner.forceHide();
    });
  }

  public get basicDataTab(): typeof BasicDataType {
    return BasicDataType; 
  }


  switchToTab(tab: BasicDataType){
    this.selectedTab = tab;
    this.getCurrentList();
  }








  validateChips(){
    //ez egyesével fog menni, backendről jön majd a válasz, hogy siker v sem
    this.isAddVisible = false;
    this.chipRefList.forEach((chip, index, chipArray) => {
      chipArray[index].isAlreadyExist = false;
    });
    let unique = []
    const duplicates = this.chipList.filter(chip => {
      if(unique.find(x => x.name === chip.name)) { return true; }
      unique.push(chip);
      return false;
    });
    if(duplicates.length > 0){
      duplicates.forEach(duplicate => {
        this.chipRefList.filter(chipRef => { return chipRef.chipData.name === duplicate.name }).forEach((duplicateChip, index, duplicateArray) => {
          duplicateArray[index].isAlreadyExist = true;
        });
      });
      return false;
    }
    
    if(this.chipRefList.some(chipRef => chipRef.isEmpty || chipRef.isAlreadyExist)) { 
      console.log(this.chipRefList)
      return false; 
    };
    this.isAddVisible = true;
    return true;
  }

  deleteChip(deleteChipId: Guid){
    this.chipList = this.chipList.filter(chip => {
      return !chip.tempId.equals(deleteChipId);
    });
    setTimeout(() => {
      this.isAddVisible = this.validateChips();
    }, 0);
    
  }

  addChip(){
    this.isAddVisible = false;
    this.chipList.push(new BasicElement());
  }

}
