import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { HttpService } from '../shared/services/http.service';
import { url } from '../shared/data/api';
import { BalanceService } from '../shared/services/balance.service';
import { FreeServiceService } from '../shared/services/free-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoggedIn: boolean = false;
  isSmallScreen: boolean = false;
  sidebarShown: boolean = true;
  public fakeToken: any;

  constructor(
    private _auth: AuthService,
    private _api: HttpService,
    private _free: FreeServiceService
  ) {}

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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth();
  }

  private checkScreenWidth(): void {
    this.isSmallScreen = window.innerWidth < 778;
    if (this.isSmallScreen) {
      this.sidebarShown = false;
    } else {
      this.sidebarShown = true;
    }
  }
}
