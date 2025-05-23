import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/services/http.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BalanceService } from '../../../../shared/services/balance.service';
import { url } from '../../../../shared/data/api';
import { SafeUrl } from '@angular/platform-browser';
import { Language } from '../../../../shared/interfaces/language.interface';
import { ProductCategoryService } from '../../../../shared/services/product-category.service';
import { FreeServiceService } from '../../../../shared/services/free-service.service';
import { debounceTime, Subject, switchMap, timer } from 'rxjs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { TranslateActiveService } from '../../../../shared/services/translate-active.service';
import { ImageComponent } from '../image/image.component';
import { DocComponent } from '../doc/doc.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { LanguageSelectionService } from '../../../../shared/services/language-selection.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrl: './text.component.scss',
})
export class TextComponent implements OnInit, AfterViewInit {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;
  @ViewChild('generatedResponse', { static: false })
  generatedResponse!: ElementRef;

  private inputSubject = new Subject<string>();

  activeComponent: any = TextComponent;

  maxChars: number = 2500;

  public fakeToken: any;

  initialSelection: string = '';

  isLoggedIn: boolean = false;
  userID: string = '';
  userInfo: any;
  userInfoUpdate: any;
  balance: any;

  copyBtn: boolean = false;
  textareaContent: string = '';
  imageUrl: SafeUrl | null = null;

  enhanceBtn: boolean = false;
  enhanceBtnDisable: boolean = false;
  isEnhanced: boolean = false;
  toggleOrigin: boolean = false;
  toggleOriginBtn: boolean = false;

  isLoading: boolean = false;
  selectedLanguage: any;
  selectedLanguageID = '1';
  selectedSourceLanguage = '-1';

  languageNotSelected = false;
  selectedGEO = false;
  selectedENG = false;
  selectedOther = false;

  translatedText: string = '';
  originalText: string = '';
  enhancedText: string = '';

  languages: Language[] = [];

