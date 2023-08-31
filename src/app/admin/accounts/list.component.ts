import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Account, Role } from 'src/app/_models';
import { AccountService } from 'src/app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: Account[];

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => {
                this.accounts = accounts;
                this.accounts.sort(function (a, b) {
                    return a.role.localeCompare(b.role);
                });
            });
    }

    deleteAccount(id: string) {
        const account = this.accounts.find(x => x.id === id);
        account.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== id) 
            });
    }
    public get RoleAdminEnum() {
        return Role.Admin; 
      }
}