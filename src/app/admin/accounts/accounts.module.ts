import { NgModule } from '@angular/core';
//import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, UpperCasePipe } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScheduleModule } from 'src/app/schedule/schedule.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { FunctionComponent } from './function.component';
import { ScheduleAllocatorComponent } from './schedule.allocator.component';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { NgxMatDateAdapter, NgxMatDateFormats, NgxMatDatetimePickerModule, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { environment } from 'src/environments/environment';
import { MatSelectModule } from '@angular/material/select';
import { DOBModule } from 'src/app/dob/dob.module';


// If using Moment
const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: `${environment.dateTimeFormat}`,
  },
  display: {
    dateInput: `${environment.dateTimeFormat}`,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

/* This is an alternative way of displaying Date in the format `${environment.dateFormat}` */
export class AppDateAdapter extends NativeDateAdapter {

  override format(date: Date, displayFormat: Object): string {

      if (displayFormat === `${environment.dateFormat}`) {

          const day = date.getDate();
          var dayStr = day.toString().padStart(2, '0')
          var month = date.getMonth() + 1;
          var monthStr = month.toString().padStart(2, '0')
          const year = date.getFullYear();
          var yearStr = year.toString().padStart(4, '0')

          return `${yearStr}-${monthStr}-${dayStr}`;
      }

      return date.toDateString();
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsRoutingModule,
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
    DOBModule
  ],
  declarations: [
    ListComponent,
    AddEditComponent,
    FunctionComponent,
    ScheduleAllocatorComponent,
    

  ],
  providers: [
    {
      provide: UpperCasePipe
    },
    {
      provide: NgxMatDateAdapter,
      useClass: NgxMatMomentAdapter, //Moment adapter
      deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    // values
    { 
      provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS  
      
    },
    // {
    //   provide: DateAdapter, useClass: AppDateAdapter
    // },
  ],
  exports: [
    MatPaginatorModule
  ]
})
export class AccountsModule { }