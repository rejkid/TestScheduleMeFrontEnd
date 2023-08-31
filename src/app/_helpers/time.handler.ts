import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';


import { AccountService } from '../_services';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms';

const dateFormat = `${environment.dateTimeFormat}`;
const shortDateFormat = `${environment.shortDateTimeFormat}`;

@Injectable()
export class TimeHandler {
    constructor() { }
    static dateValidator(AC: AbstractControl) {
        if (AC && AC.value && !moment(AC.value, `${environment.dateFormat}`, true).isValid()) {
            return { 'dateVaidator': true };
        }
        return null;
    }
    static displayStr2LocalIsoString(dateStr: string): string {
        var date = moment(dateStr, dateFormat).toDate();
        var zoneOffset = date.getTimezoneOffset();
        var localISOTime = new Date(date.getTime() - zoneOffset * 60 * 1000).toISOString(); // Local time in ISO format
        return localISOTime.replace("Z", "");
    }
    static displayStr2Date(dateStr: string): Date {
        var date = moment(dateStr, dateFormat).toDate();
        var zoneOffset = date.getTimezoneOffset();
        return new Date(date.getTime() - zoneOffset * 60 * 1000); // Local time in ISO format
    }
    static localDateStr2LocalDate(dateStr: string): Date {
        var date = moment(dateStr, dateFormat).toDate();
        var zoneOffset = date.getTimezoneOffset();
        return new Date(date.getTime() + zoneOffset * 60 * 1000); // Local time in ISO format
    }
    static getDateDisplayStrFromFormat(date: Date): string {
        return moment(date).format(dateFormat);
    }
    static getDateDisplayStrFromShortFormat(date: Date): string {
        return moment(date).format(shortDateFormat);
    }
    static getDatetimeLocaleFromDisplayDate(date: Date): string {
        return TimeHandler.displayStr2LocalIsoString(TimeHandler.getDateDisplayStrFromFormat(date));
    }

    static convertServerDate2Local(date: Date): Date {
        return moment(moment.utc(date)).local().toDate();
    }
}