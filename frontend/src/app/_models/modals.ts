export enum ConfirmModalType {
  Discard = 'discard',
  Delete = 'delete'
}


export const ConfirmModalData = {
  'discard' : {
    title: 'Módosítások elvetése',
    content: 'A módosításait nem mentette. Biztos benne, hogy folytatja?'
  },
  'delete' : {
    title: 'Elem törlése',
    content: 'Biztos benne, hogy törli az elemet?'
  }
}