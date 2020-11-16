import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { SpinnerService } from '@app/_services/spinner.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@app/_services/user.service';
import { GlobalModalsService } from '@app/_services/global-modals.service';
import { ConfirmModalType } from '@app/_models/modals';
import { Observable } from 'rxjs';


@Component({
  selector: 'user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit, OnDestroy {

  @ViewChild('modal') modalRef: ElementRef;
  @Output() onClose: EventEmitter<string>;
  user?: User;
  state: string;
  userForm: FormGroup;
  hadErrorAfterBlur: Record<string, Boolean>;
  validations: Record<string, any>;
  openUserModalRef: any;


  //TODO: jelszó karakterek validáció
  //TODO: inputok felett padding
  //TODO: enterre lose focus

  isPassVisible: Boolean;
  role: Role;
  
  

  constructor(private modalService: NgbModal, private globalModalsService: GlobalModalsService, private spinner: SpinnerService, private formBuilder: FormBuilder, 
    private userService: UserService, private _ngZone: NgZone) { 
    this.spinner.show();
    this.onClose = new EventEmitter();
    this.isPassVisible = false;
    this.role = Role.User;
    this.hadErrorAfterBlur = {
      'username' : false,
      'password' : false,
      'title' : false,
      'lastname' : false,
      'middlename' : false,
      'firstname' : false,
      'telephone' : false,
      'email' : false
    };
    this.validations = {
      'username' : [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
      'password-edit' : [Validators.minLength(6), Validators.maxLength(20)],
      'password' : [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
      'title' : [Validators.maxLength(20)],
      'lastname' : [Validators.required, Validators.maxLength(20)],
      'middlename' : [Validators.maxLength(15)],
      'firstname' : [Validators.required, Validators.maxLength(15)],
      'telephone' : [Validators.pattern('^\\+36 [(]{1}(\\d{1,2})[)]{1} (\\d{3}) (\\d{4})\\s*|\\+36 (\\d{1,2}) (\\d{3}) (\\d{4})\\s*$')],
      'email' : [Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.openUserModalRef?.close();
  }

  ngAfterViewInit() {
    this.spinner.hide();
  }

  open(editUser?: User) {
    this.isPassVisible = false;
    this.hadErrorAfterBlur = {
      'username' : false,
      'password' : false,
      'title' : false,
      'lastname' : false,
      'middlename' : false,
      'firstname' : false,
      'telephone' : false,
      'email' : false
    };
    console.log("open")
    this.state = editUser ? 'edit' : 'add';
    this.user = editUser ? editUser : new User();

    this.userForm = this.formBuilder.group({
      username: [{value: this.user.username, disabled: !!editUser}, this.validations['username']],
      password: [this.user.password, editUser ? this.validations['password-edit'] : this.validations['password']],
      title: [this.user.title, this.validations['title']],
      lastname: [this.user.lastName,  this.validations['lastname']],
      middlename: [this.user.middleName, this.validations['middlename']],
      firstname: [this.user.firstName, this.validations['firstname']],
      role: [this.user.role],
      telephone: [this.user.telephone, this.validations['telephone']],
      email: [this.user.email, this.validations['email']]
    });
    
    this.openUserModalRef = this.modalService.open(this.modalRef, {ariaLabelledBy: 'modal-add', centered: true, windowClass: 'modal-holder user-modal',
    beforeDismiss: () => {
      if(!this.userForm.dirty){ this.onClose.emit(); return true; }

      return this.globalModalsService.openConfirmModal(ConfirmModalType.Discard).then((result) => {
        if(result) { this.onClose.emit(); };
        this.globalModalsService.closeConfirmModal();
        return result;
      });
    }});
    
  }

  get userFormControls() { return this.userForm.controls; }

  
  save() {
    //TODO: HA kivan töltve a kötelező és az utolsóba kattintok akkor ne legyen elérhető a save

    console.log("save")
    this.spinner.show();

    let userToSave = new User();
    userToSave._id = this.user._id;
    userToSave.username = this.userFormControls.username.value.trim();
    userToSave.password = this.userFormControls.password.value.trim();
    userToSave.title = this.userFormControls.title.value.trim();
    userToSave.lastName = this.userFormControls.lastname.value.trim();
    userToSave.middleName = this.userFormControls.middlename.value.trim();
    userToSave.firstName = this.userFormControls.firstname.value.trim();
    userToSave.role = this.userFormControls.role.value.trim();
    userToSave.telephone = this.userFormControls.telephone.value.trim();
    userToSave.email = this.userFormControls.email.value.trim();

    console.log(userToSave);

    this.userService.saveUser(userToSave).subscribe(() => {
      //TODO: sikeres mentés toaster
      console.log("sikeres mentés toaster")
      this.onClose.emit();
      this.openUserModalRef.close();
      this.spinner.hide();
    }, error => {
      if(error.code === 11000){
        this.userFormControls.username.setErrors({notUnique: true});
      } else {
        if(!this.globalModalsService.isErrorModalOpen()){
          this.globalModalsService.openErrorModal(error).then(() => {
          this.globalModalsService.closeErrorModal();
        });
      }
      }
      this.spinner.forceHide();
    });
  }


  onFocus(controlName: string){
    if(!this.hadErrorAfterBlur[controlName]){
      this.userFormControls[controlName].clearValidators();
      this.userFormControls[controlName].updateValueAndValidity();
    }
  }

  onBlur(controlName: string){
    const validationField = controlName === 'password' ? (this.state === 'edit' ? (controlName + '-edit') : controlName) : controlName;

    this.userFormControls[controlName].setValidators(this.validations[validationField]);
    this.userFormControls[controlName].updateValueAndValidity();
    this.hadErrorAfterBlur[controlName] = this.userFormControls[controlName].dirty || !!this.userFormControls[controlName].errors;
  }


}
