import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxControlValueAccessor, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Role } from '../_models';
import { Schedule } from '../_models/schedule';
import { SchedulePoolElement } from '../_models/schedulepoolelement';
import { UserFunction } from '../_models/userfunction';
import { AccountService, AlertService } from '../_services';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { TimeHandler } from '../_helpers/time.handler';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import * as signalR from '@microsoft/signalr';
import { Constants } from '../constants';

const COLUMNS_SCHEMA = [
  {
    key: "date",
    type: "Date",
    label: "DateTime"
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

const VALID_TO_SERVICE_TIMEOUT = 1000 * 60 * 60 * 24; // 1 DAY

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.less']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly CLEANER_STR = Constants.CLEANER_STR;

  form: FormGroup;
  id: string;

  schedules: Schedule[] = [];
  scheduleIndexer: number = 0;
  userFunctionIndexer: number = 0;
  functions: string[] = [];
  submitted = false;
  accountService: AccountService;
  account: Account;
  isLoaded: boolean = false;
  addingSchedule: boolean = false;
  userFunctions: UserFunction[] = [];
  isAdding: boolean = false;

  isLoggedAsAdmin: boolean = false;

  date: string = new Date().toISOString().slice(0, 16);

  poolElements: SchedulePoolElement[] = [];
  isAddScheduleMode: boolean = false;

  dataSource: MatTableDataSource<Schedule>;
  displayedColumns: string[] = COLUMNS_SCHEMA.map((col) => col.key);
  columnsSchema: any = COLUMNS_SCHEMA;
  public color: ThemePalette = 'primary';
  connection: signalR.HubConnection;

  constructor(accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef) {

    this.accountService = accountService;

    this.isLoggedAsAdmin = this.accountService.isAdmin();


    var tempStr = environment.baseUrl;
    /* const connection */this.connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(environment.baseUrl + '/update')
      .build();

    this.connection.start().then(function () {
      console.log('SignalR Connected!');
    }).catch(function (err) {
      return console.error(err.toString());
    });

    this.connection.on("SendUpdate", (id: number) => {
      if (id != parseInt(this.id)) {
        console.log("Error");
      }
      /* TODO This used to cause a call to `GetById(int id)` with the id different then this.id 
      Currently I am testing if this is still a problem after fix has been applied*/
      this.updateSchedulesAndPoolFromServer(); 
    });
  }

  ngAfterViewInit(): void {
    // Get the account for this id 
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (account) => {

          this.accountService.getRoles()
            .pipe(first())
            .subscribe({
              next: (value) => {
                this.functions = value;

                this.initSchedules(account);

                // Initial sorting by date
                this.sort.sort(({ id: 'date', start: 'asc' }) as MatSortable);

                this.isLoaded = true;

                this.userFunctions = account.userFunctions.slice();

                this.account = account;
                this.scheduleIndexer = account.schedules.length > 0 ? parseInt(account.schedules[account.schedules.length - 1].id) : 0;

                this.userFunctionIndexer = account.userFunctions.length > 0 ? parseInt(account.userFunctions[account.userFunctions.length - 1].id) : 0;

                var aDateValid = this.form.controls['availableSchedule4Function'].valid;
                this.accountService.getAvailableSchedules(account.id)
                  .pipe(first())
                  .subscribe({
                    next: (pollElements) => {
                      this.poolElements = pollElements.schedulePoolElements;
                      if (this.poolElements.length != 0) {
                        this.form.get('availableSchedule4Function').setValue(this.getConcatPoolElement(this.poolElements[0]));
                      }

                    },
                    error: error => {
                      this.alertService.error(error);
                    }
                  });
              },
              error: (error: any) => {
                this.alertService.error(error);
              }
            });

        },
        error: (error: any) => {
          this.alertService.error(error);
        }
      })

  }

  ngOnInit(): void {
    this.accountService.account.subscribe(x => {
      if (x != null) {
        this.id = x.id;
      }
    });

    this.isAddScheduleMode = this.isLoggedAsAdmin; // If not admin then we are adding available dates

    this.form = this.formBuilder.group({
      availableSchedule4Function: ['',],
      allDates: [false, '',]
    });
  }

  private getConcatPoolElement(poolElement: SchedulePoolElement): string {
    if (this.poolElements[0].userFunction == this.CLEANER_STR) {
      return this.getDisplayDate(poolElement.date) + "/" + poolElement.userFunction + "/" + poolElement.scheduleGroup;
    } else {
      return this.getDisplayDate(poolElement.date) + "/" + poolElement.userFunction;
    }
  }


  ngOnDestroy() {
    console.log("Called");
  }
  /* I am not sure if we need 'input' parameter - keep it for now*/
  applyFilter(t: any, input: any) {
    const target = t as HTMLTextAreaElement;
    var filterValue = target.value;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onCheckboxChange(event: any) {
    this.updateSchedulesAndPoolFromServer();
  }

  functionValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value === '') {
      return { invalidFunction: true };
    }
    return null;
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onAddAvailableSchedule() {

    this.submitted = true;
    this.addingSchedule = true;

    // reset alerts on submit
    this.alertService.clear();

    /* Test
    var aDateValid = this.form.controls['availableSchedule4Function'].valid;
    */

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    var schedule = this.createSchedule4DateAndFunction('availableSchedule4Function');
    if (schedule == null) {
      return;
    }

    this.isAdding = true;
    this.accountService.GetScheduleFromPool(this.account.id, schedule)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.addingSchedule = false;

          console.log(account);
          this.initSchedules(account);


          if (this.poolElements.length != 0) {
            this.form.get('availableSchedule4Function').setValue(this.getConcatPoolElement(this.poolElements[0]));
          }
          this.updateSchedulesAndPoolFromServer();
        },
        complete: () => {
          this.isAdding = false;
        },
        error: error => {
          this.addingSchedule = false;
          this.alertService.error(error);
          this.isAdding = false;
          this.updateSchedulesAndPoolFromServer();
        }
      });
  }

  updateSchedulesAndPoolFromServer() {
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.initSchedules(account);

          this.accountService.getAvailableSchedules(account.id)
            .pipe(first())
            .subscribe({
              next: (pollElements) => {
                console.log("Pool Elements:" + pollElements);
                this.poolElements = pollElements.schedulePoolElements;

                if (this.poolElements.length != 0) {
                  this.form.get('availableSchedule4Function').setValue(this.getConcatPoolElement(this.poolElements[0]));
                }
              },
              error: error => {
                this.alertService.error(error);
              }
            });
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }
  createSchedule4DateAndFunction(dateFormControlName: string): Schedule {
    var dateAndFuncStr = this.form.controls[dateFormControlName].value;
    const array = dateAndFuncStr.split("/");

    var dateTimeStr = TimeHandler.displayStr2LocalIsoString(array[0]);
    var formDate = Date.parse(dateTimeStr);
    var formDateStr = array[0];
    var formFunction = array[1];
    var cleanerGroup = array[2];

    var sDate = this.reverseScheduleLookup(formDateStr);

    for (let index = 0; index < this.schedules.length; index++) {
      var scheduleDate = new Date(this.schedules[index].date);
      var scheduleTime = scheduleDate.getTime();
      var scheduleFunction = this.schedules[index].userFunction;
      if (scheduleTime == formDate && scheduleFunction == formFunction) {
        this.alertService.warn("You are already " + scheduleFunction + " for that date/time");
        return null;
      }
    }

    var localISOTime = TimeHandler.displayStr2LocalIsoString(formDateStr);

    var schedule: Schedule = {
      id: (++this.scheduleIndexer).toString(),
      date: sDate/* localISOTime as any */,
      newDate: sDate/* localISOTime as any */,
      required: true,
      deleting: false,
      userAvailability: true,
      scheduleGroup: cleanerGroup,
      userFunction: formFunction,
      newUserFunction: formFunction
    }
    return schedule;
  }

  reverseScheduleLookup(dateStr: string): Date {
    for (let index = 0; index < this.poolElements.length; index++) {
      const schedule = this.poolElements[index];
      var dStr = this.getDisplayDate(schedule.date);
      if (dStr == dateStr)
        return schedule.date;
    }
    return null;
  }
  isScheduleFromPast(schedule: Schedule) {
    var scheduleLocalDate = moment(moment.utc(schedule.date)).local().toDate(); // NEW CODE
    var scheduleLocalDateMs = scheduleLocalDate.getTime(); // NEW CODE 

    var localNowMs = Date.now();
    if ((scheduleLocalDateMs - localNowMs) < VALID_TO_SERVICE_TIMEOUT) {
      return true;
    }
    return false;
  }

  onDeleteSchedule(event: any, scheduleId: string, indx: string, schedule2Delete: Schedule) { // i is schedule index
    schedule2Delete.deleting = true;
    this.accountService.MoveSchedule2Pool(this.account.id, schedule2Delete)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.updateSchedulesAndPoolFromServer();

          this.schedules = account.schedules;
          schedule2Delete.deleting = false;
        },
        error: error => {
          this.alertService.error(error);
          this.updateSchedulesAndPoolFromServer();
          schedule2Delete.deleting = false;
        }
      });

  }

  onRowSelected(schedule: Schedule, tr: any) {
  }

  initSchedules(account: Account) {

    var schedules: Schedule[] = [];

    var dLocalNow = new Date();
    var localNowMs = dLocalNow.getTime();
    //  Filter out values that are older then now if checkbox this.f['allDates'].value is false
    for (let index = 0; index < account.schedules.length; index++) {
      const schedule = account.schedules[index];
      var serverDate = schedule.date;
      var serverDateStr = serverDate.toString();

      var scheduleLocalDate = moment(moment.utc(schedule.date)).local().toDate(); // NEW CODE
      var scheduleLocalDateMs = scheduleLocalDate.getTime(); // NEW CODE

      // Check the schedule is at least 1 day before now
      if (this.f['allDates'].value || (scheduleLocalDateMs - localNowMs) > VALID_TO_SERVICE_TIMEOUT) {
        schedules.push(schedule);
      }
    }
    this.schedules = schedules.slice();

    this.dataSource = new MatTableDataSource(this.schedules);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  getDisplayDate(date: Date): string {
    return TimeHandler.getDateDisplayStrFromShortFormat(moment(moment.utc(date)).local().toDate());
  }

  get isAdmin() {
    return this.account.role == Role.Admin;
  }
}
