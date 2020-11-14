import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmModalType, ConfirmModalData, InfoModalType, InfoModalData } from '@app/_models/modals';
import { GlobalModalsService } from '@app/_services/global-modals.service';
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
  openInfoModalRef: any;

  constructor(private modalService: NgbModal, private globalModalsService: GlobalModalsService) { 
    this.globalModalsService.register(this);

    this.confirmModalTitle = '';
    this.confirmModalContent = '';
    this.openConfirmModalRef = null;

    this.infoModalTitle = '';
    this.infoModalContent = '';
    this.openInfoModalRef = null;
  }

  ngOnInit(): void {
  }

  openConfirmModal(modalType: ConfirmModalType){
    this.confirmModalTitle = ConfirmModalData[modalType].title;
    this.confirmModalContent = ConfirmModalData[modalType].content;
    this.openConfirmModalRef = this.modalService.open(this.confirmModalRef, {centered: true, windowClass: 'modal-holder confirm-modal-' + modalType, backdrop: 'static', keyboard: false});
    return this.openConfirmModalRef.result;
  }

  closeConfirmModal(){
    this.openConfirmModalRef?.close();
    this.openConfirmModalRef = null;
  }

  openInfoModal(modalType: InfoModalType){
    console.log(InfoModalData[modalType])
    this.infoModalTitle = InfoModalData[modalType].title;
    this.infoModalContent = InfoModalData[modalType].content;
    this.openInfoModalRef = this.modalService.open(this.infoModalRef, {centered: true, windowClass: 'modal-holder info-modal-' + modalType, backdrop: 'static', keyboard: false});
    return this.openInfoModalRef.result;
  }

  closeInfoModal(){
    this.openInfoModalRef?.close();
    this.openInfoModalRef = null;
  }

  isInfoModalOpen(){
    return !!this.openInfoModalRef;
  }


}
