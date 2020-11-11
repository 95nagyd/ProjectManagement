import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '@environments/environment';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';




import { LoginComponent } from './components/login/login.component';
import { WorkingTimeComponent } from './components/working-time/working-time.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AdminComponent } from './components/admin/admin.component';


import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { NavbarUserDetailsComponent } from './components/navbar/navbar-user-details/navbar-user-details.component';
import { MinuteSecondsPipe } from '@app/_custom/minute-seconds.pipe'
import { NgxSpinnerModule } from "ngx-spinner";
import { ClickOutsideDirective } from './_custom/click-outside.directive';
import { TeamComponent } from './components/team/team.component';
import { StatsComponent } from './components/stats/stats.component';
import { WorkingTimeCalendarComponent } from './components/_core/working-time-calendar/working-time-calendar.component';
import { FormattedTimeComponent } from './components/_core/working-time-calendar/formatted-time/formatted-time.component';
import { CommentBoxComponent } from './components/_core/working-time-calendar/comment-box/comment-box.component';
import { ComboBoxComponent } from './components/_core/combo-box/combo-box.component';
import { ComboBoxDropdownComponent } from './components/_core/combo-box/combo-box-dropdown/combo-box-dropdown.component';
import { ClickInsideDirective } from './_custom/click-inside.directive';
import { TwoDigitNumberPipe } from './_custom/two-digit-number.pipe';
import { UserModalComponent } from './components/team/user-modal/user-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    LoginComponent,
    WorkingTimeComponent,
    NavbarComponent,
    AdminComponent,
    NavbarUserDetailsComponent,
    MinuteSecondsPipe,
    ClickOutsideDirective,
    TeamComponent,
    StatsComponent,
    WorkingTimeCalendarComponent,
    FormattedTimeComponent,
    CommentBoxComponent,
    ComboBoxComponent,
    ComboBoxDropdownComponent,
    ClickInsideDirective,
    TwoDigitNumberPipe,
    UserModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    HttpClientModule,
    NgxSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
