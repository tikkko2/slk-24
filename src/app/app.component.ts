import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'slk-24';
  activeLang!: string;
  selectedLanguage: any;
  savedLanguage: any;

  constructor(
    private _translate: TranslocoService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
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
