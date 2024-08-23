import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { HttpService } from '../../../shared/services/http.service';
import { ContentModel } from '../../../shared/models/content.model';
import { ChatModel } from '../../../shared/models/chat.model';
import { url } from '../../../shared/data/api';
import { ProductCategoryService } from '../../../shared/services/product-category.service';
import { Category } from '../../../shared/interfaces/category.interface';
import { BehaviorSubject, map, Observable, of, startWith } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BalanceService } from '../../../shared/services/balance.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;

  username: string = '';
  initial: string = '';
  userInfo: any;
  userInfoUpdate: any;
  balance: any;

  isLoggedIn: boolean = false;
  userID: string = '';

  textareaContent: string = '';
  imageUrl: SafeUrl | null = null;
  copyBtn!: boolean;

  showGreeting: boolean = true;
  isLoading: boolean = false;

  selectedLanguage = '1';
  uniqueKey = '00a48775-c474-49d4-9705-46c9c67e512a';
  chats: ChatModel[] = [];

  isSmallScreen: boolean = false;

  filterString: string = '';
  selectedProductCategoryId: string = '';
  productCategoryList: Category[] = [];
  filterOptions: Observable<Category[]> = of([]);

  constructor(
    private authService: AuthService,
    private builder: FormBuilder,
    private apiService: HttpService,
    private productService: ProductCategoryService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private balanceService: BalanceService
  ) {}

  chatForm = this.builder.group({
    text: this.builder.control(``, Validators.required),
    category: this.builder.control(``),
  });

  ngOnInit(): void {
    this.isLoggedIn = this.authService.IsLoggedIn();
    this.initializeFilterOptions();
    // this.checkScreenWidth();
    this.balanceService.getBalance().subscribe(value => this.balance = value);
    if (this.isLoggedIn) {
      this.productService.getProductCategory(url.productCategory).subscribe(
        (response) => {
          this.productCategoryList = response;
          this.chatForm.get('category')?.updateValueAndValidity();
        },
        (error) => {
          console.error('Error fetching categories', error);
        }
      );
    } else {
      this.productService.getFreeProductCategory(url.productCategory).subscribe(
        (response) => {
          this.productCategoryList = response;
          this.chatForm.get('category')?.updateValueAndValidity();
        },
        (error) => {
          console.error('Error fetching categories', error);
        }
      );
    }
    var user = this.authService.GetUserInfo();
    if (user && typeof user === 'object') {
      this.username = user.email;
      const usernameSplit = this.username.split('@')[0];
      const usernameInitial = this.username.charAt(0);
      this.username = `${usernameSplit}`;
      this.initial = `${usernameInitial}`;
      this.userInfo = user;
    }
    if(this.isLoggedIn) {
      this.userID = user.UserId;
      this.apiService.get(url.user, this.userID).subscribe(
        (res) => {
          this.userInfoUpdate = JSON.parse(res);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  private initializeFilterOptions() {
    this.filterOptions = this.chatForm.get('category')!.valueChanges.pipe(
      startWith(''),
      map(value => this._FILTER(value || ''))
    );
  }

  private _FILTER(value: string): Category[] {
    const searchValue = value.toLowerCase();
    return this.productCategoryList.filter(category => category.name.toLowerCase().includes(searchValue));
  }

  onCategorySelection(event: MatSelectChange) {
    this.selectedProductCategoryId = event.value;
  }

  sendText() {
    if (!this.chatForm.valid || this.selectedProductCategoryId == '') {
      this.toastr.error('გთხოვთ შეავსეთ ყველა ველი, პროდუქტის სახელი და კატეგორია.');
      return;
    };
    if (this.apiService.hasExceededFreeRequests() && !this.authService.IsLoggedIn()) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      // this.dialog.open(AuthUiComponent);
      return;
    }
    if(this.balance <= 0) {
      this.toastr.error('შეავსეთ ბალანსი, ვეღარ ისარგებლებთ სერვისებით!');
      return;
    }

    this.showGreeting = false;
    // if (this.isLoading) return;
    this.isLoading = true;

    const userMessageText = this.chatForm.value.text ?? '';

    const userMessage: ChatModel = new ChatModel(true, userMessageText, false);
    this.chats.push(userMessage);
    this.chatForm.get('text')?.reset();

    const model = new ContentModel(
      userMessageText,
      Number(this.selectedLanguage),
      this.selectedProductCategoryId,
      this.uniqueKey,
      []
    );

    this.apiService.postContent(url.content, model).subscribe(
      (response: any) => {
        var chatMessage = new ChatModel(
          false,
          response.text.replace(/<br\s*\/?>/gi, ''),
          false
        );
        this.chats.push(chatMessage);
        this.isLoading = false;

        var user = this.authService.GetUserInfo();
        if(this.isLoggedIn) {
          this.userID = user.UserId;
          this.apiService.get(url.user, this.userID).subscribe(
            (res) => {
              this.userInfoUpdate = JSON.parse(res);
              delete this.userInfoUpdate.roleName;
              this.userInfoUpdate.balance -= 15;
              this.balanceService.setBalance(this.userInfoUpdate.balance);
              this.apiService.updateUserInfo('/api/User', this.userInfoUpdate).subscribe();
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

  onFileSelected(event: Event): void {}
  onDeleteImage(): void {}

  copyToClipboard(index: any) {
    const chat = this.chats[index];

    const tempElement = document.createElement('div');
    tempElement.innerHTML = chat.text;
    const textToCopy = tempElement.innerText;

    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);

    this.chats.forEach((c, i) => c.copied = i === index);

    setTimeout(() => {
      this.chats[index].copied = false;
    }, 2000);
  }

  adjustTextareaHeight() {
    if (this.textareaElement && this.textareaElement.nativeElement) {
      const textarea = this.textareaElement
        .nativeElement as HTMLTextAreaElement;
      textarea.style.height = '28px';
      let scHeight = textarea.scrollHeight;
      textarea.style.height = scHeight > 28 ? `${scHeight}px` : '28px';
    }
  }

  onEnterPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendText();
    }
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: Event): void {
  //   this.checkScreenWidth();
  // }

  // private checkScreenWidth(): void {
  //   this.isSmallScreen = window.innerWidth < 620;
  // }
}
