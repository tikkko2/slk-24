import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import Hotjar from '@hotjar/browser';
import { PixelService } from 'ngx-multi-pixel';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'slk-24';
  activeLang!: string;
  selectedLanguage: any;
  savedLanguage: any;

  isBrowser: any;

  siteID = 5128056;
  hotjarV = 6;

  constructor(
    private _translate: TranslocoService,
    private pixel: PixelService
  ) {}

  ngOnInit() {
    this.initHotjar();
    this.initPixel();
    this.savedLanguage = localStorage.getItem('selectedLanguage');
    if (this.savedLanguage) {
      this.selectedLanguage = { path: '', key: this.savedLanguage };
      this._translate.setActiveLang(this.savedLanguage);
      this.activeLang = this.savedLanguage;
    } else {
      this.selectedLanguage = {
        path: '',
        key: this._translate.getDefaultLang(),
      };
      this.activeLang = this._translate.getDefaultLang();
    }
  }

  initHotjar() {
    Hotjar.init(this.siteID, this.hotjarV);
  }

  initPixel() {
    this.pixel.initialize();
  }
}
