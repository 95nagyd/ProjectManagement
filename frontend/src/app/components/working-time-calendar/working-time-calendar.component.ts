import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';

interface DayRow {
  number: string;
  name: string;
  backgroundColor: string;
}

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
  daysOfMonth: DayRow[] = [];



  fakeData = {  }

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService) { }

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
    this.hideComment();
    setTimeout(() => {
      this.spinner.hide();
    }, 700);
  }

  public changeMonth(direction: string) { 

    this.choosenPeriod.setMonth(this.choosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    
    this.setPeriod();
    this.fakeData = {}
    this.refreshCalendar();

  }

  getDaysInMonth() { return new Date(this.choosenPeriod.getFullYear(), this.choosenPeriod.getMonth()+1, 0).getDate(); }

  private updateCalendarData() {
    //ide majd api hívással lekérni a beállított hónaphoz tartozó adatokat, ami most a fakeData
    this.daysOfMonth.forEach(dayData => {
      if(!this.fakeData[dayData.number]) { 
        this.fakeData[dayData.number] = [];
        this.addRow(dayData.number); 
      }
    });
  }

  addRow(dayNumber: string) { 
    const newRow = {
      workingTime : '00:00',
      project: 'Ürömhegyi lejtő...',
      designPhase: 'Munkatársakkal...',
      structuralElement: 'aaaaaaaaaaaaaaaaaaaa',
      subtask: 'QQQQQQQQQQQQQQQQQQQQ',
      comment: 'csp egységárhoz tonna becslés tisztázás, axis modell átnézés, Zsolt VT-nek ajánlatkérés, belső egyeztetés'
    }

    this.fakeData[dayNumber].push(newRow);
  }

  deleteRow(dayNumber: string, rowIndex: number){

    //TODO: period shadow

    //TODO: nyilakra kattintás shadow
    //TODO: nyilakra hover szinezes
    
    //TODO: megjegyzés tooltip

    //TODO: havi összes munkaidő az utolsó nap után

    //TODO: saját ikon mentéshez (sima, kattintott, letiltott)

    //TODO: confirm modal törlés

    //TODO: max 10 sor adható hozzá

    //TODO: sort csak akkor lehet hozzáadni, ha van projekt és tervfázis kiválasztva

    //TODO: combó komponens

    //TODO: long text shortener ... ha a div szélessége nagyobb mint az oszlop szélessége minusz pár px

    //TODO: szabadság, betegszabadság (akkor a sor más szinű) (datpickerrel gombról megnyílik modal)

    //TODO: az első töltésig (bárkié) lehessen visszamenni

    //TODO: bevezetni az istouched-et, mentés csak akkor, ha true , elnavigálás esetén rákérdezni, hogy elveti-e a módosításait
    
    this.fakeData[dayNumber].splice(rowIndex, 1);
  }



  previewComment(comment: string, e: any) {
    if(this.commentbox && !this.commentbox.isEditing){
      let position = { 
        x: e.target.getBoundingClientRect().x,  
        y: e.target.getBoundingClientRect().y + this.scrollOffsetService.getOffsetY()
      };
      this.commentbox.preview(position, comment);
    }
  }

  editComment(comment: string, e: any) {
    if(this.commentbox && this.commentbox.isEditing) { this.commentbox.hide(); return; }
    if(this.commentbox){
      let position = { 
        x: e.target.getBoundingClientRect().x,  
        y: e.target.getBoundingClientRect().y + this.scrollOffsetService.getOffsetY()
      };
      this.commentbox.edit(position, comment);
    }
  }

  hideComment() {
    if(this.commentbox){
      this.commentbox.isNewDisplayInTimeout = false;
      setTimeout(() => {
        if(this.commentbox && this.commentbox.isPreview && !this.commentbox.isEditing && !this.commentbox.isPreviewInFocus && !this.commentbox.isNewDisplayInTimeout){ 
          this.commentbox.hide(); 
        }
      }, 300);
    }
  }


  isCalDataValid(){
    return  !this.workingTimeInputList.some(workingTimeInput => workingTimeInput.isValid === false);
  }

  saveCalendar(){
    console.log(this.isCalDataValid())
  }



}
