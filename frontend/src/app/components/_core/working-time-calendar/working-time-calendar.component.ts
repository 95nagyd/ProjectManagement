import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/_core/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { CalendarService } from '@app/_services/calendar.service';
import { CalendarDayDetails, CalendarDayData, CalendarData } from '@app/_models/calendar';
import { ComboBoxService } from '@app/_services/combo-box.service';
import * as _ from 'lodash-es';
import { ComboBoxComponent } from '../combo-box/combo-box.component';
import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';

@Component({
  selector: 'working-time-calendar',
  templateUrl: './working-time-calendar.component.html',
  styleUrls: ['./working-time-calendar.component.css'],
})

export class WorkingTimeCalendarComponent implements OnInit {

  @Input() isEditable: Boolean;
  @Input() user?: User;

  userFullName: string;

  @ViewChild('commentbox') commentbox: CommentBoxComponent;
  @ViewChild('header') header: ElementRef;
  @ViewChildren(FormattedTimeComponent) workingTimeInputList!: QueryList<FormattedTimeComponent>;
  @ViewChildren('projectComboList') projectComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('designPhaseComboList') designPhaseComboList!: QueryList<ComboBoxComponent>;
  
  isInitComplete: Boolean;
  monthNames: string[];
  dayNames: string[];
  daysOfMonth: CalendarDayDetails[] = [];


  private chosenPeriod: Date;
  period: string;

  comboColWidth: number;
  
  calendarViewData: CalendarData;
  calendarOldData: CalendarData;

  projectList: string[];
  designPhaseList: string[];
  structuralElementList: string[];
  subtaskList: string[];
  editingComment: { dayNumber: number, dataIndex: number }


  //TODO: munkaidő millisec-be legyen tárolva
  //TODO: menüváltáskor is zárja a combo-t
  //TODO: ha látszik a spinnek akkor click preventdefault
  //TODO: aktuális napra színes keret
  //TODO: naptár szürke színeket kicsit kékebbé

    //TODO: havi összes munkaidő az utolsó nap után (legalább annyi hely kell , hogy az utolsó nap max magasságos tooltipje kiférjen)

    //TODO: confirm modal sor törléskor

    
    

