import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Role } from '../_models';
import { UserFunction } from '../_models/userfunction';
import { AccountService, AlertService } from '../_services';
import { first } from 'rxjs/operators';

@Component({ templateUrl: 'schedule-function.component.html' })
export class ScheduleFunctionComponent implements OnInit {
  id: string;
  account: Account;
  form: FormGroup;
  userFunctionIndexer: number = 0;

  userFunctions: UserFunction[] = null;
  functions: string[] = [];
  submitted = false;
  isLoggedAsAdmin: boolean = false;

  isLoaded: boolean = false;
  constructor(private accountService: AccountService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router) {
    this.isLoggedAsAdmin = this.accountService.isAdmin();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      function: ['', [Validators.required, this.functionValidator]],
    });

    this.id = this.route.snapshot.params['id'];
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe({
          next: (account) => {
            this.account = account;
            this.isLoaded = true;
            this.accountService.getRoles()
            .pipe(first())
            .subscribe({
              next: (value: any) => {
                this.functions = value;

                this.userFunctions = account.userFunctions.slice();

                console.log(this.account + this.id);
                this.form.get('function').setValue(this.functions[0]);

                this.userFunctionIndexer = account.userFunctions.length > 0 ? parseInt(account.userFunctions[account.userFunctions.length - 1].id) : 0;
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
  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  functionValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value === '') {
      return { invalidFunction: true };
    }
    return null;
  }

  get isAdmin() {
    return this.account.role == Role.Admin;
  }
}
