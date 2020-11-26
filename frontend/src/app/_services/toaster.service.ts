import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private _snackBar: MatSnackBar) { }

  saveSuccess(){
    this._snackBar.open('Sikeres mentés!', null, {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['green-snackbar']
    });
  }
}
