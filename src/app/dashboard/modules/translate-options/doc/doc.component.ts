import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Language } from '../../../../shared/interfaces/language.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { BalanceService } from '../../../../shared/services/balance.service';
import { HttpService } from '../../../../shared/services/http.service';
import { url } from '../../../../shared/data/api';
import gsap from 'gsap';
import { TextToWordService } from '../../../../shared/services/text-to-word.service';
import { ProductCategoryService } from '../../../../shared/services/product-category.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ImageComponent } from '../image/image.component';
import { TranslateActiveService } from '../../../../shared/services/translate-active.service';
import { TextComponent } from '../text/text.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrl: './doc.component.scss',
})
export class DocComponent implements OnInit {
  @ViewChild('generatedResponse', { static: false })
  generatedResponse!: ElementRef;
  @ViewChild('myFileInput') myFileInput: any;
  @ViewChild('progressBar') progressBar!: ElementRef;

  progressBarStates: number[] = Array.from({ length: 34 }, (_, i) => i * 3);
  time = 0;
  endState = 100;
  timeouts: any[] = [];
  currentPercentage = 0;
  currentText = 'სულიკო იწყებს';

  texts = [
    'სულიკო იწყებს',
    'ვმუშაობთ თარგმანზე',
    'პროცესში ვართ',
    'სულ ცოტაც',
    'რამდენიმე წამიც',
    'ბოლო შტრიხებიც',
  ];

  divStyle = '';
  text = `Drag and drop or <span class="text-primary c-p">Browse</span>`;

  isLoggedIn: boolean = false;
  userID: string = '';
  userInfo: any;
  userInfoUpdate: any;
  balance: any;

  files: any;
  isLoading: boolean = false;
  selectedLanguage: any;
  selectedLanguageID = '0';
  selectedSourceLanguage = '-1';

  isPdf = 'true';
  description = '';

  copyBtn: boolean = false;
  translatedText!: string;

  languageNotSelected = false;
  selectedGEO = false;
  selectedENG = false;
  selectedOther = false;
  isNotUpload = false;

  languages: Language[] = [];

  constructor(
    private toastr: ToastrService,
    private builder: FormBuilder,
    private apiService: HttpService,
    private authService: AuthService,
    private router: Router,
    private balanceService: BalanceService,
    private renderer: Renderer2,
    private docxService: TextToWordService,
    private languageService: ProductCategoryService,
    public _transloco: TranslocoService,
    private _translateActive: TranslateActiveService
  ) {}

  docTranslateForm = this.builder.group({
    files: this.builder.control(``, Validators.required),
  });

  ngOnInit() {

    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    if (this.isLoggedIn) {
      this.languageService.getLanguage(url.language).subscribe(
        (response: any) => {
          this.languages = response;
        },
        (error) => {
          console.error('Error fetching languages', error);
        }
      );
    } else {
      this.languageService.getFreeLanguage(url.language).subscribe(
        (response: any) => {
          this.languages = response;
        },
        (error) => {
          console.error('Error fetching languages', error);
        }
      );
    }
    this._transloco.langChanges$.subscribe((lang) => {
      this.setDropText(lang);
    });
    this.setDropText(this._transloco.getActiveLang());
  }

  sendDocs() {
    if (this.selectedLanguageID === '0') {
      this.languageNotSelected = true;
      return;
    }
    if (!this.docTranslateForm.valid) {
      // this.toastr.error(this._transloco.translate('translate.upload-file'));
      this.isNotUpload = true;
      return;
    }
    if (
      this.apiService.hasExceededFreeRequests() && !this.authService.isAuthenticated()
    ) {
      this.toastr.error(this._transloco.translate('error-toastr.registration'));
      this.router.navigate(['/sign-up']);
      return;
    }
    if (this.balance <= 0) {
      this.toastr.error(this._transloco.translate('error-toastr.balance'));
      this.router.navigate(['/services/balance']);
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;
    this.animateProgressBar();
    this.divStyle = 'd-none';

    var formData = new FormData();
    formData.append('description', this.description);
    formData.append('languageId', this.selectedLanguageID);
    formData.append('sourceLanguageId', this.selectedSourceLanguage);
    [...this.files].forEach((file) => {
      formData.append('files', file, file.name);
    });
    formData.append('isPdf', this.isPdf);

    if (!this.authService.isAuthenticated()) {
      this.apiService.postFreeTranslate(url.fileTranslate, formData).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = !this.isLoading;
          this.stopProgressBarAnimation();
        },
        (error) => {
          this.toastr.error(`${error.error.errorText}`);
          this.isLoading = !this.isLoading;
          this.divStyle = '';
          console.log(error);
        }
      );
    } else {
      this.apiService.postTranslate(url.fileTranslate, formData).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = !this.isLoading;
          this.stopProgressBarAnimation();

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
                this.toastr.error(`${err.error.errorText}`);
                this.isLoading = !this.isLoading;
                this.stopProgressBarAnimation();
                console.log(err);
              }
            );
          }
        },
        (error) => {
          this.toastr.error(`${error.error.errorText}`);
          this.isLoading = !this.isLoading;
          this.divStyle = '';
          console.log(error);
        }
      );
    }
  }

  downloadAsWord() {
    var textToCopy = this.generatedResponse.nativeElement.innerText;
    this.docxService.createDocument(textToCopy);
  }

  getImage(event: any) {
    const fileInput = event.target as HTMLInputElement;
    const file: FileList = event.target.files;
    if (file) {
      this.files = Array.from(file);
      // this.changeBackLeave();
      this.isNotUpload = false;
    }
    // this.changeBackLeave();
    fileInput.value = '';
  }

  deleteImage(index: number) {
    if (index > -1 && index < this.files.length) {
      this.files.splice(index, 1);
    }
  }

  changeBack() {
    this.divStyle = 'dragover';
    this.text = `<span class="text-white">ჩააგდეთ</span><br><br>`;
  }

  changeBackLeave() {
    this.divStyle = '';
    this.text = `Drag and drop or <span class="text-primary c-p">Browse</span> file(s)`;
  }

  selectLanguage(lang: any) {
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
  }

  chooseGe() {
    this.selectedENG = false;
    this.selectedLanguageID = '1';
    this.selectedGEO = true;
    this.selectedOther = false;
  }

  chooseEn() {
    this.selectedGEO = false;
    this.selectedLanguageID = '2';
    this.selectedENG = true;
    this.selectedOther = false;
  }

  setDropText(lang: string) {
    if (lang === 'en') {
      this.text =
        'Drag and drop or <span class="text-primary c-p">Browse</span> file(s)';
    } else {
      this.text =
        'ჩააგდეთ ან <span class="slk-color c-p">ატვირთეთ</span> ფაილი/ფაილები';
    }
  }

  onImage() {
    this._translateActive.setActiveComponent(ImageComponent);
  }

  onDoc() {
    this._translateActive.setActiveComponent(DocComponent);
  }

  onText() {
    this._translateActive.setActiveComponent(TextComponent);
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

  animateProgressBar() {
    if (this.isLoading) {
      this.progressBarStates.forEach((state) => {
        let randomTime = Math.floor(Math.random() * 2000);
        const timeoutId = setTimeout(() => {
          gsap.to(this.progressBar.nativeElement, {
            x: `${state}%`,
            duration: 4,
          });
          this.currentPercentage = state;
          this.currentText =
            this.texts[Math.floor((state / 100) * (this.texts.length - 1))];
        }, randomTime + this.time);
        this.timeouts.push(timeoutId);
        this.time += randomTime;
      });
    }
  }

  stopProgressBarAnimation() {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts = [];
    this.time = 0;
  }
}
