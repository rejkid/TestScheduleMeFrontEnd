import { Inject, Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { DOBComponent } from '../dob/dob.component';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export const CUSTOM_MOMENT_FORMATS = {
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
/* This is an alternative way of displaying Date in the format `${environment.dateFormat}` */
// @Injectable()
// export class AppDateAdapter extends NativeDateAdapter {

//   constructor(@Inject(LOCALE_ID) public override locale: string, platform: Platform) {
//     super(locale, platform)
//   }
//   override format(date: Date, displayFormat: Object): string {

//     if (displayFormat === `${environment.dateFormat}`) {

//       const day = date.getDate();
//       var dayStr = day.toString().padStart(2, '0')
//       var month = date.getMonth() + 1;
//       var monthStr = month.toString().padStart(2, '0')
//       const year = date.getFullYear();
//       var yearStr = year.toString().padStart(4, '0')

//       return `${dayStr}-${monthStr}-${yearStr}`;
//     }

//     return date.toDateString();
//   }

// }

@NgModule({
  declarations: [
    DOBComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  exports: [
    DOBComponent,
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS},

    // {
    //   provide: MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS
    // },
    // {
    //   provide: DateAdapter, useClass: AppDateAdapter
    // },
  ],
})
export class DOBModule { }
