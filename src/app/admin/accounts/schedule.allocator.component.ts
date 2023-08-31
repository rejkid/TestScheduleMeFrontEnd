import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { TimeHandler } from 'src/app/_helpers/time.handler';
import { Account, Role } from 'src/app/_models';
import { Schedule } from 'src/app/_models/schedule';
import { SchedulePoolElement } from 'src/app/_models/schedulepoolelement';
import { UserFunction } from 'src/app/_models/userfunction';
import { AccountService, AlertService } from 'src/app/_services';
import { environment } from 'src/environments/environment';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { MAT_DATE_FORMATS, ThemePalette } from '@angular/material/core';
import { interval, timer } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import * as signalR from '@microsoft/signalr';
import { UpperCasePipe } from '@angular/common';
import { Constants } from '../../constants';

const COLUMNS_SCHEMA = [
  {
    key: "date",
    type: "Date",
    label: "Date"
  },
  {
    key: "userFunction",
    type: "text",
    label: "Duty"
  },
  {
    key: "scheduleGroup",
    type: "text",
    label: "Group"
  },
  {
    key: "action",
    type: "button",
    label: "Action"
  },
]

@Component({
  templateUrl: './schedule.allocator.component.html',
  styleUrls: ['./schedule.allocator.component.less'],
})

export class ScheduleAllocatorComponent implements OnInit, AfterViewInit {
  convertServerDate2Local = TimeHandler.convertServerDate2Local; // getter for TimeHandler.convertServerDate2Local static method

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly CLEANER_STR = Constants.CLEANER_STR;

  dateFormat = `${environment.dateTimeFormat}`;
  dateTimeFormat = `${environment.dateTimeFormat}`;

  form: FormGroup;
  @Output() onScheduledAdded: EventEmitter<any>;
  id: string;

  dataSource: MatTableDataSource<Schedule>;

  scheduleIndexer: number = 0;
  schedules: Schedule[] = [];
  userFunctionIndexer: number = 0;
  functions: string[] = [];
  submitted = false;
  accountService: AccountService;
  account: Account;
  isLoaded: boolean = false;
  isAdding: boolean = false;
  isUpdating: boolean = false;

  displayedColumns: string[] = COLUMNS_SCHEMA.map((col) => col.key);
  columnsSchema: any = COLUMNS_SCHEMA;

  userFunctions: UserFunction[] = [];

  isLoggedAsAdmin: boolean = false;

  poolElements: SchedulePoolElement[] = [];
  public color: ThemePalette = 'primary';

