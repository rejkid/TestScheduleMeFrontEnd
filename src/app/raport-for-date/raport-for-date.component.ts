import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { Team, } from '../_models/team';
import { DateFunctionTeams } from '../_models/teams';
import { User } from '../_models/user';
import { AccountService } from '../_services';
import { first } from 'rxjs/operators';
import { TimeHandler } from '../_helpers/time.handler';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ScheduleDateTimes } from '../_models/scheduledatetimes';
import { ScheduleDateTime } from '../_models/scheduledatetime';
import { OrderByDatePipe } from '../order-by-date.pipe';


@Component({
  selector: 'app-raport-test',
  templateUrl: './raport-for-date.component.html',
  styleUrls: ['./raport-for-date.component.less']
})
export class RaportForDateComponent implements OnInit {
  form: FormGroup;
  list: Date[] = [];
  futureScheduleDateStrings: string[] = [];

  dateSelected: string;
  isLoaded: boolean = false;

  isUsersLoaded: boolean = false;
  users: User[] = [];
  teams: Team[] = [];
  scheduleDateTime : ScheduleDateTime[] = [];

  constructor(private accountService: AccountService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dates: ['', [Validators.required, this.dateValidator]],
      allDates: [false, '',]
    });
    this.getAllDates();
  }
  onCheckboxChange(event: any) {
    this.getAllDates();
    this.teams = []; // Remove all current teams - we have new set of dates
  }

  get f() {
    return this.form.controls;
  }

  reverseScheduleLookup(dateStr: string) : Date {
    
    for (let index = 0; index < this.scheduleDateTime.length; index++) {
      const scheduleDateTime = this.scheduleDateTime[index];
      var  dStr = this.getDateDisplayStr(scheduleDateTime.date);
      if(dStr == dateStr)
        return scheduleDateTime.date;
    } 
    return null;
  }

  onSelected(value: any): void {
    this.dateSelected = value;
    if (this.futureScheduleDateStrings.length <= 0)
      return;

    var selectedDate = this.form.get('dates').value;
    var selectedDateInParseFormat = moment(selectedDate, `${environment.dateTimeFormat}`);
    if (isNaN(Date.parse(selectedDateInParseFormat.toString()/* selectedDate */))) // If Date is invalid then return (e.g. "Choose here")
      return;

    this.users = [];
    
    const array = selectedDate.split("/");

    var date = this.reverseScheduleLookup(array[0]);
    this.accountService.GetTeamsByFunctionForDate(date)
      .pipe(first())
      .subscribe({
        next: (dateFunctionTeams: DateFunctionTeams) => {
          this.teams = dateFunctionTeams.dateFunctionTeams;

          for (let index = 0; index < this.teams.length; index++) {
            var user: User[] = this.teams[index].users
            console.log(this.teams[index]);

            for (let i = 0; i < this.teams[index].users.length; i++) {
              this.users.push(this.teams[index].users[i]);
            }
            console.log(this.users);
          }
        },
        error: error => {
          console.log();
        }
      });

  }

  getAllDates() {
    this.futureScheduleDateStrings = [];
    this.list = [];
    this.accountService.getAllDates()
      .pipe(first())
      .subscribe({
        next: (value : ScheduleDateTimes) => {
          this.scheduleDateTime = value.scheduleDateTimes;

          for (let index = 0; index < value.scheduleDateTimes.length; index++) {
            // Add server side date
            this.list.push(value.scheduleDateTimes[index].date)
          }
          this.list.sort(function (a, b) {
            if (a > b) return 1
            if (a < b) return -1
            return 0
          });

          for (let index = 0; index < this.list.length; index++) {
            var tNowLocalMs = Date.now();
            const scheduleServerDate = this.list[index];
            var scheduleLocalDate = moment(moment.utc(scheduleServerDate)).local().toDate();
            var scheduleLocalMs = scheduleLocalDate.getTime();

            if (this.f['allDates'].value || scheduleLocalMs > tNowLocalMs) {
              this.futureScheduleDateStrings.push(this.getDateDisplayStr(scheduleServerDate));
            }
          }

          this.isLoaded = true;
        },
        error: error => {
          console.log();
        }
      });

  }
  getDayStrFromDate(dateStr: string): string {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = TimeHandler.displayStr2Date(dateStr);
    return days[date.getDay()];  
  }
  getDateDisplayStr(date: Date): string {
    return TimeHandler.getDateDisplayStrFromFormat(moment(moment.utc(date)).local().toDate());  
  }

  dateValidator(control: FormControl): { [s: string]: boolean } {
    var test = control.value.match(/^\d/);
    if (!test) {
      return { invalidDate: true };
    }
    return null;
  }
}
