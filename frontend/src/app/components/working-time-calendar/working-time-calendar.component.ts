import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';

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
  @ViewChild('cal')
  cal: ElementRef;

  private choosenPeriod: Date;
  isInitComplete: Boolean;
  yearMonth: string;
  monthNames: string[];
  dayNames: string[];
  daysOfMonth: DayRow[] = [];
  calcWidth: number;

  fakeData = {  }

  constructor(private spinner: SpinnerService) { }

  ngOnInit(): void { 
    this.spinner.show();

    this.choosenPeriod = new Date();
    this.choosenPeriod.setDate(1);

    this.monthNames = ['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december'];

    this.dayNames = ['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];

    this.setYearMonth();
    this.refreshCalendar();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isInitComplete = true;
      this.calcWidth = this.cal.nativeElement.offsetWidth - 445;
    }, 0);
    this.spinner.hide();
  }

  @Input() isEditable: Boolean;
  
  setYearMonth() { this.yearMonth = this.choosenPeriod.getFullYear().toString() + ' ' + this.monthNames[this.choosenPeriod.getMonth()] }


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
    
    setTimeout(() => {
      this.spinner.hide();
    }, 700);
  }

  public changeMonth(direction: string) { 

    this.choosenPeriod.setMonth(this.choosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1)); 
    
    this.setYearMonth();
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
      structuralElement: 'kiegyenlítő...',
      subtask: 'mennyiségszámí...',
      comment: 'sa'
    }

    this.fakeData[dayNumber].push(newRow);
  }

  deleteRow(dayNumber: string, rowIndex: number){
    //TODO: confirm modal
    //TODO: max 10 sor
    //TODO: combó komponens
    //TODO: megjegyzés modal

    //TODO: rogzíteni a mentést, éás az egész chooseperiod , floppy jobb oldalt
    //TODO: havi összes munkaidő az utolsó nap után
    //TODO: maradék oszlopok  projektek szélesek , megjegyzés látszódjon
    //TODO: szabadság (akkor a sor más szinű)
    //TODO: kell e előre menni a naptárban, ha igen akkor szerkeszthető-e?
    //TODO: vissza lehessen menni (az első töltésig (berkié)) vissza szerkeszthető

    //TODO: oszlop szélesságek ugyanakkorák legyenek
    //TODO: mentés ikon
    //TODO: calendar valtaskor scroll
    //TODO: ne ugráljanak a nyilak hónap váltásakor
    this.fakeData[dayNumber].splice(rowIndex, 1);
  }



  saveCalendar(){
    let areWorkingTimesValid = !this.workingTimeInputList.some(workingTimeInput => workingTimeInput.isValid === false);
    console.log(areWorkingTimesValid)
  }



  @HostListener('window:resize')
  onResize() {
    this.calcWidth = this.cal.nativeElement.offsetWidth - 445;
  }
}
