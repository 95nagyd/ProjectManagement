import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BasicElement } from '@app/_models/basic-data';
import { ConfirmModalType } from '@app/_models/modals';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity:0}),
        animate(300, style({opacity:1})) 
      ]),
      transition(':leave', [
        animate(150, style({opacity:0})) 
      ])
    ])
  ]
})
export class ChipComponent implements OnInit {

  //TODO: chip árnyék

  @Input() chipData: BasicElement;
  @Output() validate: EventEmitter<ChipComponent>;
  @Output() remove: EventEmitter<Guid>;
  @ViewChild('name') nameRef: ElementRef;
  isEditing: boolean;
  isNew: boolean;
  isEmpty: boolean;
  isAlreadyExist: boolean;
  isInUse: boolean;

  constructor(private globalModalsService: GlobalModalsService) {
    this.validate = new EventEmitter();
    this.remove = new EventEmitter();
    this.isEditing = false;
    this.isEmpty = false;
    this.isAlreadyExist = false;
    this.isInUse = false;
  }

  ngOnInit(): void {
    this.isNew = !this.chipData.name;
    if(this.isNew) { 
      this.toggleEditing();
    }
  }

  ngAfterViewInit(){
    console.log("validate")
  }

  toggleEditing(){
    this.isEmpty = false;
    this.isAlreadyExist = false;

    if(!this.isEditing){
      setTimeout(() => {
        this.nameRef.nativeElement.focus();
        this.nameRef.nativeElement.textContent = this.nameRef.nativeElement.textContent.trim();
        if(this.nameRef.nativeElement.textContent){
          var range = document.createRange();
          var sel = window.getSelection();
          range.setStart(this.nameRef.nativeElement.childNodes[0], this.nameRef.nativeElement.textContent.length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    }
    if(this.isEditing) { this.rename(); }
    this.isEditing = !this.isEditing;
  }

  rename(){
    if(this.nameRef.nativeElement.textContent.trim().length === 0){
      if(this.isNew) { this.delete(); return; }
      this.isEmpty = true; 
    }
    if(this.isNew) this.isNew = false;
    this.chipData.name = this.nameRef.nativeElement.textContent;
    this.validate.emit();
  }

  delete(){
    let isForced = false;
    if(this.isNew && this.nameRef.nativeElement.textContent.trim().length === 0) { isForced = true; }
    this.isEditing = false;
    if(isForced){
      this.remove.emit(this.chipData.tempId);
      return;
    }

    this.globalModalsService.openConfirmModal(ConfirmModalType.Delete).then((isDeleteRequired) => {
      if(isDeleteRequired) {
        this.remove.emit(this.chipData.tempId);
      };
      this.globalModalsService.closeConfirmModal();
    });
  }

  onKeypress(event){
    if(event.key === 'Enter') { 
      this.isEditing = false;
      this.rename();
    }
  }

  onPaste(event){
    event.preventDefault();
    console.log(event.clipboardData.getData('text/plain'))
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain').trim());
  }

}
