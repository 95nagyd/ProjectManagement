import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PageContentScrollOffsetService } from '@app/_services/page-content-scroll-offset.service';
import { WorkingTimeCalendarService } from '@app/_services/working-time-calendar.service';
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.css']
})
export class CommentBoxComponent implements OnInit {


  @Input() isDisabled: Boolean;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('commentbox') commentbox: ElementRef;
  @Output() update: EventEmitter<string>;

  isVisible: Boolean;
  isPreview: Boolean;
  isEditing: Boolean;
  isEditFromIcon: Boolean;
  isCommentInFocus: Boolean;
  isNewDisplayInTimeout: Boolean;
  commentIcon: any;
  boxPosition: any;
  value: string;

  constructor(private scrollOffsetService: PageContentScrollOffsetService) { 
  
    this.update = new EventEmitter();
    this.isVisible = false;
    this.isPreview = false;
    this.isEditing = false;
    this.isEditFromIcon = false;
    this.isCommentInFocus = false;
    this.isNewDisplayInTimeout = false;
    this.commentIcon = null;
    this.boxPosition = {x: -2000, y:-2000, triangle: 'top'};
  }

  ngOnInit(): void {
  }

  preview(commentIcon: any, comment: string){
    this.isVisible = false;
    this.isPreview = true;
    this.isEditing = false;
    this.isNewDisplayInTimeout = true;
    this.commentIcon = commentIcon;
    this.value = comment;
    this.setPosition();
    this.autosize();
  }
  
  edit(commentIcon: any, comment: string){
    this.isVisible = false;
    this.isPreview = false;
    this.isEditing = true;
    this.isEditFromIcon = true;
    this.commentIcon = commentIcon;
    this.value = comment;
    this.setPosition();
    this.autosize();
    setTimeout(() => {
      this.isEditFromIcon = false;
    }, 500);
  }

  switchToEdit(){
    if(this.isDisabled) return;
    this.isPreview = false;
    this.isEditing = true;
    this.isEditFromIcon = false;
    this.autosize();
  }

  setPosition(){
    setTimeout(() => {
      if(this.commentbox && this.commentIcon){
        let position = { 
          x: this.commentIcon.getBoundingClientRect().x,  
          y: this.commentIcon.getBoundingClientRect().y + this.scrollOffsetService.getOffsetY(),
          triangle: ''
        };
        position.triangle = position.y < 200 ? 'top' : 'middle';
        position.x = this.commentbox.nativeElement.offsetWidth > 200 ?  (position.x - this.commentbox.nativeElement.offsetWidth -26) : position.x - 226;
        position.y = position.y - (position.triangle === 'top' ? 82 : 89)
        this.boxPosition = position;
        this.isVisible = true;
      }
    }, 0);
  }

  hide(){
    if(this.commentbox){
      this.isVisible = false;
      this.value = '';
      this.isPreview = false;
      this.isEditing = false;
      this.isEditFromIcon = false;
      this.commentIcon = null;
    }
  }
  
  SetCommentInFocus(isCommentInFocus: Boolean){
    if(!this.isEditing && this.isCommentInFocus && !isCommentInFocus) {
      this.hide();
    }
    this.isCommentInFocus = isCommentInFocus;
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

  updateValue(value: any) {
    this.update.emit(value);
  }

  @HostListener('window:resize')
  onResize() {
    if(this.isVisible){
      this.setPosition();
      this.autosize();
    }
  }
}
