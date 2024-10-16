import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
  sideNavCollapsed = signal(false);
  isSmallScreen: boolean = false;

  public fakeToken: any;

  isLoggedIn: boolean = false;
  balance: any;
  userID: string = '';
  userInfo: any;

  constructor(
    public _auth: AuthService,
    private _api: HttpService,
    private _balance: BalanceService,
    private _toastr: ToastrService
  ) {}

  ngOnInit() {
    // this.isLoggedIn = this._auth.isAuthenticated();
    if (this._auth.isAuthenticated()) {
      const user = this._auth.userInfo();
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
    this.checkScreenWidth();
  }

  onFinance() {
    this._toastr.info('სერვისი მალე დაემატება', 'Coming Soon...');
  }

  onToggleSidebar() {
    this.sidebarToggle.emit();
  }

  logout() {
    this._auth.logOut();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth();
  }

  private checkScreenWidth(): void {
    this.isSmallScreen = window.innerWidth < 778;
  }
}
