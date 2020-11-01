import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/_core/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { WorkingTimeCalendarService } from '@app/_services/working-time-calendar.service';
import { CalendarDayDetails, CalendarDayData, CalendarData } from '@app/_models/calendar';
import { ComboBoxService } from '@app/_services/combo-box.service';

@Component({
  selector: 'working-time-calendar',
  templateUrl: './working-time-calendar.component.html',
  styleUrls: ['./working-time-calendar.component.css']
})

export class WorkingTimeCalendarComponent implements OnInit {

  @ViewChildren(FormattedTimeComponent) workingTimeInputList!: QueryList<FormattedTimeComponent>;

  private chosenPeriod: Date;
  isInitComplete: Boolean;
  comboColWidth: number;
  period: string;
  monthNames: string[];
  dayNames: string[];
  daysOfMonth: CalendarDayDetails[] = [];
  calendarData: CalendarData;
  projectList: string[];
  designPhaseList: string[];
  structuralElementList: string[];
  subtaskList: string[];
  editingComment: { dayNumber: number, dataIndex: number }

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

  @Input() isEditable: Boolean;
  @ViewChild('commentbox') commentbox: CommentBoxComponent;
  @ViewChild('header') header: ElementRef;

  setPeriod() { this.period = this.chosenPeriod.getFullYear().toString() + ' ' + this.monthNames[this.chosenPeriod.getMonth()] }

  refreshCalendar() {
    this.spinner.show();
    this.daysOfMonth = [];
    for(let dayIndex = 1; dayIndex <= this.getDaysInMonth(); dayIndex++){
      let tempDate = new Date(this.chosenPeriod);
      tempDate.setDate(dayIndex);
      this.daysOfMonth.push({
         number : dayIndex, 
         name : this.dayNames[tempDate.getDay()],
         backgroundColor : dayIndex % 2 == 0 ? 'rgb(243, 243, 243)' : 'rgb(218, 218, 218)'
      });
    }
    this.updateCalendarData();
    this.scrollOffsetService.setOffsetY(0);
    if(this.commentbox) { this.commentbox.hide(); }
    this.comboBoxService.externalCloseDropdown();

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  public changeMonth(direction: string) { 

    this.chosenPeriod.setMonth(this.chosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    
    this.setPeriod();
    this.refreshCalendar();

  }

  getDaysInMonth() { return new Date(this.chosenPeriod.getFullYear(), this.chosenPeriod.getMonth()+1, 0).getDate(); }

  private updateCalendarData() {
    //ide majd api hívással lekérni a beállított hónaphoz tartozó adatokat, ami most a fakeData
    this.calendarData = this.calendarService.getCalendarDataDataAccessOperation(this.chosenPeriod);
    this.daysOfMonth.forEach(dayData => {
      if(!this.calendarData[dayData.number]) { 
        this.calendarData[dayData.number] = [];
        this.addEmptyRow(dayData.number); 
      }
    });
  }

  addEmptyRow(dayNumber: number) {
    this.calendarData[dayNumber].push(new CalendarDayData());
  }

  deleteRow(dayNumber: number, rowIndex: number){
    

    //TODO: calendar mentéskor sorokat validáli, ha valami nem jó akkor az ahhoz tartozó elem haserror true 

    

    //TODO: havi összes munkaidő az utolsó nap után (legalább annyi hely kell , hogy az utolsó nap max magasságos tooltipje kiférjen)

    //TODO: confirm modal sor törléskor

    //TODO: max 10 sor adható hozzá

    //TODO: sort csak akkor lehet hozzáadni, ha van projekt és tervfázis kiválasztva

    

    //TODO: long text shortener ... 

    //TODO: szabadság, betegszabadság (akkor a sor más szinű) (datpickerrel gombról megnyílik modal)

    //TODO: az első töltésig (bárkié) lehessen visszamenni

    //TODO: bevezetni az istouched-et, mentés csak akkor, ha true (mozogjon a mentés), elnavigálás esetén rákérdezni, hogy elveti-e a módosításait

    

    //TODO: kitalálni, hogy az üres sorok nem kiválasztott kötelező értékeivel mi legyen (dto-n belül lesz metódus)
    
    this.calendarService.getCalendarActualData()[dayNumber].splice(rowIndex, 1);
  }

  updateWorkingTime(value: string, dayNumber: number, dataIndex: number){
    this.calendarData[dayNumber][dataIndex].workingTime = value;
  }

  updateCombo(combo: string, chosen: string, dayNumber: number, dataIndex: number){
    switch(combo) { 
      case 'project': { 
        this.calendarData[dayNumber][dataIndex].project = chosen;
         break; 
      } 
      case 'designPhase': { 
        this.calendarData[dayNumber][dataIndex].designPhase = chosen;
         break; 
      } 
      case 'structuralElement': { 
        this.calendarData[dayNumber][dataIndex].structuralElement = chosen;
         break; 
      } 
      case 'subtask': { 
        this.calendarData[dayNumber][dataIndex].subtask = chosen;
         break; 
      }
    }
  }


  previewComment(e: any, dayNumber: number, dataIndex: number) {
    if(this.commentbox && !this.commentbox.isEditing){
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.preview(e.target, this.calendarData[dayNumber][dataIndex].comment);
    }
  }

  editComment(e: any, dayNumber: number, dataIndex: number) {
    if(!this.isEditable) return;
    if(this.commentbox && this.commentbox.isEditing) { this.commentbox.hide(); return; }
    if(this.commentbox){
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.edit(e.target, this.calendarData[dayNumber][dataIndex].comment);
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

  updateComment(value: string){
    this.calendarData[this.editingComment.dayNumber][this.editingComment.dataIndex].comment = value;
  }


  isCalDataValid(){
    return  !this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true);
    //kiszedni az indexét hogy meyik projekt és tervfázis sorba van érték, és egyeznie kell az indexeknek + az értéknek benne kell lennie a choicesben, ahol nem egyezik ott haserror-t beállítani truera
    //csak akkorhibás akkor, ha close után nincs a choices között
  }

  isCalSavable(){
    return this.isInitComplete && this.isEditable && this.isCalDataValid()
  }

  saveCalendar(){
    if(!this.isCalSavable()) { return; }
    console.log(this.isCalDataValid())
    console.log(JSON.parse(JSON.stringify(this.calendarData)))
  }

  @HostListener('window:resize')
  onResize() {
    this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
  }
}
