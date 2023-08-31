import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { LayoutComponent } from './layout.component';
import { DetailsComponent } from './details.component';
import { UpdateComponent } from './update.component';
import { ScheduleModule } from '../schedule/schedule.module';

import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { NgxMatDateAdapter, NgxMatDateFormats, NgxMatDatetimePickerModule, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { environment } from 'src/environments/environment';
import { MatSelectModule } from '@angular/material/select';

const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
    parse: {
      dateInput: `${environment.dateFormat}`,
    },
    display: {
      dateInput: `${environment.dateFormat}`,
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
  };
  
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProfileRoutingModule,
        ScheduleModule,

        MaterialModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule,
        NgxMatDatetimePickerModule,
        NgxMatMomentModule,
        MatSelectModule,
    
    ],
    declarations: [
        LayoutComponent,
        DetailsComponent,
        UpdateComponent
    ],
    providers: [
        
        {
          provide: NgxMatDateAdapter,
          useClass: NgxMatMomentAdapter, //Moment adapter
          deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        // values
        { 
          provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS  
        },
        
      ],
})
export class ProfileModule { }