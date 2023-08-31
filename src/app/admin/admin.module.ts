import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from '../material/material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ScheduleAllocatorComponent } from './accounts/schedule.allocator.component';



@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AdminRoutingModule,
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent,
        OverviewComponent,
    ]
})
export class AdminModule { }