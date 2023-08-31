import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TimeHandler } from '../_helpers/time.handler';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-dob',
  templateUrl: './dob.component.html',
  styleUrls: ['./dob.component.less']
})


export class DOBComponent implements OnInit {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  DATE_FORMAT = `${environment.dateFormat}`;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder) {
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dob: ['', [Validators.required, TimeHandler.dateValidator]],
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  setDOB(date: Date) {
    this.form.get('dob').setValue(date);
  }
  getDOB() : Date {
    return this.form.get('dob').value;
  }
}
