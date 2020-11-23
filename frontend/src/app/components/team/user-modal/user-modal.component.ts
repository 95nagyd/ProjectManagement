import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { SpinnerService } from '@app/_services/spinner.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  validations: Record<string, any>;
  openUserModalRef: any;


  isPassVisible: Boolean;
  role: Role;

  patterns: Record<string, RegExp>;



  constructor(private modalService: NgbModal, private globalModalsService: GlobalModalsService, private spinner: SpinnerService, private formBuilder: FormBuilder,
    private userService: UserService, private _ngZone: NgZone) {
    this.spinner.show();
    this.onClose = new EventEmitter();
    this.isPassVisible = false;
    this.role = Role.User;

    this.patterns = {
      'username': new RegExp('^[a-zA-Z0-9]*$'),
      'password': new RegExp('^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐUÚÜŰ@$!%*#?&]*$'),
      'title': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
      'lastname': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
      'middlename': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
      'firstname': new RegExp('^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐUÚÜŰ .-]*$'),
      'telephone': new RegExp('^(?=.{14,15}$)\\+36 (\\d{2}) (\\d{3}) (\\d{3,4})$'),
      'email': new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    };
    this.validations = {
      'username': [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(this.patterns['username'])],
      'password-edit': [Validators.minLength(6), Validators.maxLength(20), Validators.pattern(this.patterns['password'])],
      'password': [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(this.patterns['password'])],
      'title': [Validators.maxLength(20), Validators.pattern(this.patterns['title'])],
      'lastname': [Validators.required, Validators.maxLength(20), Validators.pattern(this.patterns['lastname'])],
      'middlename': [Validators.maxLength(15), Validators.pattern(this.patterns['middlename'])],
      'firstname': [Validators.required, Validators.maxLength(15), Validators.pattern(this.patterns['firstname'])],
      'telephone': [Validators.pattern(this.patterns['telephone'])],
      'email': [Validators.pattern(this.patterns['email'])]
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

    this.state = editUser ? 'edit' : 'add';
    this.user = editUser ? editUser : new User();

    this.userForm = this.formBuilder.group({
      username: [{ value: this.user.username, disabled: !!editUser }, this.validations['username']],
      password: [this.user.password, editUser ? this.validations['password-edit'] : this.validations['password']],
      title: [this.user.title, this.validations['title']],
      lastname: [this.user.lastName, this.validations['lastname']],
      middlename: [this.user.middleName, this.validations['middlename']],
      firstname: [this.user.firstName, this.validations['firstname']],
      role: [this.user.role],
      telephone: [this.user.telephone, this.validations['telephone']],
      email: [this.user.email, this.validations['email']]
    });

    this.openUserModalRef = this.modalService.open(this.modalRef, {
      ariaLabelledBy: 'modal-add', centered: true, windowClass: 'modal-holder user-modal',
      beforeDismiss: () => {
        if (!this.userForm.dirty) { this.onClose.emit(); return true; }

        return this.globalModalsService.openConfirmModal(ConfirmModalType.Discard).then((isDiscardRequired) => {
          if (isDiscardRequired) {
            this.onClose.emit();
          };
          this.globalModalsService.closeConfirmModal();
          return isDiscardRequired;
        });
      }
    });

  }

  get userFormControls() { return this.userForm.controls; }


  save() {
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
      this.onClose.emit();
      this.openUserModalRef.close();
      this.spinner.hide();
    }, error => {
      this.spinner.forceHide();
      if (error?.message?.code === 11000) {
        this.userFormControls.username.setErrors({ notUnique: true });
        return;
      }
      if (error?.code === 404) {
        if (!this.globalModalsService.isWarningModalOpen()) {
          this.globalModalsService.openWarningModal(error.message).then(() => {
            this.globalModalsService.closeWarningModal();
          });
        }
        return;
      }
      if (!this.globalModalsService.isErrorModalOpen()) {
        this.globalModalsService.openErrorModal(error.message).then(() => {
          this.globalModalsService.closeErrorModal();
        });
      }
    });
  }


  onKeyPress(event: any, controlName?: string) {
    if (event.key === 'Enter') event.target.blur();

    if (controlName && !this.patterns[controlName].test(event.key)) { event.preventDefault(); }

  }

  onTelKeyPress(event: any) {

    if (event.key === 'Enter') event.target.blur();

    const value = this.userFormControls.telephone.value;

    const isValidStartAndNotSpace = value.startsWith('+') && event.keyCode !== 32

    if (value.length === 3 && isValidStartAndNotSpace) {
      this.userFormControls.telephone.setValue(value + ' ');
      return;
    }

    if (value.length === 6 && isValidStartAndNotSpace) {
      this.userFormControls.telephone.setValue(value + ' ');
      return;
    }

    if (value.length === 10 && isValidStartAndNotSpace) {
      this.userFormControls.telephone.setValue(value + ' ');
      return;
    }
  }


  calcPadding(controlName: string) {
    const patternPadding = this.userFormControls[controlName].hasError('pattern') ? 13 : 0;

    const errorCount = this.userFormControls[controlName].errors && Object.keys(this.userFormControls[controlName].errors).length || 0;

    if (errorCount === 1) { return (patternPadding === 13 ? patternPadding : 0) + 'px'; }

    return (((errorCount * 12.4) - 12.2) + patternPadding) + 'px';
  }

}
