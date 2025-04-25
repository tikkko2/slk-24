import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../../../shared/services/http.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BalanceService } from '../../../../shared/services/balance.service';
import { url } from '../../../../shared/data/api';
import gsap from 'gsap';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrl: './ocr.component.scss',
})
export class OcrComponent implements OnInit {
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
    'ვმუშაობთ',
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

  file: File | null = null;
  fileName: string = '';
  isLoading: boolean = false;
  isProcessing: boolean = false;
  isNotUpload = false;

  constructor(
    private toastr: ToastrService,
    private builder: FormBuilder,
    private apiService: HttpService,
    private authService: AuthService,
    private router: Router,
    private balanceService: BalanceService,
    public _transloco: TranslocoService
  ) {}

  ocrForm = this.builder.group({
    file: this.builder.control(null, Validators.required),
  });

  ngOnInit() {
    this.balanceService
      .getBalance()
      .subscribe((value) => (this.balance = value));
    
    this._transloco.langChanges$.subscribe((lang) => {
      this.setDropText(lang);
    });
    this.setDropText(this._transloco.getActiveLang());
  }

  processFile() {
    if (!this.file) {
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
    formData.append('file', this.file);

    if (!this.authService.isAuthenticated()) {
      this.apiService.postFreeFile(url.eTranslate, formData).subscribe(
        (response: any) => {
          this.handleFileResponse(response);
        },
        (error) => {
          this.handleError(error);
        }
      );
    } else {
      this.apiService.postFile(url.eTranslate, formData).subscribe(
        (response: any) => {
          this.handleFileResponse(response);
          
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
          this.handleError(error);
        }
      );
    }
  }

  private handleFileResponse(response: any) {
    this.isLoading = false;
    this.isProcessing = true;
    this.stopProgressBarAnimation();
    
    // Download the file
    this.downloadFile(response);
    
    // Show success message
    this.toastr.success(this._transloco.translate('translate.ocr-download-success') || 'File processed successfully');
  }

  private handleError(error: any) {
    this.toastr.error(`${error.error?.errorText || 'An error occurred'}`);
    this.isLoading = false;
    this.divStyle = '';
    console.log(error);
  }

  private downloadFile(data: any) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_result_${new Date().getTime()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getFile(event: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.file = fileInput.files[0];
      this.fileName = this.file.name;
      this.isNotUpload = false;
    }
    fileInput.value = '';
  }

  deleteFile() {
    this.file = null;
    this.fileName = '';
  }

  changeBack() {
    this.divStyle = 'dragover';
    this.text = `<span class="text-white">ჩააგდეთ</span><br><br>`;
  }

  changeBackLeave() {
    this.divStyle = '';
    this.text = `Drag and drop or <span class="text-primary c-p">Browse</span> file(s)`;
  }

  setDropText(lang: string) {
    if (lang === 'en') {
      this.text =
        'Drag and drop or <span class="text-primary c-p">Browse</span> file';
    } else {
      this.text =
        'ჩააგდეთ ან <span class="slk-color c-p">ატვირთეთ</span> ფაილი';
    }
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