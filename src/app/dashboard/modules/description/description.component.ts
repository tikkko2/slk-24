import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../../shared/services/http.service';
import { ContentModel } from '../../../shared/models/content.model';
import { url } from '../../../shared/data/api';
import { ProductCategoryService } from '../../../shared/services/product-category.service';
import { Category } from '../../../shared/interfaces/category.interface';
import { map, Observable, of, startWith } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent {
  @ViewChild('generatedResponse', { static: false }) generatedResponse!: ElementRef;
  selectedCategoryName: string = '';
  userMessageText: string = '';
  responseText: any;

  userInfoUpdate: any;
  userID: string = '';
  balance: any;
  isLoggedIn: boolean = false;

  isLoading: boolean = false;
  isSmallScreen: boolean = false;
  sent: boolean = false;

  selectedLanguage = '1';

  filterString: string = '';
  selectedProductCategoryId: string = '';
  productCategoryList: Category[] = [];
  filterOptions: Observable<Category[]> = of([]);

  notSelectedCategory = false;
  notProductName = false;

  constructor(
    private authService: AuthService,
    private builder: FormBuilder,
    private apiService: HttpService,
    private productService: ProductCategoryService,
    private toastr: ToastrService,
    private router: Router,
    private balanceService: BalanceService,
    public _transloco: TranslocoService,
    private renderer: Renderer2
  ) {}

  chatForm = this.builder.group({
    text: this.builder.control(``, Validators.required),
    category: this.builder.control(``),
  });

  ngOnInit(): void {

    var user = this.authService.userInfo();

    this.initializeFilterOptions();
    this.checkScreenWidth();
    this.balanceService.getBalance().subscribe(value => this.balance = value);

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

  }

  sendText() {
    if(!this.chatForm.valid && this.selectedProductCategoryId == '') {
      this.notProductName = true;
      this.notSelectedCategory = true;
      return;
    }
    if(this.selectedProductCategoryId == '') {
      this.notSelectedCategory = true;
      return;
    }
    if (!this.chatForm.valid) {
      this.notProductName = true;
      return;
    };
    if (this.apiService.hasExceededFreeRequests() && !this.authService.isAuthenticated()) {
      this.toastr.error(this._transloco.translate('error-toastr.registration'));
      this.router.navigate(['/sign-up']);
      return;
    }
    if(this.balance <= 0) {
      this.toastr.error(this._transloco.translate('error-toastr.balance'));
      this.router.navigate(['/services/balance']);
      return;
    }
    this.isLoading = !this.isLoading;
    this.responseText = '';

    this.userMessageText = this.chatForm.value.text ?? '';
    this.saveCategoryName();
    this.chatForm.get('text')?.reset();

    const model = new ContentModel(
      this.userMessageText,
      Number(this.selectedLanguage),
      this.selectedProductCategoryId,
      []
    );

    if(this.authService.isAuthenticated()) {
      this.apiService.postContent(url.content, model).subscribe(
        (response: any) => {
          this.sent = !this.sent;
          this.responseText = response.text.replace(/<br\s*\/?>/gi, '');
          this.isLoading = false;

          var user = this.authService.userInfo();
          if(this.isLoggedIn) {
            this.userID = user.UserId;
            this.apiService.get(url.user, this.userID).subscribe(
              (res) => {
                this.userInfoUpdate = JSON.parse(res);
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
    } else {
      this.apiService.postFreeContent(url.content, model).subscribe(
        (response: any) => {
          this.sent = !this.sent;
          this.responseText = response.text.replace(/<br\s*\/?>/gi, '');
          this.isLoading = false;
        },
        (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      )
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
    const activeLang = this._transloco.getActiveLang();
    return this.productCategoryList.filter(category => {
      if (activeLang === 'ge') {
        return category.name.toLowerCase().includes(searchValue);
      } else {
        return category.nameEng.toLowerCase().includes(searchValue);
      }
    });
  }

  onCategorySelection(event: MatSelectChange) {
    this.selectedProductCategoryId = event.value;
  }

  saveCategoryName() {
    const selectedCategory = this.productCategoryList.find(
      category => category.id === this.selectedProductCategoryId
    );
    if (selectedCategory) {
      this.selectedCategoryName = selectedCategory.name;
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth();
  }

  private checkScreenWidth(): void {
    this.isSmallScreen = window.innerWidth < 620;
  }
}
