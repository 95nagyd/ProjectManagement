import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { SpinnerService } from '@app/_services/spinner.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {

  @ViewChild('modal') modalRef: ElementRef;
  user?: User;
  state: string;
  userForm: FormGroup;
  submitted: Boolean;
  hadErrorAfterBlur: Record<string, Boolean>;
  validations: Record<string, any>;

  //TODO: modal záráskor ispassvisible false
  //TODO: modal close, ha kijelentkeztet
  //TODO: error hint
  //TODO: formcontrol
  //TODO: kötelezőségek

  isPassVisible: Boolean;
  role: Role;
  
  closeResult: string;

  constructor(private modalService: NgbModal, private spinner: SpinnerService, private formBuilder: FormBuilder) { 
    this.spinner.show();
    this.isPassVisible = false;
    this.role = Role.User;
    this.submitted = false;
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

  ngOnInit() { 
    this.spinner.hide();
  }

  open(editUser?: User) {
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
    
    this.modalService.open(this.modalRef, {ariaLabelledBy: 'modal-add', centered: true, windowClass: 'modal-holder'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  get userFormControls() { return this.userForm.controls; }

  
  save() {
    this.submitted = true;
    if (this.userForm.invalid) {
        //return;
    }
    
    //TODO: api hívás post user mentés output emit, ami a team component-ben újra lekéri majd a listát
    console.log(
      this.user._id + '\n',
      this.userFormControls.username.value + '\n',
      this.userFormControls.password.value + '\n',
      this.userFormControls.title.value + '\n',
      this.userFormControls.lastname.value + '\n',
      this.userFormControls.middlename.value + '\n',
      this.userFormControls.firstname.value + '\n',
      this.userFormControls.role.value + '\n',
      this.userFormControls.telephone.value + '\n',
      this.userFormControls.email.value + '\n'
    )

    /*
    this.authenticationService.login(this.formControls.username.value, this.formControls.password.value)
      .subscribe(() => {
              this.router.navigate(['']);
          }, error => {
              this.error = error;
              this.loading = false;
          }
      );   

    */
  }


  onFocus(controlName: string){
    if(!this.hadErrorAfterBlur[controlName]){
      this.userFormControls[controlName].clearValidators();
      this.userFormControls[controlName].updateValueAndValidity();
    }
  }

  onBlur(controlName: string){
    controlName = controlName === 'password' ? (this.state === 'edit' ? (controlName + '-edit') : controlName) : controlName;
    this.userFormControls[controlName].setValidators(this.validations[controlName]);
    this.userFormControls[controlName].updateValueAndValidity();
    this.hadErrorAfterBlur[controlName] = this.userFormControls[controlName].dirty || !!this.userFormControls[controlName].errors;
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
