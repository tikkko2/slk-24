import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FreeServiceService } from '../../../shared/services/free-service.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isLoggedIn: boolean = false;

  public fakeToken: any;

  balance: any;
  userID: string = '';

  userInfo: any;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _api: HttpService,
    private _balance: BalanceService,
    private _free: FreeServiceService
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

  logout() {
    this._auth.ClearSession();
    this._router.navigate(['/services'])
  }
}
