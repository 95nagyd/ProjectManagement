import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { SpinnerService } from '@app/_services/spinner.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {

  @ViewChild('modal') modalRef: ElementRef;
  

  state: string;

  //TODO: modal záráskor ispassvisible false
  //TODO: modal close, ha kijelentkeztet
  //TODO: error hint
  //TODO: formcontrol
  //TODO: kötelezőségek

  isPassVisible: Boolean;
  role: Role;
  
  closeResult: string;

  constructor(private modalService: NgbModal, private spinner: SpinnerService) { 
    this.isPassVisible = false;
    this.role = Role.User;
  }

  ngOnInit() { }

  open(editUser?: User) {
    this.state = editUser ? 'edit' : 'add'
    
    this.modalService.open(this.modalRef, {ariaLabelledBy: 'modal-add', centered: true, windowClass: 'custom-class'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  


}