  constructor(
    private builder: FormBuilder,
    private apiService: HttpService,
    private authService: AuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private balanceService: BalanceService,
    private languageService: ProductCategoryService,
    public _transloco: TranslocoService,
    private freeService: FreeServiceService,
    private _router: Router,
    private _translateActive: TranslateActiveService,
    private languageSelectionService: LanguageSelectionService
  ) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.sendText();
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.selectedGEO = true;

    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    this.adjustTextareaHeight();
    if (this.isLoggedIn) {
      this.languageService.getLanguage(url.language).subscribe(
        (response: any) => {
          this.languages = response;
          // Load saved language after languages are loaded
          const savedLangId = sessionStorage.getItem('textSelectedTargetLanguage');
          if (savedLangId) {
            const language = this.languages.find(l => l.id.toString() === savedLangId);
            if (language) {
              this.selectLanguage(language, false);
            }
          }
        },
        (error) => {
          console.error('Error fetching languages', error);
        }
      );
    }
    this._transloco.langChanges$.subscribe((lang) => {
      this.setTranslatedText(lang);
    });
    this.setTranslatedText(this._transloco.getActiveLang());
  }

  ngAfterViewInit() {
    if (!this.isLoggedIn) {
      timer(500)
        .pipe(
          switchMap(() => this.languageService.getFreeLanguage(url.language))
        )
        .subscribe(
          (response: any) => {
            this.languages = response;
          },
          (error: any) => {
            console.error('Error fetching languages', error);
          }
        );
    }
  }

  chatForm = this.builder.group({
    text: this.builder.control(``, Validators.required),
  });

  onInput(event: any) {
    const inputValue = event.target.value;
    this.inputSubject.next(inputValue);
  }
  isGeorgian(text: string): boolean {
    const georgianRegex = /[\u10A0-\u10FF\u2D00-\u2D2F]/;
    return georgianRegex.test(text);
  }

  sendText() {
    this.copyBtn = false;
    if (this.selectedLanguageID === '0') {
      this.languageNotSelected = true;
      return;
    }
    if (!this.chatForm.valid) {
      this.toastr.error(this._transloco.translate('error-toastr.translate-text'));
      return;
    }
    if (
      this.apiService.hasExceededFreeRequests() &&
      !this.authService.isAuthenticated()
    ) {
      this.toastr.error(this._transloco.translate('error-toastr.registration'));
      this._router.navigate(['/sign-up']);
      return;
    }
    if (this.balance <= 0) {
      this.toastr.error(this._transloco.translate('error-toastr.balance'));
      this._router.navigate(['/services/balance']);
      return;
    }
    if (
      this.isGeorgian(this.chatForm.value.text ?? '') &&
      this.selectedLanguageID == '1'
    ) {
      this.selectedLanguageID = '2';
      this.selectedENG = true;
      this.selectedGEO = false;
    }
    this.isLoading = true;

    const userMessageText = this.chatForm.value.text ?? '';
    var formData = new FormData();
    formData.append('description', userMessageText);
    formData.append('languageId', this.selectedLanguageID);
    formData.append('sourceLanguageId', this.selectedSourceLanguage);
    formData.append('files', '[]');
    formData.append('isPdf', 'false');

    if (this.isLoggedIn) {
      this.apiService.postTranslate(url.translate, formData).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.originalText = response.text;
          this.isLoading = false;
          this.copyBtn = !this.copyBtn;
          this.enhanceBtn = true;

          var user = this.authService.userInfo();
          if (this.isLoggedIn) {
            this.userID = user.UserId;
            this.apiService.get(url.user, this.userID).subscribe(
              (res) => {
                this.userInfoUpdate = JSON.parse(res);
                this.balanceService.setBalance(this.userInfoUpdate.balance);
                this.apiService
                  .updateUserInfo('/api/User', this.userInfoUpdate)
                  .subscribe();
              },
              (err) => {
                console.log(err);
              }
            );
          }
        },
        (error) => {
          this.toastr.error(
            this._transloco.translate('error-toastr.balance')
          );
          this.isLoading = false;
        }
      );
    } else {
      this.apiService.postFreeTranslate(url.translate, formData).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = false;
          this.copyBtn = !this.copyBtn;
        },
        (error) => {
          this.toastr.error(
            this._transloco.translate('error-toastr.balance')
          );
          this.isLoading = false;
        }
      );
    }
  }

  enhanceTranslation() {
    this.toggleOriginBtn = false;
    this.isLoading = true;
    this.copyBtn = false;
    var formData = new FormData();
    formData.append('userInput', this.chatForm.value.text ?? '');
    formData.append('translateOutput', this.originalText);
    formData.append('targetLanguageId', this.selectedLanguageID);
    formData.append('sourceLanguageId', this.selectedSourceLanguage);
    console.log(formData);
    this.apiService.enhanceTranslation(url.enhance, formData).subscribe(
      (response: any) => {
        this.translatedText = response.text;
        this.enhancedText = response.text;
        this.isLoading = false;
        this.isEnhanced = true;
        this.copyBtn = true;
        this.toggleOriginBtn = true;
        this.enhanceBtnDisable = true;
      },
      (error) => {
        this.toastr.error(this._transloco.translate('error-toastr.balance'));
        this.isLoading = false;
      }
    );
  }

  toggleTextView() {
    this.toggleOrigin = !this.toggleOrigin;
    this.translatedText = this.isEnhanced
      ? this.originalText
      : this.enhancedText;
    this.isEnhanced = !this.isEnhanced;
  }

  deleteById(id: any): void {
    this.languages = this.languages.filter((item: any) => item.id !== id);
  }

  selectLanguage(lang: any, saveToStorage: boolean = true) {
    this.selectedLanguage = lang;
    this.selectedLanguageID = lang.id.toString();
    if (this.selectedLanguageID === '1') {
      this.selectedENG = false;
      this.selectedGEO = true;
      this.selectedOther = false;
    } else if (this.selectedLanguageID === '2') {
      this.selectedENG = true;
      this.selectedGEO = false;
      this.selectedOther = false;
    } else {
      this.selectedENG = false;
      this.selectedGEO = false;
      this.selectedOther = true;
    }
    if (saveToStorage) {
      this.languageSelectionService.setTextTargetLanguage(this.selectedLanguageID);
    }
    this.sendText();
  }

  chooseGe() {
    this.selectedENG = false;
    this.selectedLanguageID = '1';
    this.selectedGEO = true;
    this.selectedOther = false;
    this.languageSelectionService.setTextTargetLanguage(this.selectedLanguageID);
    this.sendText();
  }

  chooseEn() {
    this.selectedGEO = false;
    this.selectedLanguageID = '2';
    this.selectedENG = true;
    this.selectedOther = false;
    this.languageSelectionService.setTextTargetLanguage(this.selectedLanguageID);
    this.sendText();
  }

  setTranslatedText(lang: string) {
    if (lang === 'en') {
      this.translatedText = 'Translation';
    } else {
      this.translatedText = 'თარგმანი';
    }
  }

  onImage() {
    this._translateActive.setActiveComponent(ImageComponent);
  }

  onDoc() {
    this._translateActive.setActiveComponent(DocComponent);
  }

  copyToClipboard() {
    var textToCopy = this.generatedResponse.nativeElement.innerText;
    const textarea = this.renderer.createElement('textarea');
    this.renderer.setProperty(textarea, 'value', textToCopy);
    this.renderer.appendChild(document.body, textarea);

    textarea.select();
    document.execCommand('copy');

    this.renderer.removeChild(document.body, textarea);
    this.toastr.success('Copied to clipboard');
  }

  adjustTextareaHeight() {
    if (this.textareaElement && this.textareaElement.nativeElement) {
      const textarea = this.textareaElement
        .nativeElement as HTMLTextAreaElement;
      textarea.style.height = '50px';
      let scHeight = textarea.scrollHeight;
      textarea.style.height = scHeight > 10 ? `${scHeight}px` : '100px';
    }
  }

  updateTextareaContent(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    this.textareaContent = inputElement.value;
  }
}
