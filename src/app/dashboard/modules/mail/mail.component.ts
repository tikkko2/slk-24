import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { TextComponent } from '../translate-options/text/text.component';
import { Language } from '../../../shared/interfaces/language.interface';
import { HttpService } from '../../../shared/services/http.service';
import { AuthService } from '../../../shared/services/auth.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { url } from '../../../shared/data/api';
import { form, language } from '../../../shared/data/language';
import { EmailModel } from '../../../shared/models/email.model';
import { ProductCategoryService } from '../../../shared/services/product-category.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

interface Email {
  value: number,
  viewValue: string
}

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.scss',
})
export class MailComponent implements OnInit {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;

  activeComponent: any = TextComponent;

  maxChars: number = 5000;

  isLoggedIn: boolean = false;
  userID: string = '';
  userInfo: any;
  userInfoUpdate: any;
  balance: any;

  copyBtn: boolean = false;
  textareaContent: string = '';
  imageUrl: SafeUrl | null = null;

  isLoading: boolean = false;
  selectedLanguage = 0;
  notSelectedLanguage = false;

  emailFormId = 1;
  translatedText: string = '';

  languages: Language[] = [];
  emailFormList: Email[] = form;

  constructor(
    private builder: FormBuilder,
    private apiService: HttpService,
    private authService: AuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private router: Router,
    private balanceService: BalanceService,
    public _transloco: TranslocoService,
    private languageService: ProductCategoryService
  ) { }

  ngOnInit() {

    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    this.adjustTextareaHeight();
    if (this.isLoggedIn) {
      this.languageService.getLanguage(url.language).subscribe(
        (response: any) => {
          this.languages = response;
          this.deleteById(10);
        },
        (error) => {
          console.error('Error fetching languages', error);
        }
      );
    } else {
      this.languageService.getFreeLanguage(url.language).subscribe(
        (response: any) => {
          this.languages = response;
          this.deleteById(10);
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

  chatForm: FormGroup = this.builder.group({
    text: this.builder.control(``, Validators.required),
  });

  sendText() {
    if (this.selectedLanguage === 0) {
      this.notSelectedLanguage = true;
      return;
    }
    if (!this.chatForm.valid || !this.chatForm.value.text?.trim()) {
      this.toastr.error(this._transloco.translate('error-toastr.email-text'));
      return;
    };
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
    this.notSelectedLanguage = false;

    const userMessageText = this.chatForm.value.text ?? '';

    const model = new EmailModel(
      userMessageText,
      Number(this.selectedLanguage),
      Number(this.emailFormId)
    );

    if (!this.authService.isAuthenticated()) {
      this.apiService.postFreeEmail(url.email, model).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = false;
          this.copyBtn = !this.copyBtn;
        },
        (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      );
    } else {
      this.apiService.postEmail(url.email, model).subscribe(
        (response: any) => {
          this.translatedText = response.text;
          this.isLoading = false;
          this.copyBtn = !this.copyBtn;

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
          console.error('Error:', error);
          this.isLoading = false;
        }
      );
    }
  }

  deleteById(id: any): void {
    this.languages = this.languages.filter((item: any) => item.id !== id);
  }

  setTranslatedText(lang: string) {
    if (lang === 'en') {
      this.translatedText = 'Our advice';
    } else {
      this.translatedText = 'ჩვენი რჩევა';
    }
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
