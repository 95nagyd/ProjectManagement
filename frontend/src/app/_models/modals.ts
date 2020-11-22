//TODO: enumok nagybetűvel

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

export enum InfoModalType {
  Expired = 'expired',
  FirstUser = 'firstuser'
}

export const InfoModalData = {
  'expired' : {
    title: 'Lejárt időkeret',
    content: 'A rendelkezésre álló időkeret lejárt.\nFolytatáshoz jelentkezzen be újra.'
  },
  'firstuser' : {
    title: 'Első felhasználó',
    content: 'Az első felhasználó automatikusan hozzáadsra került.'
  }
}