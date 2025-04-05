import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';

export interface PurchaseDialogData {
  amount: string;
  packageName: string;
}

@Component({
  selector: 'app-purchase-modal',
  template: `
    <div class="purchase-modal-container p-4">
      <div class="text-center mb-4">
        <div class="credit-card-icon"></div>
        <h2>{{ purchaseTitle }}</h2>
      </div>
      
      <div class="package-row mb-4">
        <span class="package-badge">{{ data.packageName }}</span>
        <span class="amount">{{ data.amount }}</span>
      </div>
      
      <div class="bank-section">
        <p class="bank-info-title">
          <span class="bank-icon"></span> {{ bankInfoLabel }}
        </p>
        
        <p class="bank-detail">
          <span class="building-icon"></span> {{ bankNameLabel }}: Bank of Georgia
        </p>
        
        <p class="bank-detail">
          <span class="card-icon"></span> {{ accountNumberLabel }}: GE123456789012345678
        </p>
        
        <p class="bank-detail mb-4">
          <span class="person-icon"></span> {{ recipientLabel }}: Suliko AI
        </p>
        
        <p class="mt-3">{{ contactInfoLabel }}</p>
        
        <p class="contact-detail">
          <span class="email-icon"></span> misha&#64;api24.ge
        </p>
        
        <p class="contact-detail mb-4">
          <span class="phone-icon"></span> +995 579 737 737
        </p>
      </div>

      <div class="text-center">
        <button type="button" class="close-button" (click)="closeDialog()">
          {{ closeLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .purchase-modal-container {
      max-width: 500px;
    }
    
    .credit-card-icon {
      width: 30px;
      height: 20px;
      margin: 0 auto 10px;
      background-color: #3b59f3;
      border-radius: 3px;
      position: relative;
    }
    
    .credit-card-icon:after {
      content: "";
      position: absolute;
      left: 5px;
      top: 12px;
      width: 20px;
      height: 2px;
      background-color: white;
      box-shadow: 0 -4px 0 white, 0 -8px 0 white;
    }
    
    .package-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0;
    }
    
    .package-badge {
      padding: 8px 20px;
      background: #3b59f3;
      border-radius: 20px;
      color: white;
      font-weight: bold;
    }
    
    .amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3b59f3;
    }
    
    .bank-section {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    
    .bank-info-title {
      color: #3b59f3;
      font-weight: bold;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .bank-detail, .contact-detail {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      margin-left: 15px;
    }
    
    .bank-icon, .building-icon, .card-icon, .person-icon, .email-icon, .phone-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 10px;
      background-color: #3b59f3;
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
    }
    
    .bank-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.5,1L2,6V8H21V6L11.5,1M16,10V17H19V10H16M2,22H21V19H2V22M10,10V17H13V10H10M4,10V17H7V10H4Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.5,1L2,6V8H21V6L11.5,1M16,10V17H19V10H16M2,22H21V19H2V22M10,10V17H13V10H10M4,10V17H7V10H4Z'/%3E%3C/svg%3E");
    }
    
    .building-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19,2H9V1H7V2H5C3.9,2,3,2.9,3,4V20C3,21.1,3.9,22,5,22H19C20.1,22,21,21.1,21,20V4C21,2.9,20.1,2,19,2M9,4H11V6H9V4M13,4H15V6H13V4M9,8H11V10H9V8M13,8H15V10H13V8M9,12H11V14H9V12M13,12H15V14H13V12Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19,2H9V1H7V2H5C3.9,2,3,2.9,3,4V20C3,21.1,3.9,22,5,22H19C20.1,22,21,21.1,21,20V4C21,2.9,20.1,2,19,2M9,4H11V6H9V4M13,4H15V6H13V4M9,8H11V10H9V8M13,8H15V10H13V8M9,12H11V14H9V12M13,12H15V14H13V12Z'/%3E%3C/svg%3E");
    }
    
    .card-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20,8H4V6H20M20,18H4V12H20M20,4H4C2.9,4,2,4.9,2,6V18C2,19.1,2.9,20,4,20H20C21.1,20,22,19.1,22,18V6C22,4.9,21.1,4,20,4Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20,8H4V6H20M20,18H4V12H20M20,4H4C2.9,4,2,4.9,2,6V18C2,19.1,2.9,20,4,20H20C21.1,20,22,19.1,22,18V6C22,4.9,21.1,4,20,4Z'/%3E%3C/svg%3E");
    }
    
    .person-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z'/%3E%3C/svg%3E");
    }
    
    .email-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20,4H4C2.9,4,2,4.9,2,6V18C2,19.1,2.9,20,4,20H20C21.1,20,22,19.1,22,18V6C22,4.9,21.1,4,20,4M20,8L12,13L4,8V6L12,11L20,6V8Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20,4H4C2.9,4,2,4.9,2,6V18C2,19.1,2.9,20,4,20H20C21.1,20,22,19.1,22,18V6C22,4.9,21.1,4,20,4M20,8L12,13L4,8V6L12,11L20,6V8Z'/%3E%3C/svg%3E");
    }
    
    .phone-icon {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z'/%3E%3C/svg%3E");
    }
    
    .close-button {
      background: #3b59f3;
      color: white;
      padding: 10px 30px;
      border: none;
      border-radius: 20px;
      font-weight: bold;
    }
  `]
})
export class PurchaseModalComponent implements OnInit {
  // Pre-loaded translation labels
  purchaseTitle = 'Payment Information';
  bankInfoLabel = 'Bank Details';
  bankNameLabel = 'Bank';
  accountNumberLabel = 'Account';
  recipientLabel = 'Recipient';
  contactInfoLabel = 'Contact us:';
  closeLabel = 'Close';

  constructor(
    public dialogRef: MatDialogRef<PurchaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PurchaseDialogData,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    // Load translations
    this.loadTranslations();
  }

  loadTranslations(): void {
    const lang = this.transloco.getActiveLang();
    
    if (lang === 'ge') {
      // Georgian translations
      this.purchaseTitle = 'გადახდის ინფორმაცია';
      this.bankInfoLabel = 'საბანკო რეკვიზიტები';
      this.bankNameLabel = 'ბანკი';
      this.accountNumberLabel = 'ანგარიში';
      this.recipientLabel = 'მიმღები';
      this.contactInfoLabel = 'დაგვიკავშირდით:';
      this.closeLabel = 'დახურვა';
    } else {
      // English translations (default)
      this.purchaseTitle = 'Payment Information';
      this.bankInfoLabel = 'Bank Details';
      this.bankNameLabel = 'Bank';
      this.accountNumberLabel = 'Account';
      this.recipientLabel = 'Recipient';
      this.contactInfoLabel = 'Contact us:';
      this.closeLabel = 'Close';
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}