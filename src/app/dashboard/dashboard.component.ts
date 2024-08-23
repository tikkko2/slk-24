import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { HttpService } from '../shared/services/http.service';
import { url } from '../shared/data/api';
import { BalanceService } from '../shared/services/balance.service';
import { FreeServiceService } from '../shared/services/free-service.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarService } from '../shared/services/component/sidebar.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoggedIn: boolean = false;
  isSmallScreen: boolean = false;
  sidebarShown: boolean = true;
  private subscription!: Subscription;
  public fakeToken: any;

  constructor(
    private _auth: AuthService,
    private _api: HttpService,
    private _free: FreeServiceService,
    private sidebarService: SidebarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit(): void {
    this.isLoggedIn = this._auth.IsLoggedIn();
    if (!this.isLoggedIn) {
      const data = {
        username: 'free@gmail.com',
        password: '123',
      };
      this._api.postLog(url.login, data).subscribe(
        (res: any) => {
          this._free.setToken(res.token);
          this._free
            .getToken()
            .subscribe((value) => (this.fakeToken = value));
        },
        (err) => {
          console.log('Not Logged In');
        }
      );
    }
  }
}
