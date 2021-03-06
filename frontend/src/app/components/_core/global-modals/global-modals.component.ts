import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmModalType, ConfirmModalData, InfoModalType, InfoModalData } from '@app/_models/modals';
import { ComboBoxService } from '@app/_services/combo-box.service';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { SpinnerService } from '@app/_services/spinner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'global-modals',
  templateUrl: './global-modals.component.html',
  styleUrls: ['./global-modals.component.css']
})
export class GlobalModalsComponent implements OnInit {

  @ViewChild('confirmModal') confirmModalRef: ElementRef;
  confirmModalTitle: string;
  confirmModalContent: string;
  openConfirmModalRef: any;

  @ViewChild('infoModal') infoModalRef: ElementRef;
  infoModalTitle: string;
  infoModalContent: string;
  infoModalAdditionalContent: string;
  openInfoModalRef: any;

  @ViewChild('errorModal') errorModalRef: ElementRef;
  errorModalContent: any;
  openErrorModalRef: any;

  @ViewChild('warningModal') warningModalRef: ElementRef;
  warningModalContent: any;
  openWarningModalRef: any;

  constructor(private modalService: NgbModal, private globalModalsService: GlobalModalsService, private comboBoxService: ComboBoxService, private spinner: SpinnerService) {
    this.globalModalsService.register(this);

    this.confirmModalTitle = '';
    this.confirmModalContent = '';
    this.openConfirmModalRef = null;

    this.infoModalTitle = '';
    this.infoModalContent = '';
    this.infoModalAdditionalContent = '';
    this.openInfoModalRef = null;

    this.errorModalContent = '';
    this.openErrorModalRef = null;

    this.warningModalContent = '';
    this.openWarningModalRef = null;
  }

  ngOnInit(): void {
  }

  openConfirmModal(modalType: ConfirmModalType) {
    this.confirmModalTitle = ConfirmModalData[modalType].title;
    this.confirmModalContent = ConfirmModalData[modalType].content;
    this.openConfirmModalRef = this.modalService.open(this.confirmModalRef, { centered: true, windowClass: 'modal-holder confirm-modal-' + modalType, backdrop: 'static', keyboard: false });
    return this.openConfirmModalRef.result;
  }

  closeConfirmModal() {
    this.openConfirmModalRef?.close();
    this.openConfirmModalRef = null;
  }





  openInfoModal(modalType: InfoModalType, additionalContent?: string) {
    this.comboBoxService.externalCloseComboAndHideDropdown();
    this.infoModalTitle = InfoModalData[modalType].title;
    this.infoModalContent = InfoModalData[modalType].content;
    this.infoModalAdditionalContent = additionalContent;
    this.spinner.forceHide();
    this.openInfoModalRef = this.modalService.open(this.infoModalRef, { centered: true, windowClass: 'modal-holder info-modal', backdrop: 'static', keyboard: false });
    return this.openInfoModalRef.result;
  }

  openCustomInfoModal(title: string, content: string) {
    this.comboBoxService.externalCloseComboAndHideDropdown();
    this.infoModalTitle = title;
    this.infoModalContent = content;
    this.spinner.forceHide();
    this.openInfoModalRef = this.modalService.open(this.infoModalRef, { centered: true, windowClass: 'modal-holder info-modal', backdrop: 'static', keyboard: false });
    return this.openInfoModalRef.result;
  }

  closeInfoModal() {
    this.openInfoModalRef?.close();
    this.openInfoModalRef = null;
    this.infoModalAdditionalContent = '';
  }

  isInfoModalOpen() {
    return !!this.openInfoModalRef;
  }





  openErrorModal(content: any) {
    this.comboBoxService.externalCloseComboAndHideDropdown();
    this.errorModalContent = content.toString() === "[object Object]" ? JSON.stringify(content) : content.toString();
    this.spinner.forceHide();
    this.openErrorModalRef = this.modalService.open(this.errorModalRef, { centered: true, windowClass: 'modal-holder error-modal', backdrop: 'static', keyboard: false });
    return this.openErrorModalRef.result;
  }

  closeErrorModal() {
    this.openErrorModalRef?.close();
    this.openErrorModalRef = null;
  }

  isErrorModalOpen() {
    return !!this.openErrorModalRef;
  }


  openWarningModal(content: any) {
    this.comboBoxService.externalCloseComboAndHideDropdown();
    this.warningModalContent = content.toString() === "[object Object]" ? JSON.stringify(content) : content.toString();
    this.spinner.forceHide();
    this.openWarningModalRef = this.modalService.open(this.warningModalRef, { centered: true, windowClass: 'modal-holder warning-modal', backdrop: 'static', keyboard: false });
    return this.openWarningModalRef.result;
  }

  closeWarningModal() {
    this.openWarningModalRef?.close();
    this.openWarningModalRef = null;
  }

  isWarningModalOpen() {
    return !!this.openWarningModalRef;
  }


}
