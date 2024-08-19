import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  availableLangs!: string[] | {id: string, label: string}[];
  activeLang!: string;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _translate: TranslocoService
  ) {}

  ngOnInit() {
    this.activeLang = this._translate.getActiveLang();
    this.availableLangs = this._translate.getAvailableLangs();
    this.isLoggedIn = this._auth.IsLoggedIn();
  }

  changeLang(lang: string) {
    this._translate.setActiveLang(lang);
    this.activeLang = lang;
  }

  navigateToLogin() {
    this._router.navigate(['/sign-in']);
  }
}
