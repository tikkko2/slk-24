import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { language } from '../../../shared/data/language';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  availableLangs!: string[] | {id: string, label: string}[];
  activeLang!: string;

  userInfo: any;
  username!: string;
  role!: string;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _translate: TranslocoService
  ) {}

  ngOnInit() {
    this.activeLang = this._translate.getActiveLang();
    this.availableLangs = this._translate.getAvailableLangs();
    this.isLoggedIn = this._auth.IsLoggedIn();
    if(this.isLoggedIn) {
      this.userInfo = this._auth.GetUserInfo();
      this.username = this.userInfo.email;
      const usernameSplit = this.username.split('@')[0];
      // const usernameInitial = this.username.charAt(0);
      this.username = `${usernameSplit}`;
      this.role = this.userInfo.role;
    }
    if(localStorage.getItem('selectedLanguage') == 'en') {
      this.selectedLanguage = this.languages[1];
    }
  }

  languages: { path: string; key: string }[] = language;
  selectedLanguage: { path: string; key: string } = this.languages[0];
  contentDropdown: boolean = false;

  dropdownOpen() {
    this.contentDropdown = !this.contentDropdown;
  }

  filteredIcons() {
    return this.languages.filter((icon) => icon.key !== this.selectedLanguage.key);
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
}
