import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'slk-24';
  activeLang!: string;
  selectedLanguage: any;

  constructor(
    private _translate: TranslocoService
  ) {}

  ngOnInit() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      this.selectedLanguage = { path: '', key: savedLanguage }; // Update according to your icon structure
      this._translate.setActiveLang(savedLanguage);
      this.activeLang = savedLanguage;
    } else {
      this.selectedLanguage = { path: '', key: this._translate.getDefaultLang() };
      this.activeLang = this._translate.getDefaultLang();
    }
  }
}
