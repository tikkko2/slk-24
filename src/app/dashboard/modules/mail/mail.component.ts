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

interface Email {
  value: number,
  viewValue: string
}

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class MailComponent implements OnInit {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;

  activeComponent: any = TextComponent;

  maxChars: number = 2500;

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
  emailFormId = 1;
  uniqueKey = '00a48775-c474-49d4-9705-46c9c67e512a';

  translatedText: string = 'იმეილის პასუხი';

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
    private languageService: ProductCategoryService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.IsLoggedIn();
    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    this.adjustTextareaHeight();
    if(this.isLoggedIn) {
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
  }

  chatForm: FormGroup = this.builder.group({
    text: this.builder.control(``, Validators.required),
  });

  sendText() {
    if(this.selectedLanguage === 0) {
      this.toastr.error('აირჩიეთ ენა')
      return;
    }
    if (!this.chatForm.valid) {
      this.toastr.error('ჩაწერეთ ტექსტი', 'ფორმა ცარიელია!');
      return;
    };
    if (
      this.apiService.hasExceededFreeRequests() &&
      !this.authService.IsLoggedIn()
    ) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      this.router.navigate(['/sign-up']);
      return;
    }
    if (this.balance <= 0) {
      this.toastr.error('არასაკმარისი ბალანსის გამო ვეღარ ისარგებლებთ სერვისებით, შეავსეთ!');
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    const userMessageText = this.chatForm.value.text ?? '';

    const model = new EmailModel(
      userMessageText,
      Number(this.selectedLanguage),
      Number(this.emailFormId)
    );

    if(!this.authService.IsLoggedIn()) {
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

          var user = this.authService.GetUserInfo();
          if (this.isLoggedIn) {
            this.userID = user.UserId;
            this.apiService.get(url.user, this.userID).subscribe(
              (res) => {
                this.userInfoUpdate = JSON.parse(res);
                delete this.userInfoUpdate.roleName;
                this.userInfoUpdate.balance -= 10;
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

  onFileSelected(event: Event): void {}

  onDeleteImage(): void {}

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
