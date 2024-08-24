import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
import { ChatWithPhotoModel } from '../../../shared/models/chat-with-photo.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lawyer',
  templateUrl: './lawyer.component.html',
  styleUrl: './lawyer.component.scss',
})
export class LawyerComponent implements OnInit {
  @ViewChild('textareaElement', { static: false }) textareaElement!: ElementRef;

  userInfoUpdate: any;
  userID: string = '';
  isLoggedIn: boolean = false;
  balance: any;

  isLoading: boolean = false;
  chats: ChatModel[] = [];

  constructor(
    private router: Router,
    private apiService: HttpService,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private balanceService: BalanceService
  ) {}

  ngOnInit() {
    var user = this.authService.GetUserInfo();
    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    if (this.isLoggedIn) {
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

  chatForm: FormGroup = this.builder.group({
    text: this.builder.control(``, Validators.required),
  });

  sendText() {
    if (!this.chatForm.valid) {
      this.toastr.error(
        'გთხოვთ შეავსეთ ყველა ველი, პროდუქტის სახელი და კატეგორია.'
      );
      return;
    }
    if (
      this.apiService.hasExceededFreeRequests() &&
      !this.authService.IsLoggedIn()
    ) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      this.router.navigate(['/sign-up']);
      return;
    }
    if (this.balance <= 0) {
      this.toastr.error('შეავსეთ ბალანსი, ვეღარ ისარგებლებთ სერვისებით!');
      return;
    }

    this.isLoading = true;

    const userMessageText = this.chatForm.value.text ?? '';

    const data = {
      prompt: userMessageText,
    };

    const userMessage: ChatModel = new ChatModel(true, userMessageText, false);
    this.chats.push(userMessage);
    this.chatForm.get('text')?.reset();

    this.apiService.postLawyer(url.lawyer, data).subscribe(
      (response: any) => {
        var chatMessage = new ChatModel(false, response.response, false);
        this.chats.push(chatMessage);
        this.isLoading = false;

        var user = this.authService.GetUserInfo();
        if (this.isLoggedIn) {
          this.userID = user.UserId;
          this.apiService.get(url.user, this.userID).subscribe(
            (res) => {
              this.userInfoUpdate = JSON.parse(res);
              delete this.userInfoUpdate.roleName;
              this.userInfoUpdate.balance -= 15;
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
        const errorText =
          error.error.errorText || 'An unexpected error occurred';
        var chatMessage = new ChatModel(false, errorText, false);
        this.chats.push(chatMessage);
        this.isLoading = false;
      }
    );
  }

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

    this.chats.forEach((c, i) => (c.copied = i === index));

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
}
