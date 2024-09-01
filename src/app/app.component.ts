import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import Hotjar from '@hotjar/browser'
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

  siteID = 5099385;
  hotjarV = 6;

  initHotjar() {
    Hotjar.init(this.siteID, this.hotjarV);
  }
  constructor(
    private _translate: TranslocoService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.initHotjar();
    const localStorage = this.document.defaultView?.localStorage;
    if (localStorage) {
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
  }
}
