import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ElementRef, HostListener, EventEmitter, Output, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormattedTimeComponent } from '@app/components/_core/working-time-calendar/formatted-time/formatted-time.component'
import { SpinnerService } from '@app/_services/spinner.service';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { CalendarService } from '@app/_services/calendar.service';
import { CalendarDayDetails, CalendarRowData, CalendarData, MonthNames, DayNames } from '@app/_models/calendar';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorkingTimeCalendarComponent implements OnInit, OnDestroy {

  @Input() isEditable: Boolean;
  @Input() user?: User;
  @Output() backFunction?: EventEmitter<void>;
  
  @ViewChild('header') header: ElementRef;
  @ViewChildren(FormattedTimeComponent) workingTimeInputList!: QueryList<FormattedTimeComponent>;
  @ViewChildren('projectComboList') projectComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('designPhaseComboList') designPhaseComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('structuralElementComboList') structuralElementComboList!: QueryList<ComboBoxComponent>;
  @ViewChildren('subtaskComboList') subtaskComboList!: QueryList<ComboBoxComponent>;

  userFullName: string;
  isInitComplete: Boolean;
  comboColWidth: number;


  daysOfMonth: CalendarDayDetails[] = [];
  isDataChanged: Boolean;
  isSavable: Boolean;



  private chosenPeriod: Date;
  period: string;
  firstPeriodTime: number;
  isPreviousChangeAvailable: boolean;

  isActualMonth: Boolean;
  actualDayNumber: number;

  periodData: CalendarData;
  calendarOldData: CalendarData;
  displayedSummary: string;

  projectList: Array<BasicElement>;
  designPhaseList: Array<BasicElement>;
  structuralElementList: Array<BasicElement>;
  subtaskList: Array<BasicElement>;
  isComboReady: boolean;

  editingComment: { dayNumber: number, dataIndex: number }
  openCommentBoxRef: any;
  isCommentEditing: Boolean;
  isCommentPreview: Boolean;
  isCommentInFocus: Boolean;
  isCommentEditingFromIcon: Boolean;
  commentValue: string;
  isNewDisplayInTimeout: Boolean;


  

  //TODO: toaster
  
  
  
  

  constructor(private spinner: SpinnerService, private scrollOffsetService: PageContentScrollOffsetService, private calendarService: CalendarService,
    private userService: UserService, private globalModalsService: GlobalModalsService, private comboBoxService: ComboBoxService,
    private basicDataService: BasicDataService, private cdRef: ChangeDetectorRef) {

    this.spinner.show();

    this.backFunction = new EventEmitter();
    this.isDataChanged = false;
    this.isSavable = false;
    this.isComboReady = false;
    this.getComboElements();
    this.chosenPeriod = new Date();
    this.chosenPeriod.setHours(0, 0, 0, 0);
    this.actualDayNumber = this.chosenPeriod.getDate();
    this.chosenPeriod.setDate(1);
    this.displayedSummary = '00:00';

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

    this.openCommentBoxRef = null;
    this.isCommentEditing = false;
    this.isCommentPreview = false;
    this.isCommentInFocus = false;
    this.isCommentEditingFromIcon = false;
    this.commentValue = "";
    this.isNewDisplayInTimeout = false;
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
      this.cdRef.detectChanges();
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
      this.cdRef.detectChanges();
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

  setPeriod() { 
    let tempDate = new Date();
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(1);
    this.isActualMonth = this.chosenPeriod.getTime() === tempDate.getTime();
    this.period = this.chosenPeriod.getFullYear().toString() + ' ' + MonthNames[this.chosenPeriod.getMonth()] 
  }

  getDaysInMonth() { return new Date(this.chosenPeriod.getFullYear(), this.chosenPeriod.getMonth() + 1, 0).getDate(); }

  async changeMonth(direction: string) {
    if ((this.isDataChanged)) {
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
        name: DayNames[tempDate.getDay()]
      });
    }
    this.updateCalendarViewData();
    this.scrollOffsetService.setOffsetY(0);
    this.closeCommentBox();
    this.spinner.hide();
  }

  private updateCalendarViewData() {
    this.spinner.show();
    if (this.user) {
      this.calendarService.getUserWorkingTimeByGivenPeriod(this.chosenPeriod.getTime(), this.user._id).pipe(take(1)).subscribe(async (result) => {
        this.periodData = result;
        this.calcDisplayedSummary();
        this.calendarOldData = _.cloneDeep<CalendarData>(this.periodData);
        this.daysOfMonth.forEach(dayData => {
          if (!this.periodData[dayData.number]) {
            this.periodData[dayData.number] = [];
            this.addEmptyRow(dayData.number);
          }
        });
        await this.calcActualChangeState();
        this.cdRef.detectChanges();
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
        this.periodData = result;
        this.calcDisplayedSummary();
        this.calendarOldData = _.cloneDeep<CalendarData>(this.periodData);
        this.daysOfMonth.forEach(dayData => {
          if (!this.periodData[dayData.number]) {
            this.periodData[dayData.number] = [];
            this.addEmptyRow(dayData.number);
          }
        });
        await this.calcActualChangeState();
        this.cdRef.detectChanges();
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

  addEmptyRow(dayNumber: number) { 
    this.periodData[dayNumber].push(new CalendarRowData()); 
  }

  deleteRow(dayNumber: number, rowIndex: number) {
    this.globalModalsService.openConfirmModal(ConfirmModalType.DELETE).then(async (isDeleteRequired) => {
      if (isDeleteRequired) {
        this.periodData[dayNumber].splice(rowIndex, 1);
        await this.calcActualChangeState();
        this.cdRef.detectChanges();
      };
      this.globalModalsService.closeConfirmModal();
    });
  }

  //#endregion

  //#region cell control

  calcDisplayedSummary() {
    let sum = 0;
    for (const [dayKey, data] of Object.entries(this.periodData)) {
      data?.forEach((dataRow: CalendarRowData) => {
        sum += dataRow.workingTime;
      });
    }
    const hours = Math.floor(sum / 60);
    const minutes = sum % 60;

    this.displayedSummary = (hours < 10 ? ('0' + hours) : hours.toString()) + ':' + (minutes < 10 ? ('0' + minutes) : minutes.toString());
  }

  async updateWorkingTime(value: number, dayNumber: number, dataIndex: number) {
    this.periodData[dayNumber][dataIndex].workingTime = value;
    await this.calcActualChangeState();
    this.calcDisplayedSummary();
    this.cdRef.detectChanges();
  }

  async updateCombo(combo: string, chosenId: string, dayNumber: number, dataIndex: number) {
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
    await this.calcActualChangeState();
    this.cdRef.detectChanges();
  }



  
  async updateComment(value: string) {
    this.periodData[this.editingComment.dayNumber][this.editingComment.dataIndex].comment = value;
    await this.calcActualChangeState();
    this.cdRef.detectChanges();
  }

  commentBoxEventHandler(event: any) {
    if (!this.isCommentEditing && this.isCommentPreview && this.isCommentInFocus && event.type === "mouseleave") {
      this.closeCommentBox();
      return;
    }
    this.isCommentInFocus = true;
    if(event.type === "click" && this.isCommentPreview && this.isEditable){
      this.switchPreviewToEdit();
    }
    this.cdRef.detectChanges();
  }

  previewComment(commentBoxRef: any, dayNumber: number, dataIndex: number) {
    if(this.periodData[dayNumber][dataIndex].comment.length === 0) { return; }
    if(this.isCommentPreview && this.openCommentBoxRef !== commentBoxRef) { 
      this.closeCommentBox();
    }
    if(!this.isCommentEditing){
      this.isCommentPreview = true;
      this.commentValue = this.periodData[dayNumber][dataIndex].comment;
      this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
      commentBoxRef.open();
      document.body.querySelector("ngb-popover-window").addEventListener('mouseenter', this.commentBoxEventHandler.bind(this));
      document.body.querySelector("ngb-popover-window").addEventListener('mouseleave', this.commentBoxEventHandler.bind(this));
      document.body.querySelector("ngb-popover-window").addEventListener('click', this.commentBoxEventHandler.bind(this));
      this.isNewDisplayInTimeout = true;
      this.openCommentBoxRef = commentBoxRef;
    }
  }

  closeCommentBox(){
    this.commentValue = "";
    this.isCommentPreview = false;
    this.isCommentEditing = false;
    this.isCommentEditingFromIcon = false;
    this.isCommentInFocus = false;
    this.isNewDisplayInTimeout = false;
    this.openCommentBoxRef?.close();
    this.openCommentBoxRef = null;
  }

  closePreviewComment() {
    if(this.commentValue.length === 0) { return; }
    this.isNewDisplayInTimeout = false;
    setTimeout(() => {
      if (this.isCommentPreview && !this.isCommentEditing && !this.isCommentInFocus && !this.isNewDisplayInTimeout) {
        this.closeCommentBox();
      }
    }, 100);
  }

  editComment(commentBoxRef: any, dayNumber: number, dataIndex: number) {
    if (!this.isEditable) { return; }
    if(this.openCommentBoxRef !== commentBoxRef) { 
      this.closeCommentBox();
    }
    if (this.isCommentEditing && commentBoxRef === this.openCommentBoxRef) { 
      this.closeCommentBox();
      return; 
    }
    this.isCommentPreview = false;
    this.isCommentEditing = true;
    this.isCommentEditingFromIcon = true;
    this.commentValue = this.periodData[dayNumber][dataIndex].comment;
    this.editingComment = { dayNumber: dayNumber, dataIndex: dataIndex }
    commentBoxRef.open();
    this.openCommentBoxRef = commentBoxRef;
    setTimeout(() => {
      this.isCommentEditingFromIcon = false;
    }, 500);
  }

  switchPreviewToEdit() {
    if (!this.isEditable) { return; }
    this.isCommentPreview = false;
    this.isCommentEditing = true;
    this.isCommentEditingFromIcon = false;
  }

  onScroll(){
    this.closeCommentBox();
  }


  //#endregion

  //#region save

  calcActualChangeState() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.isDataChanged = !(_.isEqual(this.calendarOldData, this.removeEmptyRows(this.periodData)));
        this.globalModalsService.hasChanges = this.isDataChanged;
        if(this.isDataChanged) { this.isSavable = this.isCalSavable(); }
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
    if (!this.isSavable || !this.isDataChanged) { return; }

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

  @HostListener('document:mousedown', ['$event.target'])
  public onClick(target: any) {
    if (this.openCommentBoxRef && !document.body.querySelector("ngb-popover-window").contains(target) && this.isCommentEditing && !this.isCommentEditingFromIcon) {
      this.closeCommentBox();
    }
  }
}
