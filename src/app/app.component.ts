import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    isLoaded: boolean = false;
    Role = Role;
    account: Account = null;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => {
            this.account = x
            this.isLoaded = true;
        });
    }

    logout() {
        this.accountService.logout();
    }
}