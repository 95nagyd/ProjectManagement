import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { CommentBoxComponent } from '@app/components/_core/working-time-calendar/comment-box/comment-box.component';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { CalendarService } from '@app/_services/calendar.service';
import { CalendarDayDetails, CalendarRowData, CalendarData } from '@app/_models/calendar';
import { ComboBoxService } from '@app/_services/combo-box.service';
import * as _ from 'lodash-es';
import { ComboBoxComponent } from '../combo-box/combo-box.component';
import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { ConfirmModalType } from '@app/_models/modals';
import { BasicDataService } from '@app/_services/basic-data.service';
import { BasicElement } from '@app/_models/basic-data';
import { take } from 'rxjs/operators';

@Component({
  selector: 'working-time-calendar',
  templateUrl: './working-time-calendar.component.html',
  styleUrls: ['./working-time-calendar.component.css'],
})

export class WorkingTimeCalendarComponent implements OnInit, OnDestroy {

  @Input() isEditable: Boolean;
  @Input() user?: User;
  @Output() backFunction?: EventEmitter<void>;

  @ViewChild('commentbox') commentbox: CommentBoxComponent;
  @ViewChild('header') header: ElementRef;
  @ViewChildren(FormattedTimeComponent) workingTimeInputList!: QueryList<FormattedTimeComponent>;
  @ViewChildren('projectComboList') projectComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('designPhaseComboList') designPhaseComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('structuralElementComboList') structuralElementComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('subtaskComboList') subtaskComboList!: QueryList<ComboBoxComponent>;

  userFullName: string;
  isInitComplete: Boolean;
  comboColWidth: number;


  monthNames: string[];
  dayNames: string[];
  daysOfMonth: CalendarDayDetails[] = [];
  isDataChanged: Boolean;


  private chosenPeriod: Date;
  period: string;
  firstPeriodTime: number;
  isPreviousChangeAvailable: boolean;

  periodData: CalendarData;
  calendarOldData: CalendarData;

  projectList: Array<BasicElement>;
  designPhaseList: Array<BasicElement>;
  structuralElementList: Array<BasicElement>;
  subtaskList: Array<BasicElement>;
  isComboReady: boolean;

  editingComment: { dayNumber: number, dataIndex: number }

  //TODO: toaster


  //TODO: alul kiférjen a legnagyobb message
  //TODO: havi összes munkaidő az utolsó nap után (legalább annyi hely kell , hogy az utolsó nap max magasságos tooltipje kiférjen), frontenden szamolodik 
  //TODO: aktuális napra színes keret

