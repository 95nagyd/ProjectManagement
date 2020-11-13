export enum ModalType {
  Discard = 'discard',
  Delete = 'delete'
}

export interface ModalData {
  title: string;
  content: string;
}


export const ModalTypeData = {
  'discard' : {
    title: 'Módosítások elvetése',
    content: 'A módosításait nem mentette. Biztos benne, hogy folytatja?'
  },
  'delete' : {
    title: 'Elem törlése',
    content: 'Biztos benne, hogy törli az elemet?'
  }
}