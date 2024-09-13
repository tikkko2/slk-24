import { Component, computed, HostListener, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { HttpService } from '../shared/services/http.service';
import { url } from '../shared/data/api';
import { BalanceService } from '../shared/services/balance.service';
import { FreeServiceService } from '../shared/services/free-service.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarService } from '../shared/services/component/sidebar.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoggedIn: boolean = false;
  isSmallScreen: boolean = false;
  sidebarShown: boolean = false;
  private subscription!: Subscription;
  public fakeToken: any;

  collapsed = signal(true);
  sidenavWidth = computed(() => this.collapsed() ? '72px' : '250px');

  constructor(
    private _auth: AuthService,
    private _api: HttpService,
    private router: Router,
    private _free: FreeServiceService,
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
      this._api.postAuth(url.login, data).subscribe(
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
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideSidebarOnRouteChange();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // this.toggleSidebarIfNeeded();
    }
  }

  private checkScreenWidth(): void {
    this.isSmallScreen = window.innerWidth <= 777;
  }

  // private toggleSidebarIfNeeded(): void {
  //   if (this.isSmallScreen && this.sidebarShown) {
  //     this.sidebarShown = false;
  //   } else if (!this.isSmallScreen && !this.sidebarShown) {
  //     this.sidebarShown = true;
  //   }
  // }

  toggleSidebar(): void {
    this.sidebarShown = !this.sidebarShown;
  }

  private hideSidebarOnRouteChange(): void {
    if (this.isSmallScreen) {
      this.sidebarShown = false;
    }
  }
}
