import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmModalType, ConfirmModalData } from '@app/_models/modals';
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

  constructor(private modalService: NgbModal, private globalModalsService: GlobalModalsService) { 
    this.globalModalsService.register(this);
    this.confirmModalTitle = '';
    this.confirmModalContent = '';
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
  }



}
