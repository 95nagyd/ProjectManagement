import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { AuthGuard } from './_helpers/auth.guard';
import { Role } from './_models/role';
import { LoginComponent } from './components/login/login.component';
import { WorkingTimeComponent } from './components/working-time/working-time.component';
import { AdminComponent } from './components/admin/admin.component';
import { TeamComponent } from './components/team/team.component';


const routes: Routes = [
  { path: '', redirectTo: 'workingTime', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'workingTime', component: WorkingTimeComponent, canActivate: [AuthGuard] },
  { path: 'administration', component: AdminComponent, canActivate: [AuthGuard], data: { expectedRole: Role.Admin } },
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'workingTime'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent, WorkingTimeComponent]