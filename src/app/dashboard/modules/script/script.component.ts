import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatModel } from '../../../shared/models/chat.model';
import { HttpService } from '../../../shared/services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { url } from '../../../shared/data/api';
import { ChatWithPhotoModel } from '../../../shared/models/chat-with-photo.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BalanceService } from '../../../shared/services/balance.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrl: './script.component.scss'
})
export class ScriptComponent {
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;

  userMessageText: string = '';
  responseText: any;

  userInfoUpdate: any;
  balance: any;
  isLoggedIn: boolean = false;
  userID: string = '';

  displayUploadedImageTextArea: SafeUrl | null = null;
  displayImageOnUserChat: any = null;
  isLoading: boolean = false;

  file: any;
  selectedLanguage = '1';
  uniqueKey = '00a48775-c474-49d4-9705-46c9c67e512a';

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private router: Router,
    private apiService: HttpService,
    private authService: AuthService,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private balanceService: BalanceService
  ) {}

  chatForm: FormGroup = this.builder.group({
    text: this.builder.control(``, Validators.required),
    file: this.builder.control(``, Validators.required),
  });

  sendText() {
    if (!this.chatForm.valid) {
      this.toastr.error('გთხოვთ ჩაწეროთ პროდუქტის სახელი და ატვირთოთ ფოტო.');
      return;
    };
    if (this.apiService.hasExceededFreeRequests() && !this.authService.IsLoggedIn()) {
      this.toastr.error('აუცილებელია რეგისტრაცია');
      this.router.navigate(['/sign-up']);
      return;
    }
    if(this.balance <= 0) {
      this.toastr.error('შეავსეთ ბალანსი, ვეღარ ისარგებლებთ სერვისებით!');
      return;
    }
    this.displayUploadedImageTextArea = null;
    this.isLoading = true;
    this.userMessageText = this.chatForm.value.text ?? '';

    var formData = new FormData();

    formData.append('uniqueKey', this.uniqueKey);
    formData.append('productName', this.chatForm.value.text);
    formData.append('languageId', this.selectedLanguage);
    formData.append('file', this.file);

    this.chatForm.reset();

    this.apiService.postScript(url.videoScript, formData).subscribe(
      (response: any) => {
        this.responseText = response.text;
        this.isLoading = false;

        var user = this.authService.GetUserInfo();
        if(this.isLoggedIn) {
          this.userID = user.UserId;
          this.apiService.get(url.user, this.userID).subscribe(
            (res) => {
              this.userInfoUpdate = JSON.parse(res);
              delete this.userInfoUpdate.roleName;
              this.userInfoUpdate.balance -= 5;
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
        const errorText = error.error.errorText || 'An unexpected error occurred';
        this.responseText = errorText;
        this.isLoading = false;
      }
    );
  }

  onFileSelected(event: any) {
    this.responseText = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.file = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.displayUploadedImageTextArea = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
        this.displayImageOnUserChat = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      input.value = '';
    }
  }

  onDeleteImage(): void {
    this.displayUploadedImageTextArea = null;
    this.file = null;
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
}