    //TODO: szabadság, betegszabadság (akkor a sor más szinű) (datpickerrel gombról megnyílik modal)
    //TODO: az első töltésig (bárkié) lehessen visszamenni
    //TODO: képek css-ből legyenek

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService, 
    private calendarService: CalendarService, private userService: UserService) { 
      
      
      this.spinner.show();
      this.calendarService.getFirstSavedPeriod().subscribe((firstPeriod) => {
        console.log("firstPeriod:"+ firstPeriod)
        this.spinner.hide();
      }, (error) => {
        alert("nem sikerült lekérdezni az első mentett időszakot")
        this.spinner.forceHide();
      });

      //TODO: ezek majd api hívások az adminservice-ből
      this.projectList = ['Project1', 'Project2', 'Project3', 'Project11'];
      this.designPhaseList = ['DesignPhase1', 'DesignPhase2', 'DesignPhase3'];
      this.structuralElementList = ['StructuralElement1', 'StructuralElement2', 'StructuralElement3', 'StructuralElement4'];
      this.subtaskList = ['Subtask1', 'Subtask2', 'Subtask3', 'Subtask4', 'Subtask5'];

      this.chosenPeriod = new Date();
      this.chosenPeriod.setHours(0,0,0,0);
      this.chosenPeriod.setDate(1);

      this.monthNames = ['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december'];

      this.dayNames = ['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];

    }

  ngOnInit(): void { 
    this.spinner.show();
    this.userFullName = this.user ? this.userService.getFullName(this.user) : '';
    this.setPeriod();
    this.refreshCalendar();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isInitComplete = true;
      this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
    }, 0);
    this.spinner.hide();
  }

  //#region calendar control
  
  setPeriod() { this.period = this.chosenPeriod.getFullYear().toString() + ' ' + this.monthNames[this.chosenPeriod.getMonth()] }

  getDaysInMonth() { return new Date(this.chosenPeriod.getFullYear(), this.chosenPeriod.getMonth()+1, 0).getDate(); }

  changeMonth(direction: string) {
    //TODO: ide validáció, hogy ha változott akkor modal kérdezzen, hogy elveti e a módosításait 
    this.spinner.show();
    this.chosenPeriod.setMonth(this.chosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    this.calendarViewData = null;
    this.setPeriod();
    this.refreshCalendar();
    this.spinner.hide();
  }

  refreshCalendar() {
    this.spinner.show();
    this.daysOfMonth = [];
    const daysInMonth = this.getDaysInMonth();
    for(let dayIndex = 0; dayIndex < daysInMonth; dayIndex++){
      let tempDate = new Date(this.chosenPeriod);
      tempDate.setDate(dayIndex+1);
      this.daysOfMonth.push({
         number : dayIndex, 
         name : this.dayNames[tempDate.getDay()],
         backgroundColor : dayIndex % 2 == 1 ? 'rgb(243, 243, 243)' : 'rgb(218, 218, 218)'
      });
    }
    this.updateCalendarViewData();
    this.scrollOffsetService.setOffsetY(0);
    if(this.commentbox) { this.commentbox.hide(); }
    this.spinner.hide();
  }

  private updateCalendarViewData() {
    this.spinner.show();
    if(this.user){
      this.calendarService.getUserWorkingTimeByGivenPeriod(this.chosenPeriod.getTime(), this.user._id).subscribe((workingTime) => {
        this.calendarViewData = workingTime;
        this.calendarOldData = _.cloneDeep<CalendarData>(this.calendarViewData);
        this.daysOfMonth.forEach(dayData => {
          if(!this.calendarViewData[dayData.number]) { 
            this.calendarViewData[dayData.number] = [];
            this.addEmptyRow(dayData.number); 
          }
        });
        this.spinner.hide();
      }, (error) => {
        alert("nem sikerült lekérdezni a hónaphoz tartozó adatokat")
        this.spinner.forceHide();
      });
    } else {
      this.calendarService.getUserWorkingTimeByGivenPeriod(this.chosenPeriod.getTime()).subscribe((workingTime) => {
        this.calendarViewData = workingTime;
        this.calendarOldData = _.cloneDeep<CalendarData>(this.calendarViewData);
        this.daysOfMonth.forEach(dayData => {
          if(!this.calendarViewData[dayData.number]) { 
            this.calendarViewData[dayData.number] = [];
            this.addEmptyRow(dayData.number); 
          }
        });
        this.spinner.hide();
      }, (error) => {
        alert("nem sikerült lekérdezni a hónaphoz tartozó adatokat")
        this.spinner.forceHide();
      });
    }
  }

  addEmptyRow(dayNumber: number) { this.calendarViewData[dayNumber].push(new CalendarDayData()); }

  deleteRow(dayNumber: number, rowIndex: number){ 
    this.calendarViewData[dayNumber].splice(rowIndex, 1); 
  }

  //#endregion

  //#region cell control

  updateWorkingTime(value: string, dayNumber: number, dataIndex: number){
    this.calendarViewData[dayNumber][dataIndex].workingTime = value;
  }

  updateCombo(combo: string, chosen: string, dayNumber: number, dataIndex: number){
    switch(combo) { 
      case 'project': { 
        this.calendarViewData[dayNumber][dataIndex].project = chosen;
         break; 
      } 
      case 'designPhase': { 
        this.calendarViewData[dayNumber][dataIndex].designPhase = chosen;
         break; 
      } 
      case 'structuralElement': { 
        this.calendarViewData[dayNumber][dataIndex].structuralElement = chosen;
         break; 
      } 
      case 'subtask': { 
        this.calendarViewData[dayNumber][dataIndex].subtask = chosen;
         break; 
      }
    }
  }

  updateComment(value: string){
    this.calendarViewData[this.editingComment.dayNumber][this.editingComment.dataIndex].comment = value;
  }

  previewComment(e: any, dayNumber: number, dataIndex: number) {
    if(this.commentbox && !this.commentbox.isEditing){
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.preview(e.target, this.calendarViewData[dayNumber][dataIndex].comment);
    }
  }

  editComment(e: any, dayNumber: number, dataIndex: number) {
    if(!this.isEditable) return;
    if(this.commentbox && this.commentbox.isEditing) { this.commentbox.hide(); return; }
    if(this.commentbox){
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.edit(e.target, this.calendarViewData[dayNumber][dataIndex].comment);
    }
  }

  hideComment() {
    if(this.commentbox){
      this.commentbox.isNewDisplayInTimeout = false;
      setTimeout(() => {
        if(this.commentbox && this.commentbox.isPreview && !this.commentbox.isEditing && !this.commentbox.isCommentInFocus && !this.commentbox.isNewDisplayInTimeout){ 
          this.commentbox.hide(); 
          this.editingComment = { dayNumber: -1, dataIndex: -1 }
        }
      }, 100);
    }
  }
  
  //#endregion

  //#region save

  isCalendarDataChanged(){
    return !(_.isEqual(this.calendarOldData, this.removeEmptyRows(this.calendarViewData)));
  }

  removeEmptyRows(data: CalendarData){
    const daysInMonth = this.getDaysInMonth();
    let temp = _.cloneDeep<CalendarData>(data);
    let clearedData: CalendarData = [];
    let isAllEmpty = true;
    for(let dayIndex = 0; dayIndex < daysInMonth; dayIndex++){
      temp[dayIndex] = temp[dayIndex].filter(dataRow => {
        return !this.isDataRowEmpty(dataRow);
      });
      if(temp[dayIndex].length > 0) { 
        clearedData[dayIndex] = temp[dayIndex]; 
        isAllEmpty = false;
      } else {
        clearedData[dayIndex] = null;
      }
    }
    return isAllEmpty ? [] : clearedData;
  }

  isDataRowEmpty(dataRow: CalendarDayData){
    return (dataRow.workingTime === '00:00' && !dataRow.project && !dataRow.designPhase && !dataRow.structuralElement && !dataRow.subtask && !dataRow.comment);
  }
  
  validateCalendar(){
    if(this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)) { return false; };
    let temp: CalendarData = this.removeEmptyRows(this.calendarViewData);
    let isCalValid = true;
    for (const [dayKey, data] of Object.entries(temp)) {
      data?.forEach((dataRow: CalendarDayData, index: number) => {
        if(dataRow.workingTime !== '00:00' || dataRow.project || dataRow.designPhase || dataRow.structuralElement || dataRow.subtask || dataRow.comment){
          const dayNumber = parseInt(dayKey)+1
          const dayText = (dayNumber < 10 ? '0' + dayNumber.toString() : dayNumber.toString()) + '.';
          if(!dataRow.project){
            isCalValid = false;
            this.projectComboList.filter(projectCombo => 
              projectCombo.elementRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild.firstChild.textContent 
                === dayText
            )[index].hasError = true;
          }
          if(!dataRow.designPhase){
            isCalValid = false;
            this.designPhaseComboList.filter(designPhaseCombo => 
              designPhaseCombo.elementRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild.firstChild.textContent 
                === dayText
            )[index].hasError = true;
          }
        }
      });
    }
    return isCalValid;
  }

  isCalSavable(){
    return this.isInitComplete && this.isEditable && this.calendarViewData 
      && (!this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)
      && !this.projectComboList.some(projectCombo => projectCombo.hasError === true)
      && !this.designPhaseComboList.some(designPhaseCombo => designPhaseCombo.hasError === true))
  }

  saveCalendar(){
    if(!this.isCalSavable() || !this.isCalendarDataChanged()){ return; }

    if(!this.validateCalendar()){
      //TODO: Kérem javítsa a hibás mezőket! toaster
      return;
    }
    
    let saveData = this.removeEmptyRows(this.calendarViewData);
    
    this.calendarService.saveWorkingTime(this.chosenPeriod.getTime(), saveData).subscribe((data) => {
      //TODO: toaster
      console.log("sikeres mentés toaster")
      this.updateCalendarViewData();
    }, error => {
      //TODO: toaster
      console.log("nem siker toaster")
    });
  }

  //#endregion

  @HostListener('window:resize')
  onResize() {
    this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
  }
}
