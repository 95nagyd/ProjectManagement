import { Injectable } from '@angular/core';
import { GlobalModalsComponent } from '@app/components/_core/global-modals/global-modals.component';
import { ConfirmModalType, InfoModalType } from '@app/_models/modals';

@Injectable({
  providedIn: 'root'
})
export class GlobalModalsService {

  private globalModals: GlobalModalsComponent;

  constructor() { }

  register(globalModals: GlobalModalsComponent){
    this.globalModals = globalModals;
  }

  openConfirmModal(modalType: ConfirmModalType): Promise<any>{
    return this.globalModals.openConfirmModal(modalType);
  }

  closeConfirmModal(){
    this.globalModals?.closeConfirmModal();
  }

  openInfoModal(modalType: InfoModalType): Promise<any>{
    return this.globalModals.openInfoModal(modalType);
  }

  closeInfoModal(){
    this.globalModals?.closeInfoModal();
  }

  isInfoModalOpen(){
    return this.globalModals.isInfoModalOpen();
  }


}
