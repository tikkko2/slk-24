import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../shared/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatWithPhotoModel } from '../../../shared/models/chat-with-photo.model';
import { url } from '../../../shared/data/api';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrl: './copyright.component.scss',
})
export class CopyrightComponent implements OnInit {
  @ViewChild('generatedResponse', { static: false })
  generatedResponse!: ElementRef;

  userMessageText: string = '';
  responseText: any;
  isLoading: boolean = false;

  userInfoUpdate: any;
  balance: any;
  userID: string = '';
  isLoggedIn: boolean = false;

  displayUploadedImageTextArea: SafeUrl | null = null;
  displayImageOnUserChat: any = null;

  file: any;
  selectedLanguage = '1';
  chats: ChatWithPhotoModel[] = [];

  notProductName = false;
  notUploadedFile = false;

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private router: Router,
    private apiService: HttpService,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private balanceService: BalanceService,
    private _transloco: TranslocoService,
  ) {}

  ngOnInit() {

    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
  }

  chatForm: FormGroup = this.builder.group({
    text: this.builder.control(``, Validators.required),
    file: this.builder.control(``, Validators.required),
  });

  sendText() {
    this.notProductName = false;
    this.notUploadedFile = false;
    if (!this.chatForm.valid) {
      this.notProductName = true;
      this.notUploadedFile = true;
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
    this.displayUploadedImageTextArea = null;
    this.isLoading = true;
    this.userMessageText = this.chatForm.value.text ?? '';

    var formData = new FormData();
    formData.append('productName', this.chatForm.value.text);
    formData.append('languageId', this.selectedLanguage);
    formData.append('file', this.file);

    this.chatForm.reset();

    if (this.authService.isAuthenticated()) {
      this.apiService.postWriter(url.copyright, formData).subscribe(
        (response: any) => {
          this.responseText = response.text;
          this.isLoading = false;

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
          const errorText =
            error.error.errorText || 'An unexpected error occurred';
          this.responseText = errorText;
          this.isLoading = false;
        }
      );
    } else {
      this.apiService.postFreeWriter(url.copyright, formData).subscribe(
        (response: any) => {
          this.responseText = response.text;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error:', error);
          const errorText =
            error.error.errorText || 'An unexpected error occurred';
          this.responseText = errorText;
          this.isLoading = false;
        }
      );
    }
  }

  onFileSelected(event: any) {
    this.responseText = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.file = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.displayUploadedImageTextArea =
          this.sanitizer.bypassSecurityTrustUrl(e.target.result);
        this.displayImageOnUserChat = this.sanitizer.bypassSecurityTrustUrl(
          e.target.result
        );
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

  canDeactivate(): boolean | Observable<boolean> {
    if (this.isLoading) {
      // Warn user only if waiting for the API response
      return confirm('The API is still processing. Are you sure you want to leave? Any unsaved progress will be lost.');
    }
    return true;  // Allow navigation if no API call is pending
  }
}
