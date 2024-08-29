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
import { TranslateModel } from '../../../../shared/models/translate.model';
import { url } from '../../../../shared/data/api';
import { SafeUrl } from '@angular/platform-browser';
import { Language } from '../../../../shared/interfaces/language.interface';
import { ProductCategoryService } from '../../../../shared/services/product-category.service';
import { FreeServiceService } from '../../../../shared/services/free-service.service';
import { switchMap, timer } from 'rxjs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss',
})
export class TextComponent implements OnInit, AfterViewInit {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;

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

  isLoading: boolean = false;
  selectedLanguage: number = 0;
  uniqueKey = '00a48775-c474-49d4-9705-46c9c67e512a';

  translatedText: string = 'Translation';

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
    private _router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.IsLoggedIn();
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
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

    }
  }
  ngAfterViewInit() {
    if(!this.isLoggedIn) {
      timer(500).pipe(
        switchMap(() => this.languageService.getFreeLanguage(url.language))
      ).subscribe(
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

  sendText() {
    if(this.selectedLanguage === 0) {
      this.toastr.error('აირჩიეთ სამიზნე ენა')
      return;
    }
    if (!this.chatForm.valid) {
      this.toastr.error('ჩაწერეთ სათარგმნი ტექსტი');
      return;
    };
    if (
      this.apiService.hasExceededFreeRequests() &&
      !this.authService.IsLoggedIn()
    ) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      this._router.navigate(['/sign-up'])
      return;
    }
    if (this.balance <= 0) {
      this.toastr.error('არასაკმარისი ბალანსის გამო ვეღარ ისარგებლებთ სერვისებით, შეავსეთ!');
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    const userMessageText = this.chatForm.value.text ?? '';

    const model = new TranslateModel(
      userMessageText,
      Number(this.selectedLanguage),
      this.uniqueKey
    );

    this.apiService.postTranslate(url.translate, model).subscribe(
      (response: any) => {
        this.translatedText = response.text.replace(/<br\s*\/?>/gi, '');
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
