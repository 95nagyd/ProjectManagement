import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';


@Component({
  selector: 'comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.css']
})
export class CommentBoxComponent implements OnInit {


  //TODO: ha rajta van az egér a megjegyzésen (vagy a cellán) akkor ne tűnjön el
  //TODO: ha meg van nyitva és más napra ráhúzom akkor ne történjen semmi
  //TODO: fade in jobbról balra
  //TODO: fade out balról jobbra
  //TODO: setposition, az előzőbe window resize listener-re ez hívódik
  //TODO: bool-ba rakni hogy kattintva van e
  //TODO: onmouse enter on mouse out
  //TODO: resizenal a naptarban ujrapocizionalja
  //TODO: ha a naptár alján van akkor másfele nyíljon

  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('commentbox') commentbox: ElementRef;
  isPreview: Boolean;
  isEditing: Boolean;
  isEditFromIcon: Boolean;
  isPreviewInFocus: Boolean;
  isNewDisplayInTimeout: Boolean;
  boxPosition: any;
  value: string;

  constructor() { 
    this.isPreview = false;
    this.isEditing = false;
    this.isEditFromIcon = false;
    this.isPreviewInFocus = false;
    this.isNewDisplayInTimeout = false;
    this.boxPosition = {x: -2000, y:-2000};
  }

  ngOnInit(): void {
  }

  preview(boxPosition: any, comment: string){
    this.isPreview = true;
    this.isEditing = false;
    this.isNewDisplayInTimeout = true;
    this.value = comment;
    this.setPosition(boxPosition);
    this.autosize();
  }
  
  edit(boxPosition: any, comment: string){
    this.isPreview = false;
    this.isEditing = true;
    this.isEditFromIcon = true;
    this.value = comment;
    this.setPosition(boxPosition);
    this.autosize();
    setTimeout(() => {
      this.isEditFromIcon = false;
    }, 500);
  }

  switchToEdit(){
    this.isPreview = false;
    this.isEditing = true;
    this.isEditFromIcon = false;
    this.autosize();
  }

  setPosition(boxPosition: any){
    setTimeout(() => {
      if(this.commentbox){
        boxPosition.x = this.commentbox.nativeElement.offsetWidth > 200 ?  (boxPosition.x - this.commentbox.nativeElement.offsetWidth -26) : boxPosition.x - 226;
        boxPosition.y -= 82;
        this.boxPosition = boxPosition;
      }
    }, 0);
  }

  hide(){
    if(this.commentbox){
      this.value = '';
      this.isPreview = false;
      this.isEditing = false;
      this.isEditFromIcon = false;
    }
  }
  
  SetPreviewInFocus(isPreviewInFocus: Boolean){
    if(!this.isEditing && this.isPreviewInFocus && !isPreviewInFocus) {
      this.hide();
    }
    this.isPreviewInFocus = isPreviewInFocus;
  }

  autosize() { 
    setTimeout(() => {
      if(this.textarea){
        let textarea = this.textarea.nativeElement;
        if(!textarea.style.height){ textarea.style.height = "30px"; }
        if(textarea.scrollHeight < 30) { return; }
        textarea.style.height = "30px";
        textarea.style.height = textarea.scrollHeight + 3 + 'px';
      }
    }, 0);
  }
}
