import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { language } from '../../../shared/data/language';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BalanceService } from '../../../shared/services/balance.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  isLoggedIn: boolean = false;
  availableLangs!: string[] | { id: string; label: string }[];
  activeLang!: string;

  isSmallScreen: boolean = false;

  balance: any;
  userInfo: any;
  username!: string;
  role!: string;
  isDropdownVisible: boolean = false;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _translate: TranslocoService,
    private _balance: BalanceService,
    private _api: HttpService
  ) {}

  ngOnInit() {
    this.activeLang = this._translate.getActiveLang();
    this.availableLangs = this._translate.getAvailableLangs();
    this.isLoggedIn = this._auth.IsLoggedIn();
    if (this.isLoggedIn) {
      this.userInfo = this._auth.GetUserInfo();
      this.username = this.userInfo.email;
      const usernameSplit = this.username.split('@')[0];
      // const usernameInitial = this.username.charAt(0);
      this.username = `${usernameSplit}`;
      this.role = this.userInfo.role;
      this._api.get(url.user, this.userInfo.UserId).subscribe(
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
    if (localStorage.getItem('selectedLanguage') == 'en') {
      this.selectedLanguage = this.languages[1];
    }
    this.checkScreenWidth();
  }

  languages: { path: string; key: string }[] = language;
  selectedLanguage: { path: string; key: string } = this.languages[0];
  contentDropdown: boolean = false;

  dropdownOpen() {
    this.contentDropdown = !this.contentDropdown;
  }

  filteredIcons() {
    return this.languages.filter(
      (icon) => icon.key !== this.selectedLanguage.key
    );
  }

  changeLanguage(icon: { path: string; key: string }) {
    this.selectedLanguage = icon;
    this._translate.setActiveLang(this.selectedLanguage.key);
    this.contentDropdown = !this.contentDropdown;
    this.activeLang = this.selectedLanguage.key;
    localStorage.setItem('selectedLanguage', this.selectedLanguage.key);
  }

  navigateToLogin() {
    this._router.navigate(['/sign-in']);
  }

  onToggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleUserDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }

  hideDropdown() {
    this.isDropdownVisible = false;
  }

  navigateToHome() {
    this._router.navigate(['/home']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth();
  }

  private checkScreenWidth(): void {
    this.isSmallScreen = window.innerWidth < 778;
  }

  logout() {
    this._auth.ClearSession();
  }
}
