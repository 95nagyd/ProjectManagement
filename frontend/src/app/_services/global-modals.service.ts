import { Injectable } from '@angular/core';
import { GlobalModalsComponent } from '@app/components/_core/global-modals/global-modals.component';
import { ConfirmModalType, InfoModalType } from '@app/_models/modals';

@Injectable({
  providedIn: 'root'
})
export class GlobalModalsService {

  private globalModals: GlobalModalsComponent;

  hasChanges: Boolean;

  constructor() { 
    this.hasChanges = false;
  }

  register(globalModals: GlobalModalsComponent){
    this.globalModals = globalModals;
  }

  closeAllModal(){
    this.hasChanges = false;
    this.globalModals?.closeConfirmModal();
    this.globalModals?.closeInfoModal();
    this.globalModals?.closeErrorModal();
    this.globalModals?.closeWarningModal();
  }

  openConfirmModal(modalType: ConfirmModalType): Promise<any>{
    return this.globalModals.openConfirmModal(modalType);
  }

  closeConfirmModal(){
    this.globalModals?.closeConfirmModal();
  }

  openInfoModal(modalType: InfoModalType, additionalContent?: string): Promise<any>{
    return this.globalModals.openInfoModal(modalType, additionalContent);
  }

  openCustomInfoModal(title: string, content: string): Promise<any>{
    return this.globalModals.openCustomInfoModal(title, content);
  }

  closeInfoModal(){
    this.globalModals?.closeInfoModal();
  }

  isInfoModalOpen(){
    return this.globalModals.isInfoModalOpen();
  }

  openErrorModal(conent: any): Promise<any>{
    return this.globalModals.openErrorModal(conent);
  }

  closeErrorModal(){
    this.globalModals?.closeErrorModal();
  }

  isErrorModalOpen(){
    return this.globalModals.isErrorModalOpen();
  }

  openWarningModal(conent: any): Promise<any>{
    return this.globalModals.openWarningModal(conent);
  }

  closeWarningModal(){
    this.globalModals?.closeWarningModal();
  }

  isWarningModalOpen(){
    return this.globalModals.isWarningModalOpen();
  }

}
