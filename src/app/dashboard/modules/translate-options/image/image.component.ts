import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Language } from '../../../../shared/interfaces/language.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/services/http.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BalanceService } from '../../../../shared/services/balance.service';
import { url } from '../../../../shared/data/api';
import { TextToWordService } from '../../../../shared/services/text-to-word.service';
import gsap from 'gsap';
import { ProductCategoryService } from '../../../../shared/services/product-category.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { DocComponent } from '../doc/doc.component';
import { TranslateActiveService } from '../../../../shared/services/translate-active.service';
import { TextComponent } from '../text/text.component';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
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
  selectedLanguage = '0';
  selectedSourceLanguage = '0';
  uniqueKey = '00a48775-c474-49d4-9705-46c9c67e512a';

  isPdf = 'false';
  description = '';

  copyBtn: boolean = false;
  translatedText: any;

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

  ngOnInit() {
    this.isLoggedIn = this.authService.IsLoggedIn();
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

  imageTranslateForm = this.builder.group({
    files: this.builder.control(``, Validators.required),
  });

  sendImages() {
    switch (true) {
      case this.selectedLanguage === '0' && this.selectedSourceLanguage === '0':
        this.toastr.error('აირჩიეთ დედანისა და სამიზნე ენა');
        return;
      case this.selectedLanguage === '0':
        this.toastr.error('აირჩიეთ სამიზნე ენა');
        return;
      case this.selectedSourceLanguage === '0':
        this.toastr.error('აირჩიეთ დედანის ენა');
        return;
      default:
        break;
    }
    if (!this.imageTranslateForm.valid) {
      this.toastr.error('ატვირთეთ ფოტო/ფოტოები!');
      return;
    } else if (
      this.apiService.hasExceededFreeRequests() &&
      !this.authService.IsLoggedIn()
    ) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      this.router.navigate(['/sign-up']);
      return;
    } else if (this.balance <= 0) {
      this.toastr.error(
        'არასაკმარისი ბალანსის გამო ვეღარ ისარგებლებთ სერვისებით, შეავსეთ!'
      );
      return;
    } else if (this.isLoading) return;
    this.isLoading = true;
    this.animateProgressBar();
    this.divStyle = 'd-none';

    var formData = new FormData();
    formData.append('description', this.description);
    formData.append('languageId', this.selectedLanguage);
    formData.append('sourceLanguageId', this.selectedSourceLanguage);
    [...this.files].forEach((file) => {
      formData.append('files', file, file.name);
    });
    formData.append('isPdf', this.isPdf);

    if (!this.authService.IsLoggedIn()) {
      this.apiService
        .postFreeTranlate(url.fileTranslate, formData)
        .subscribe(
          (response: any) => {
            this.translatedText = response.text;
            this.isLoading = !this.isLoading;
            this.stopProgressBarAnimation();
          },
          (error) => {
            this.toastr.error(`${error.error.errorText}`);
            this.isLoading = !this.isLoading;
            this.stopProgressBarAnimation();
            console.log(error);
          }
        );
    } else {
      this.apiService.postTranslate(url.fileTranslate, formData).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = !this.isLoading;
          this.stopProgressBarAnimation();

          var user = this.authService.GetUserInfo();
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
          this.toastr.error(`${error.error.errorText}`);
          this.isLoading = !this.isLoading;
          this.stopProgressBarAnimation();
          console.log(error);
        }
      );
    }
  }

  getImage(event: any) {
    const fileInput = event.target as HTMLInputElement;
    const file: FileList = event.target.files;
    if (file) {
      this.files = Array.from(file);
      this.changeBackLeave();
    }
    this.changeBackLeave();
    fileInput.value = '';
  }

  deleteImage(index: number) {
    if (index > -1 && index < this.files.length) {
      this.files.splice(index, 1);
    }
  }

  downloadAsWord() {
    var textToCopy = this.generatedResponse.nativeElement.innerText;
    this.docxService.createDocument(textToCopy);
  }

  changeBack() {
    this.divStyle = 'dragover';
    this.text = `<span class="text-white">ჩააგდეთ</span><br><br>`;
  }

  changeBackLeave() {
    this.divStyle = '';
    this.text = `Drag and drop or <span class="text-primary c-p">Browse</span>`;
  }

  setDropText(lang: string) {
    if (lang === 'en') {
      this.text = 'Drag and drop or <span class="text-primary c-p">Browse</span> image(s)';
    } else {
      this.text = 'ჩააგდეთ ან <span class="text-primary c-p">ატვირთეთ</span> ფოტო/ფოტოები';
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
