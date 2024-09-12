import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  isLoggedIn: boolean = false;

  public fakeToken: any;

  balance: any;
  userID: string = '';

  userInfo: any;

  constructor(
    private _auth: AuthService,
    private _api: HttpService,
    private _balance: BalanceService,
    private _toastr: ToastrService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this._auth.IsLoggedIn();
    if (this.isLoggedIn) {
      const user = this._auth.GetUserInfo();
      this.userID = user.UserId;
      this._api.get(url.user, this.userID).subscribe(
        (res) => {
          this.userInfo = JSON.parse(res);
          this._balance.setBalance(this.userInfo.balance);
          this._balance
            .getBalance()
            .subscribe((value) => (this.balance = value));
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  onFinance() {
    this._toastr.info('სერვისი მალე დაემატება', 'Coming Soon...')
  }

  onToggleSidebar() {
    this.sidebarToggle.emit();
  }

  logout() {
    this._auth.ClearSession();
  }
}