  //TODO: képek css-ből legyenek (login, és nevbar)

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService, private calendarService: CalendarService,
    private userService: UserService, private globalModalsService: GlobalModalsService, private comboBoxService: ComboBoxService,
    private basicDataService: BasicDataService) {

    this.spinner.show();

    this.backFunction = new EventEmitter();
    this.isDataChanged = false;
    this.isComboReady = false;
    this.getComboElements();
    this.chosenPeriod = new Date();
    this.chosenPeriod.setHours(0, 0, 0, 0);
    this.chosenPeriod.setDate(1);

    this.firstPeriodTime = this.chosenPeriod.getTime();
    this.isPreviousChangeAvailable = false;

    this.spinner.show();
    this.calendarService.getFirstSavedPeriod().pipe(take(1)).subscribe((firstPeriod) => {
      if (firstPeriod !== -1 && firstPeriod < this.chosenPeriod.getTime()) {
        this.firstPeriodTime = firstPeriod;
        this.isPreviousChangeAvailable = this.firstPeriodTime < this.chosenPeriod.getTime();
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.forceHide();
      if (!this.globalModalsService.isErrorModalOpen()) {
        this.globalModalsService.openErrorModal(error.message).then(() => {
          this.globalModalsService.closeErrorModal();
        });
      }
    });

    //TODO: ezt model-be
    this.monthNames = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

    this.dayNames = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];

  }

  ngOnInit(): void {
    this.userFullName = this.user ? this.userService.getFullName(this.user) : '';
    this.setPeriod();
    this.refreshCalendar();
  }

  ngOnDestroy() {
    this.comboBoxService.externalCloseComboAndHideDropdown();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isInitComplete = true;
      this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
      this.spinner.hide();
    }, 0);
  }

  getComboElements() {
    this.spinner.show();
    this.basicDataService.getAllBasicElements().pipe(take(1)).subscribe((result) => {
      this.projectList = result.projects;
      this.designPhaseList = result.designPhases;
      this.structuralElementList = result.structuralElements;
      this.subtaskList = result.subtasks;
      this.isComboReady = true;
      this.spinner.hide();
    }, (error) => {
      this.spinner.forceHide();
      if (!this.globalModalsService.isErrorModalOpen()) {
        this.globalModalsService.openErrorModal(error.message).then(() => {
          this.globalModalsService.closeErrorModal();
        });
      }
    });
  }

  //#region calendar control

  setPeriod() { this.period = this.chosenPeriod.getFullYear().toString() + ' ' + this.monthNames[this.chosenPeriod.getMonth()] }

  getDaysInMonth() { return new Date(this.chosenPeriod.getFullYear(), this.chosenPeriod.getMonth() + 1, 0).getDate(); }

  async changeMonth(direction: string) {
    if ((await this.getActualChangeState())) {
      this.globalModalsService.openConfirmModal(ConfirmModalType.DISCARD).then((isDiscardRequired) => {
        if (isDiscardRequired) {
          this.doChange(direction);
        }
        this.globalModalsService.closeConfirmModal();
      });
    } else {
      this.doChange(direction);
    }
  }
  private doChange(direction: string) {
    this.spinner.show();
    this.getComboElements();
    this.chosenPeriod.setMonth(this.chosenPeriod.getMonth() + (direction === 'previous' ? -1 : 1));
    this.isPreviousChangeAvailable = this.firstPeriodTime < this.chosenPeriod.getTime();
    this.periodData = null;
    this.setPeriod();
    this.refreshCalendar();
    this.spinner.hide();
  }

  refreshCalendar() {
    this.spinner.show();
    this.daysOfMonth = [];
    const daysInMonth = this.getDaysInMonth();
    for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
      let tempDate = new Date(this.chosenPeriod);
      tempDate.setDate(dayIndex + 1);
      this.daysOfMonth.push({
        number: dayIndex,
        name: this.dayNames[tempDate.getDay()]
      });
    }
    this.updateCalendarViewData();
    this.scrollOffsetService.setOffsetY(0);
    if (this.commentbox) { this.commentbox.hide(); }
    this.spinner.hide();
  }

  private updateCalendarViewData() {
    this.spinner.show();
    if (this.user) {
      this.calendarService.getUserWorkingTimeByGivenPeriod(this.chosenPeriod.getTime(), this.user._id).pipe(take(1)).subscribe(async (result) => {
        this.periodData = result;
        this.calendarOldData = _.cloneDeep<CalendarData>(this.periodData);
        this.daysOfMonth.forEach(dayData => {
          if (!this.periodData[dayData.number]) {
            this.periodData[dayData.number] = [];
            this.addEmptyRow(dayData.number);
          }
        });
        this.getActualChangeState();
        this.spinner.hide();
      }, (error) => {
        this.spinner.forceHide();
        if (!this.globalModalsService.isErrorModalOpen()) {
          this.globalModalsService.openErrorModal(error.message).then(() => {
            this.globalModalsService.closeErrorModal();
          });
        }
      });
    } else {
      this.calendarService.getUserWorkingTimeByGivenPeriod(this.chosenPeriod.getTime()).pipe(take(1)).subscribe(async (result) => {
        console.log(result)
        
        this.periodData = result;
        this.calendarOldData = _.cloneDeep<CalendarData>(this.periodData);

        this.daysOfMonth.forEach(dayData => {
          if (!this.periodData[dayData.number]) {
            this.periodData[dayData.number] = [];
            this.addEmptyRow(dayData.number);
          }
        });
        this.getActualChangeState();
        this.spinner.hide();
      }, (error) => {
        this.spinner.forceHide();
        if (!this.globalModalsService.isErrorModalOpen()) {
          this.globalModalsService.openErrorModal(error.message).then(() => {
            this.globalModalsService.closeErrorModal();
          });
        }
      });
    }
  }

  back() {
    this.backFunction.emit();
  }

  addEmptyRow(dayNumber: number) { this.periodData[dayNumber].push(new CalendarRowData()); }

  deleteRow(dayNumber: number, rowIndex: number) {
    this.globalModalsService.openConfirmModal(ConfirmModalType.DELETE).then(async (isDeleteRequired) => {
      if (isDeleteRequired) {
        this.periodData[dayNumber].splice(rowIndex, 1);
        this.getActualChangeState();
      };
      this.globalModalsService.closeConfirmModal();
    });
  }

  //#endregion

  //#region cell control

  updateWorkingTime(value: number, dayNumber: number, dataIndex: number) {
    this.periodData[dayNumber][dataIndex].workingTime = value;
    this.getActualChangeState();
  }

  updateCombo(combo: string, chosenId: string, dayNumber: number, dataIndex: number) {
    switch (combo) {
      case 'project': {
        this.periodData[dayNumber][dataIndex].projectId = chosenId;
        break;
      }
      case 'designPhase': {
        this.periodData[dayNumber][dataIndex].designPhaseId = chosenId;
        break;
      }
      case 'structuralElement': {
        this.periodData[dayNumber][dataIndex].structuralElementId = chosenId;
        break;
      }
      case 'subtask': {
        this.periodData[dayNumber][dataIndex].subtaskId = chosenId;
        break;
      }
    }
    this.getActualChangeState();
  }

  updateComment(value: string) {
    this.periodData[this.editingComment.dayNumber][this.editingComment.dataIndex].comment = value;
    this.getActualChangeState();
  }

  previewComment(e: any, dayNumber: number, dataIndex: number) {
    if (this.commentbox && !this.commentbox.isEditing) {
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.preview(e.target, this.periodData[dayNumber][dataIndex].comment);
    }
  }

  editComment(e: any, dayNumber: number, dataIndex: number) {
    if (!this.isEditable) return;
    if (this.commentbox && this.commentbox.isEditing) { this.commentbox.hide(); return; }
    if (this.commentbox) {
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      this.commentbox.edit(e.target, this.periodData[dayNumber][dataIndex].comment);
    }
  }

  hideComment() {
    if (this.commentbox) {
      this.commentbox.isNewDisplayInTimeout = false;
      setTimeout(() => {
        if (this.commentbox && this.commentbox.isPreview && !this.commentbox.isEditing && !this.commentbox.isCommentInFocus && !this.commentbox.isNewDisplayInTimeout) {
          this.commentbox.hide();
          this.editingComment = { dayNumber: -1, dataIndex: -1 }
        }
      }, 100);
    }
  }

  //#endregion

  //#region save

  getActualChangeState() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.isDataChanged = !(_.isEqual(this.calendarOldData, this.removeEmptyRows(this.periodData)));
        this.globalModalsService.hasChanges = this.isDataChanged;
        resolve(this.isDataChanged);
      }, 0);
    });
    
  }

  removeEmptyRows(data: CalendarData) {
    const daysInMonth = this.getDaysInMonth();
    let temp = _.cloneDeep<CalendarData>(data);
    let clearedData: CalendarData = {};
    for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
      temp[dayIndex] = temp[dayIndex].filter(dataRow => {
        return !this.isDataRowEmpty(dataRow);
      });
      if (temp[dayIndex].length > 0) {
        clearedData[dayIndex] = temp[dayIndex];
      } else {
        delete clearedData[dayIndex];
      }
    }
    return clearedData;
  }

  isDataRowEmpty(dataRow: CalendarRowData) {
    return (dataRow.workingTime == 0 && !dataRow.projectId && !dataRow.designPhaseId && !dataRow.structuralElementId && !dataRow.subtaskId && !dataRow.comment);
  }

  validateCalendar() {
    if (this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)) { return false; };
    let temp: CalendarData = this.removeEmptyRows(this.periodData);

    let isCalValid = true;
    for (const [dayKey, data] of Object.entries(temp)) {
      data?.forEach((dataRow: CalendarRowData, index: number) => {
        if (dataRow.workingTime != 0 || dataRow.projectId || dataRow.designPhaseId || dataRow.structuralElementId || dataRow.subtaskId || dataRow.comment) {
          const dayNumber = parseInt(dayKey) + 1
          const dayText = (dayNumber < 10 ? '0' + dayNumber.toString() : dayNumber.toString()) + '.';
          if (!dataRow.projectId) {
            isCalValid = false;
            this.projectComboList.filter(projectCombo =>
              projectCombo.elementRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild.firstChild.textContent
              === dayText
            )[index].hasError = true;
          }
          if (!dataRow.designPhaseId) {
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

  isCalSavable() {
    return this.isInitComplete && this.isEditable && this.periodData
      && (!this.workingTimeInputList.some(workingTimeInput => workingTimeInput.hasError === true)
        && !this.projectComboList.some(projectCombo => projectCombo.hasError === true)
        && !this.designPhaseComboList.some(designPhaseCombo => designPhaseCombo.hasError === true)
        && !this.structuralElementComboList.some(structuralElementCombo => structuralElementCombo.hasError === true)
        && !this.subtaskComboList.some(subtaskCombo => subtaskCombo.hasError === true))
  }

  async saveCalendar() {
    if (!this.isCalSavable() || !(await this.getActualChangeState())) { return; }

    if (!this.validateCalendar()) {
      if (!this.globalModalsService.isWarningModalOpen()) {
        this.globalModalsService.openWarningModal('Mentés előtt kérem javítsa a hibás mezőket.').then(() => {
          this.getComboElements();
          this.globalModalsService.closeWarningModal();
        });
      }
      return;
    }

    this.spinner.show();
    let saveData = this.removeEmptyRows(this.periodData);
    this.calendarService.saveWorkingTime(this.chosenPeriod.getTime(), saveData).pipe(take(1)).subscribe((data) => {
      //TODO: toaster mentés
      this.getComboElements();
      this.updateCalendarViewData();
      this.spinner.hide();
    }, error => {
      this.spinner.forceHide();
      if (error?.code === 404) {
        if (!this.globalModalsService.isWarningModalOpen()) {
          this.globalModalsService.openWarningModal(error.message).then(() => {
            this.getComboElements();
            this.globalModalsService.closeWarningModal();
          });
        }
        return;
      }
      if (!this.globalModalsService.isErrorModalOpen()) {
        this.globalModalsService.openErrorModal(error.message).then(() => {
          this.globalModalsService.closeErrorModal();
        });
      }
    });
  }

  //#endregion

  @HostListener('window:resize')
  onResize() {
    this.comboColWidth = (this.header.nativeElement.getBoundingClientRect().width - 445) * 0.25;
  }
}
