import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '../_services';
import { Account } from '../_models';

@Component({ templateUrl: 'schedule-list.component.html' })
export class ScheduleListComponent implements OnInit {
    //accounts: any[];
    account = this.accountService.accountValue;
    constructor(private accountService: AccountService) {}

    ngOnInit() {
        if (this.account) {
            console.log(this.account.firstName);
        } else {
            console.log("account is NULL");
        }
    }

}