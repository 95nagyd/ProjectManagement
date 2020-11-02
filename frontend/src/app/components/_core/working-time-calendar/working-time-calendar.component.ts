import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/_core/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { WorkingTimeCalendarService } from '@app/_services/working-time-calendar.service';
import { CalendarDayDetails, CalendarDayData, CalendarData } from '@app/_models/calendar';
import { ComboBoxService } from '@app/_services/combo-box.service';
import * as _ from 'lodash-es';
import { ComboBoxComponent } from '../combo-box/combo-box.component';

@Component({
  selector: 'working-time-calendar',
  templateUrl: './working-time-calendar.component.html',
  styleUrls: ['./working-time-calendar.component.css'],
})

export class WorkingTimeCalendarComponent implements OnInit {

  @Input() isEditable: Boolean;
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

    //TODO: settimeout-ok helyett ngzone run kipróbálás this._ngZone.runOutsideAngular(_ => {  //code });
    //TODO: ngAfterViewInit helyet ngAfterViewInitChecked-ben kipróbálni settimeout nélkül
  

    //TODO: havi összes munkaidő az utolsó nap után (legalább annyi hely kell , hogy az utolsó nap max magasságos tooltipje kiférjen)

    //TODO: confirm modal sor törléskor

    //TODO: pipe-ok ahol lehet, hogy ne pörögjön annyiszor a changedetection

    
    

    //TODO: szabadság, betegszabadság (akkor a sor más szinű) (datpickerrel gombról megnyílik modal)
    //TODO: az első töltésig (bárkié) lehessen visszamenni
    //TODO: képek css-ből legyenek

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService, 
    private calendarService: WorkingTimeCalendarService, private comboBoxService: ComboBoxService) { 
    }

  ngOnInit(): void { 
    this.spinner.show();

    //ezek majd api hívások az adminservice-ből
      this.projectList = ['Project1', 'Project2', 'Project3', 'Project11'];
      this.designPhaseList = ['DesignPhase1', 'DesignPhase2', 'DesignPhase3'];
      this.structuralElementList = ['StructuralElement1', 'StructuralElement2', 'StructuralElement3', 'StructuralElement4'];
      this.subtaskList = ['Subtask1', 'Subtask2', 'Subtask3', 'Subtask4', 'Subtask5'];

    this.chosenPeriod = new Date();
    this.chosenPeriod.setDate(1);

    this.monthNames = ['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december'];

    this.dayNames = ['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];

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

  refreshCalendar() {
    this.spinner.show();
    this.daysOfMonth = [];
    const daysInMonth = this.getDaysInMonth();
    for(let dayIndex = 1; dayIndex <= daysInMonth; dayIndex++){
      let tempDate = new Date(this.chosenPeriod);
      tempDate.setDate(dayIndex);
      this.daysOfMonth.push({
         number : dayIndex, 
         name : this.dayNames[tempDate.getDay()],
         backgroundColor : dayIndex % 2 == 0 ? 'rgb(243, 243, 243)' : 'rgb(218, 218, 218)'
      });
    }
    this.updateCalendarViewData();
    this.scrollOffsetService.setOffsetY(0);
    if(this.commentbox) { this.commentbox.hide(); }
    this.comboBoxService.externalCloseDropdown();

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  changeMonth(direction: string) { 
    this.chosenPeriod.setMonth(this.chosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    this.setPeriod();
    this.refreshCalendar();
  }

  private updateCalendarViewData() {
    //ide majd api hívással lekérni a beállított hónaphoz tartozó adatokat, ami most a fakeData
    this.calendarViewData = this.calendarService.getCalendarDataDataAccessOperation(this.chosenPeriod);
    this.calendarOldData = _.cloneDeep<CalendarData>(this.calendarViewData);
    this.daysOfMonth.forEach(dayData => {
      if(!this.calendarViewData[dayData.number]) { 
        this.calendarViewData[dayData.number] = [];
        this.addEmptyRow(dayData.number); 
      }
    });
  }

  addEmptyRow(dayNumber: number) { this.calendarViewData[dayNumber].push(new CalendarDayData()); }

  deleteRow(dayNumber: number, rowIndex: number){ 
    this.calendarService.getCalendarActualData()[dayNumber].splice(rowIndex, 1); 
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
    return !(_.isEqual(this.calendarOldData, this.removeEmptyRows(_.cloneDeep(this.calendarViewData))));
  }

  removeEmptyRows(data: CalendarData){
    const daysInMonth = this.getDaysInMonth();
    for(let dayIndex = 1; dayIndex <= daysInMonth; dayIndex++){
      data[dayIndex] = data[dayIndex].filter(dataRow => {
        return !this.isDataRowEmpty(dataRow);
      });
      if(data[dayIndex].length < 1) { delete data[dayIndex]; }
    }
    return data;
  }

  isDataRowEmpty(dataRow: CalendarDayData){
    return (dataRow.workingTime === '00:00' && !dataRow.project && !dataRow.designPhase && !dataRow.structuralElement && !dataRow.subtask && !dataRow.comment);
  }
  
  validateCalendar(){
    if(this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)) { return false; };
    let temp: CalendarData = _.cloneDeep<CalendarData>(this.calendarViewData);
    this.removeEmptyRows(temp);
    let isCalValid = true;
    for (const [dayKey, data] of Object.entries(temp)) {
      data.forEach((dataRow: CalendarDayData, index: number) => {
        if(dataRow.workingTime !== '00:00' || dataRow.project || dataRow.designPhase || dataRow.structuralElement || dataRow.subtask || dataRow.comment){
          const dayText = (parseInt(dayKey) < 10 ? '0' + dayKey : dayKey) + '.';
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
    return this.isInitComplete && this.isEditable 
      && (!this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)
      && !this.projectComboList.some(projectCombo => projectCombo.hasError === true)
      && !this.designPhaseComboList.some(designPhaseCombo => designPhaseCombo.hasError === true))
  }

  saveCalendar(){
    if(!this.isCalSavable() || !this.isCalendarDataChanged()){ return; }
    this.spinner.show();

    if(!this.validateCalendar()){
      //TODO: Kérem javítsa a hibás mezőket! toaster

      this.spinner.hide();
      return;
    }
    
    let saveData = _.cloneDeep<CalendarData>(this.calendarViewData);
    this.removeEmptyRows(saveData);
    
    console.log(JSON.parse(JSON.stringify(saveData)))
    
    this.updateCalendarViewData();
    this.spinner.hide();
  }

  //#endregion

  @HostListener('window:resize')
  onResize() {
    this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
  }
}
