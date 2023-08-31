import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, tap } from 'rxjs/operators';

//import { environment } from '@environments/environment';
import { Account, Role } from '../_models';
//import { JwtHelperService } from '@auth0/angular-jwt';

import { ScheduleDateTime } from '../_models/scheduledatetime';
import { ScheduleDateTimes } from '../_models/scheduledatetimes';
import { Users } from '../_models/users';
import { Team } from '../_models/team';
import { DateFunctionTeams } from '../_models/teams';
import { SchedulePoolElements } from '../_models/schedulepoolelements';
import { environment } from 'src/environments/environment';
import { UserFunction } from '../_models/userfunction';
import { SchedulePoolElement } from '../_models/schedulepoolelement';
import { Schedule } from '../_models/schedule';
import * as moment from 'moment';


const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(email: string, password: string, dob: string) {
        return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password, dob }, { withCredentials: true })
            .pipe(map(account => {
                //const body = account.body;
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    /* An alternate way*/
/*     login(email: string, password: string, dob: string) {
        return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password, dob }, { withCredentials: true })
            .pipe(tap(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }))
    }
 */
    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    refreshToken() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {/* headers: headers */ }, { withCredentials: true })
            .pipe(map((account) => {
                this.accountSubject.next(account);
                const cookie = document.cookie;
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string, dob : string ) {
        return this.http.post(`${baseUrl}/verify-email`, { token, dob });
    }

    forgotPassword(email: string, dob : Date) {
        return this.http.post(`${baseUrl}/forgot-password`, { email, dob });
    }

    validateResetToken(token: string, dob : string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token, dob });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }

    getAllDates() {
        return this.http.get<ScheduleDateTimes>(`${baseUrl}/all-dates`);
    }
    GetTeamsByFunctionForDate(dateStr: any) {
        return this.http.get<DateFunctionTeams>(`${baseUrl}/teams-for-date/${dateStr}`);
    }

    getAvailableSchedules(id: any) {
        return this.http.get<SchedulePoolElements>(`${baseUrl}/available_schedules/${id}`);
    }
    getAllAvailableSchedules() {
        return this.http.get<SchedulePoolElements>(`${baseUrl}/all-available_schedules`);
    }
    addSchedule(id: any, schedule: any) {
        return this.http.put<Account>(`${baseUrl}/add-schedule/${id}`, schedule);
    }
    updateSchedule(id: any, schedule: Schedule) {
        return this.http.post(`${baseUrl}/update-schedule/${id}`, schedule)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    deleteSchedule(id: any, schedule: any) {
        return this.http.post<Account>(`${baseUrl}/delete-schedule/${id}`, schedule);
    }

    addFunction(id: any, userFunction: any) {
        return this.http.put<Account>(`${baseUrl}/add-function/${id}`, userFunction);
    }

    deleteFunction(id: any, userFunction: any) {
        return this.http.post<Account>(`${baseUrl}/delete-function/${id}`, userFunction);
    }

    deletePoolElement(id: string, email: string, userFunction: string) {
        return this.http.post<SchedulePoolElement>(`${baseUrl}/remove-pool-element/${id}/${email}/${userFunction}`, "");
    }

    MoveSchedule2Pool(id: any, schedule: any) {
        return this.http.post<Account>(`${baseUrl}/move-schedule-to-pool/${id}`, schedule);
    }

    GetScheduleFromPool(id: any, schedule: any) {
        return this.http.post<Account>(`${baseUrl}/get-schedule-from-pool/${id}`, schedule);
    }

    create(params: any) {
        return this.http.post(baseUrl, params);
    }

    update(id: any, params: any) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }
    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (id === this.accountValue.id)
                    this.logout();
            }));
    }

    isAdmin() {
        return this.accountValue && this.accountValue.role === Role.Admin;
    }
    // helper methods

    private refreshTokenTimeout: string | number | NodeJS.Timeout | undefined;

    private startRefreshTokenTimer() {
        // HEADER:ALGORITHM & TOKEN TYPE

        // parse json object from base64 encoded jwt token
        var header = JSON.parse(atob(this.accountValue.jwtToken.split('.')[0]));


        // PAYLOAD:DATA
        // parse json object from base64 encoded jwt token
        const payload = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // VERIFY SIGNATURE
        // parse json object from base64 encoded jwt token
        const signature = this.accountValue.jwtToken.split('.')[2];


        // VERIFY SIGNATURE
        // parse json object from base64 encoded jwt token
        //const jwtSignature = JSON.parse(atob(this.accountValue.jwtToken.split('.')[2]));


        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    // private string hmacSha256(string data, string secret) {
    //     try {

    //         byte[] hash = secret.getBytes(StandardCharsets.UTF_8);
    //         Mac sha256Hmac = Mac.getInstance("HmacSHA256");
    //         SecretKeySpec secretKey = new SecretKeySpec(hash, "HmacSHA256");
    //         sha256Hmac.init(secretKey);

    //         byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    //         return encode(signedBytes);
    //     } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
    //         Logger.getLogger(JWebToken.class.getName()).log(Level.SEVERE, ex.getMessage(), ex);
    //         return null;
    //     }
    // }
    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

    getRoles() {
        return this.http.get<[]>(`${baseUrl}/role-configuration`);
    }
}