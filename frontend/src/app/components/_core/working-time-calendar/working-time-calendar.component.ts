import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/_core/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { WorkingTimeCalendarService } from '@app/_services/working-time-calendar.service';
import { CalendarDayDetails } from '@app/_models/calendarDayDetails';
import { CalendarDayData } from '@app/_models/calendarDayData';

@Component({
  selector: 'working-time-calendar',
  templateUrl: './working-time-calendar.component.html',
  styleUrls: ['./working-time-calendar.component.css']
})

export class WorkingTimeCalendarComponent implements OnInit {

  @ViewChildren(FormattedTimeComponent) workingTimeInputList!: QueryList<FormattedTimeComponent>;

  private choosenPeriod: Date;
  isInitComplete: Boolean;
  period: string;
  monthNames: string[];
  dayNames: string[];
  daysOfMonth: CalendarDayDetails[] = [];
  calendarData: CalendarDayData[] = [];

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService, 
    private calendarService: WorkingTimeCalendarService) { 
    }

  ngOnInit(): void { 
    this.spinner.show();

    this.choosenPeriod = new Date();
    this.choosenPeriod.setDate(1);

    this.monthNames = ['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december'];

    this.dayNames = ['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];

    this.setPeriod();
    this.refreshCalendar();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isInitComplete = true;
    }, 0);
    this.spinner.hide();
  }

  @Input() isEditable: Boolean;
  @ViewChild('commentbox') commentbox: CommentBoxComponent;

  setPeriod() { this.period = this.choosenPeriod.getFullYear().toString() + ' ' + this.monthNames[this.choosenPeriod.getMonth()] }

  refreshCalendar() {
    this.spinner.show();
    this.daysOfMonth = [];
    for(let dayIndex = 1; dayIndex <= this.getDaysInMonth(); dayIndex++){
      let tempDate = new Date(this.choosenPeriod);
      tempDate.setDate(dayIndex);
      this.daysOfMonth.push({
         number : (dayIndex < 10 ? '0'+dayIndex : dayIndex.toString()), 
         name : this.dayNames[tempDate.getDay()],
         backgroundColor : dayIndex % 2 == 0 ? 'rgb(243, 243, 243)' : 'rgb(218, 218, 218)'
      });
    }
    this.updateCalendarData();
    this.scrollOffsetService.setOffsetY(0);
    if(this.commentbox) { this.commentbox.hide(); }
    setTimeout(() => {
      this.spinner.hide();
    }, 700);
  }

  public changeMonth(direction: string) { 

    this.choosenPeriod.setMonth(this.choosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    
    this.setPeriod();
    this.refreshCalendar();

  }

  getDaysInMonth() { return new Date(this.choosenPeriod.getFullYear(), this.choosenPeriod.getMonth()+1, 0).getDate(); }

  private updateCalendarData() {
    //ide majd api hívással lekérni a beállított hónaphoz tartozó adatokat, ami most a fakeData
    this.calendarData = this.calendarService.getCalendarDataDataAccessOperation(this.choosenPeriod);
    this.daysOfMonth.forEach(dayData => {
      if(!this.calendarData[dayData.number]) { 
        this.calendarData[dayData.number] = [];
        this.addEmptyRow(dayData.number); 
      }
    });
  }

  addEmptyRow(dayNumber: string) {
    const newRow: CalendarDayData = {
      workingTime : '',
      project: 'Ürömhegyi lejtő...',
      designPhase: 'Munkatársakkal...',
      structuralElement: 'aaaaaaaaaaaaaaaaaaaa',
      subtask: 'QQQQQQQQQQQQQQQQQQQQ',
      comment: 'csp egységárhoz tonna becslés tisztázás, axis modell átnézés, Zsolt VT-nek ajánlatkérés, belső egyeztetés'
    }

    this.calendarData[dayNumber].push(newRow);
  }

  deleteRow(dayNumber: string, rowIndex: number){

    //TODO: saját ikon mentéshez (sima, kattintott, letiltott)

    //TODO: havi összes munkaidő az utolsó nap után (legalább annyi hely kell , hogy az utolsó nap max magasságos tooltipje kiférjen)

    

    //TODO: confirm modal törlés

    //TODO: max 10 sor adható hozzá

    //TODO: sort csak akkor lehet hozzáadni, ha van projekt és tervfázis kiválasztva

    //TODO: combó komponens

    //TODO: long text shortener ... ha a div szélessége nagyobb mint az oszlop szélessége minusz pár px

    //TODO: szabadság, betegszabadság (akkor a sor más szinű) (datpickerrel gombról megnyílik modal)

    //TODO: az első töltésig (bárkié) lehessen visszamenni

    //TODO: bevezetni az istouched-et, mentés csak akkor, ha true , elnavigálás esetén rákérdezni, hogy elveti-e a módosításait

    //TODO: kitalálni, hogy az üres sorok nem kiválasztott kötelező értékeivel mi legyen
    
    this.calendarService.getCalendarActualData()[dayNumber].splice(rowIndex, 1);
  }



  previewComment(dataPosition: any, e: any) {
    if(this.commentbox && !this.commentbox.isEditing){
      this.commentbox.preview(e.target, dataPosition);
    }
  }

  editComment(dataPosition: any, e: any) {
    if(!this.isEditable) return;
    if(this.commentbox && this.commentbox.isEditing) { this.commentbox.hide(); return; }
    if(this.commentbox){
      this.commentbox.edit(e.target, dataPosition);
    }
  }

  hideComment() {
    if(this.commentbox){
      this.commentbox.isNewDisplayInTimeout = false;
      setTimeout(() => {
        if(this.commentbox && this.commentbox.isPreview && !this.commentbox.isEditing && !this.commentbox.isCommentInFocus && !this.commentbox.isNewDisplayInTimeout){ 
          this.commentbox.hide(); 
        }
      }, 100);
    }
  }


  isCalDataValid(){
    return  !this.workingTimeInputList.some(workingTimeInput => workingTimeInput.isValid === false);
  }

  saveCalendar(){
    if(!this.isEditable || !this.isCalDataValid()) { return; }
    console.log(this.isCalDataValid())
    console.log(this.calendarData)
  }
}