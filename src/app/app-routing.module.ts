import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';

import { HomeComponent } from './home';
import { RaportForDateComponent } from './raport-for-date/raport-for-date.component';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);
const scheduleModule = () => import('./schedule/schedule-routing.module').then(x => x.ScheduleRoutingModule);

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'schedule', loadChildren: scheduleModule },
    { path: 'report', component: RaportForDateComponent },
    { path: 'floating', component: FloatingSchedulesComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
