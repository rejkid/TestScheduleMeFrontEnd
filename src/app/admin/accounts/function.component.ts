import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Account, Role } from 'src/app/_models';
import { UserFunction } from 'src/app/_models/userfunction';
import { AccountService, AlertService } from 'src/app/_services';

@Component({ templateUrl: 'function.component.html' })
export class FunctionComponent implements OnInit {
  id: string;
  account: Account;
  form: FormGroup;
  userFunctionIndexer: number = 0;

  userFunctions: UserFunction[] = [];
  functions: string[] = [];
  submitted = false;
  isLoggedAsAdmin: boolean = false;
  loading = false;
  accountService : AccountService; 

  isLoaded: boolean = false;
  constructor( accountService: AccountService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router) {
    this.accountService = accountService;
    this.isLoggedAsAdmin = this.accountService.isAdmin();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.accountService.getRoles()
            .pipe(first())
            .subscribe({
              next: (value) => {
                this.functions = value;

                this.account = account;
                this.userFunctions = account.userFunctions.slice();

                console.log(this.account + this.id);
                this.form = this.formBuilder.group({

                  function: ['', [Validators.required, this.functionValidator]],

                });
                this.form.get('function').setValue(this.functions[0]);

                this.userFunctionIndexer = account.userFunctions.length > 0 ? parseInt(account.userFunctions[account.userFunctions.length - 1].id) : 0;

                this.isLoaded = true;

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
  addFunction() {
    var currentValue = this.form.controls['function'].value;

    for (let index = 0; index < this.userFunctions.length; index++) {
      if (this.userFunctions[index].userFunction === currentValue) {
        this.alertService.error(currentValue + " already exists");
        return;
      }
    }
    if (this.userFunctions.includes(currentValue)) {
      return;
    }
    var userFunction: UserFunction = {
      id: (++this.userFunctionIndexer).toString(),
      userFunction: this.form.controls['function'].value
    }
    this.userFunctions.push(userFunction);
    this.addFunction4Account(userFunction);
  }
  deleteFunction(name: UserFunction) { 
    this.deleteFunction4Account(name);
  }
  private addFunction4Account(userFunction: UserFunction) {

    this.accountService.addFunction(this.id, userFunction)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.userFunctions = account.userFunctions.slice();
          //this.alertService.success('Update successful', { keepAfterRouteChange: true });
          //this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
   
  private deleteFunction4Account(userFunctions: UserFunction) {
    this.accountService.deleteFunction(this.id, userFunctions)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.userFunctions = account.userFunctions.slice();

          this.alertService.success('Update successful', { keepAfterRouteChange: true });
          //this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
   
  get isAdmin() {
    return this.account.role == Role.Admin;
  }
}