  constructor(accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private uppercasePipe: UpperCasePipe) {

    this.accountService = accountService;
    this.onScheduledAdded = new EventEmitter();

    this.isLoggedAsAdmin = this.accountService.isAdmin();

    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(environment.baseUrl + '/update')
      .build();

    connection.start().then(function () {
      console.log('SignalR Connected!');
    }).catch(function (err) {
      return console.error(err.toString());
    });

    connection.on("SendUpdate", (id: number) => {
      this.updateSchedulesFromServer();
    });
  }
  ngAfterViewInit(): void {
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe(account => {

        this.accountService.getRoles()
          .pipe(first())
          .subscribe({
            next: (value) => {
              this.functions = value;
              this.initSchedules(account);

              // Initial sorting by date
              this.sort.sort(({ id: 'date', start: 'asc' }) as MatSortable);

              this.userFunctions = account.userFunctions.slice();

              this.form.get('scheduledDate').setValue(new Date());
              if (this.userFunctions.length > 0) {
                this.form.get('function').setValue(this.userFunctions[0].userFunction);
              }
              if (!this.isCleaner) {
                this.form.get('cleanerGroup').disable();
              } else {
                this.form.get('cleanerGroup').addValidators(Validators.required);
                this.form.get('cleanerGroup').addValidators(Validators.minLength(1));
              }

              this.account = account;
              this.scheduleIndexer = account.schedules.length > 0 ? parseInt(account.schedules[account.schedules.length - 1].id) : 0;
              this.onScheduledAdded.emit(this.schedules);
              this.userFunctionIndexer = account.userFunctions.length > 0 ? parseInt(account.userFunctions[account.userFunctions.length - 1].id) : 0;

              this.isLoaded = true;
            },
            error: error => {
              this.alertService.error(error);
            }
          });
      });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      scheduledDate: ['', Validators.required],
      cleanerGroup: ['', ] ,
      function: ['', [Validators.required, this.functionValidator]],
    });
  }

  /* I am not sure if we need 'input' parameter - keep it for now*/
  applyFilter(t: any, input: any) {
    const target = t as HTMLTextAreaElement;
    var filterValue = target.value;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  functionValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value === '') {
      return { invalidFunction: true };
    }
    return null;
  }
  onDutyChanged(event: any) {
    if(event.value == this.CLEANER_STR) {
      this.form.get('cleanerGroup').enable();
    } else {
      this.form.get('cleanerGroup').disable();
    }
  }
  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onAddSchedule() {

    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      this.form.markAsTouched(); //markAllAsTouched();
      this.f['cleanerGroup'].markAsTouched();
      return;
    }

    var schedule = this.createSchedule('scheduledDate', 'function');
    if (schedule == null)
      return; // Already exists

    this.isAdding = true;
    this.accountService.addSchedule(this.account.id, schedule)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.updateSchedulesFromServer();
          this.initSchedules(account);
        },
        complete: () => {
          this.isAdding = false;
        },
        error: error => {
          this.updateSchedulesFromServer();
          this.alertService.error(error);
          this.isAdding = false;
        }
      });
  }

  onInputFunc(date: HTMLInputElement, event : any ) {
    var k = event.key;
    var val = this.uppercasePipe.transform(date.value)
    var retVal = this.uppercasePipe.transform(event.key);
    return retVal;
  }
  createSchedule(dateStr: string, functionStr: string): Schedule {
    var formDate = new Date(this.form.controls[dateStr].value);
    formDate.setSeconds(0); // Re-set seconds to zero
    var formTime = formDate.getTime();

    var formFunction = this.form.controls[functionStr].value;

    for (let index = 0; index < this.schedules.length; index++) {
      var scheduleTime = TimeHandler.convertServerDate2Local(this.schedules[index].date).getTime();
      var scheduleFunction = this.schedules[index].userFunction;
      if (scheduleTime == formTime && scheduleFunction == formFunction) {
        this.alertService.warn("The user is already " + scheduleFunction + " for that date/time");
        return null;
      }
    }

    var test = this.form.controls[dateStr].value;
    var newDate: Date = new Date(this.form.controls[dateStr].value);
    newDate.setSeconds(0);

    var scheduleGroupVal = "";
    if (this.form.controls['cleanerGroup'].enabled) {
      scheduleGroupVal = this.form.controls['cleanerGroup'].value;
    }
    var schedule: Schedule = {
      id: (++this.scheduleIndexer).toString(),
      date: newDate,
      newDate: newDate,
      required: true,
      deleting: false,
      userAvailability: true,
      scheduleGroup: scheduleGroupVal,
      userFunction: this.form.controls[functionStr].value,
      newUserFunction: this.form.controls[functionStr].value
    }
    return schedule;
  }
  onDeleteSchedule(i: string, schedule2Delete: Schedule, row : any) { // i is table index
    // var found: number = -1;
    // var schedule2Delete: Schedule = null;

    // for (let index = 0; index < this.schedules.length; index++) {
    //   if (index === parseInt(i)) {
    //     found = index; // array index not a table
    //     schedule2Delete = this.schedules[index];
    //     schedule2Delete.deleting = true;
    //     break;
    //   }
    // }

    schedule2Delete.deleting = true;
    this.accountService.deleteSchedule(this.account.id, schedule2Delete)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.updateSchedulesFromServer();
        },
        complete: () => {
          schedule2Delete.deleting = false;
        },
        error: error => {
          this.alertService.error(error);
          schedule2Delete.deleting = false;
          this.updateSchedulesFromServer();
        }
      });
  }

  updateSchedulesFromServer() {
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe(account => {

        this.accountService.getRoles()
          .pipe(first())
          .subscribe({
            next: (value) => {
              this.functions = value;
              this.initSchedules(account);
            },
            error: error => {
              this.alertService.error(error);
            }
          });
      });
  }

  onDateChanged(event: any, schedule: Schedule) {
    var dateTime = event.value;
    var t = typeof (dateTime === 'Date');

    var newDate: Date = event.value.toDate(); // Convert moment to Date
    schedule.newDate = newDate;
    schedule.newDate.setSeconds(0); // Little trick which does what mat angular should have done - reset seconds
    schedule.newUserFunction = schedule.userFunction;

    this.updateSchedules(schedule);
  }
  onUserFunctionChanged(event: any, schedule: Schedule) {
    var funcName = event.value;
    var t = typeof (funcName === 'string');

    schedule.newUserFunction = event.value;
    schedule.newDate = schedule.date;

    this.updateSchedules(schedule);
  }

  onCleanerGroupPressed(event : any) {
    console.log("You entered: ", event.target.value);
  }

  updateSchedules(schedule: Schedule) {
    this.isUpdating = true;
    // reset alerts on submit
    this.alertService.clear();

    this.accountService.updateSchedule(this.account.id, schedule)
      .pipe(first())
      .subscribe({
        next: (account) => {
          console.log(account);
          this.initSchedules(account);
        },
        complete: () => {
          this.isUpdating = false;
        },
        error: error => {
          this.alertService.error(error);
          this.isUpdating = false;
        }
      });
  }

  onRowSelected(schedule: Schedule, tr: any) {
  }

  initSchedules(account: Account) {
    this.schedules = account.schedules.slice();

    this.dataSource = new MatTableDataSource(this.schedules);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  get isAdmin() {
    return this.account.role == Role.Admin;
  }
  get isCleaner() {
    if(this.form == undefined)
     return false;
    return this.form.get('function').value === this.CLEANER_STR
  }

  convertServerDate2LocalStr(date: Date): string {
    return TimeHandler.getDateDisplayStrFromFormat(moment(moment.utc(date)).local().toDate());
  }
}
