import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FunctionComponent } from '../admin/accounts/function.component';
import { SubNavComponent } from '../admin/subnav.component';
import { NavScheduleComponent } from './nav-schedule.component';
import { ScheduleFunctionComponent } from './schedule-function.component';
import { ScheduleLayoutComponent } from './schedule-layout.component';
import { ScheduleListComponent } from './schedule-list.component';
import { ScheduleComponent } from './schedule.component';

const routes: Routes = [
  
  //{ path: 'nav', component: ScheduleLayoutComponent },
  {
    path: '',  component:  ScheduleLayoutComponent , 
    children: [
      { path: '', component: ScheduleListComponent },
      { path: 'function/:id', component: ScheduleFunctionComponent },
      { path: 'schedules/:id', component: ScheduleComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }
