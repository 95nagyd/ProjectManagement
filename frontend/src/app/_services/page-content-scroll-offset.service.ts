import { Injectable } from '@angular/core';
import { AppComponent } from '@app/app.component';


@Injectable({
  providedIn: 'root'
})
export class PageContentScrollOffsetService {

  private offsetY: number;
  private application: AppComponent;

  constructor() {
    this.offsetY = 0;
  }

  register(application: AppComponent) { 
    this.application = application; 
  }

  setOffsetY(offsetY: number) {
    this.offsetY = offsetY;
    this.application.setScrollTop(offsetY);
  }

  getOffsetY(): number { 
    return this.offsetY; 
  }
}
