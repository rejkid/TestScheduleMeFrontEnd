import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services';

@Component({
  selector: 'app-nav-schedule',
  templateUrl: './nav-schedule.component.html',
  styleUrls: ['./nav-schedule.component.less']
})
export class NavScheduleComponent implements OnInit {
  service: AccountService;
  SendingRefresh2Server: string = "Nothing";
  constructor(s: AccountService) { 
    this.service = s;
  }

  ngOnInit(): void {
  }
//   public get accountService(): AccountService {
//     return this.accountService;
// }
}
