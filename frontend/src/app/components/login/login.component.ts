import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '@app/_services/authentication.service';
import { Subscription } from 'rxjs';
import { GlobalModalsService } from '@app/_services/global-modals.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  error: any;
  formValueChangeSubscription: Subscription;

  constructor(private formBuilder: FormBuilder, private router: Router, private authenticationService: AuthenticationService, private globalModalsService: GlobalModalsService ) { 
    this.loading = false;
    this.submitted = false;
  }

  ngOnInit(): void {
    console.log(this.authenticationService.isLoggedIn())
    this.globalModalsService.closeConfirmModal();
    this.globalModalsService.closeInfoModal();
    this.globalModalsService.closeErrorModal();
    if (this.authenticationService.isLoggedIn()) { 
      this.router.navigate(['']);
    }
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });

    this.formValueChangeSubscription = this.loginForm.valueChanges.subscribe(() => {
        this.error = '';
    });
  }

  ngOnDestroy() {
    this.formValueChangeSubscription?.unsubscribe();
  }

  get formControls() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;
    this.authenticationService.login(this.formControls.username.value, this.formControls.password.value)
      .subscribe(() => {
              this.router.navigate(['']);
          }, error => {
              this.error = error;
              this.loading = false;
          }
      );   
  }
}
