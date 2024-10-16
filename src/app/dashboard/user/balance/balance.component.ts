import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { BalanceService } from '../../../shared/services/balance.service';
import { AuthService } from '../../../shared/services/auth.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
})
export class BalanceComponent implements OnInit {
  amount: string = '';
  balance: any;
  userID: string = '';
  userInfo: any;

  constructor(
    private _balance: BalanceService,
    private _auth: AuthService,
    private _api: HttpService
  ) {}

  ngOnInit() {
    if (this._auth.isAuthenticated()) {
      const user = this._auth.userInfo();
      this.userID = user.UserId;
      this._api.get(url.user, this.userID).subscribe(
        (res) => {
          this.userInfo = JSON.parse(res);
          this._balance.setBalance(this.userInfo.balance);
          this._balance
            .getBalance()
            .subscribe((value) => (this.balance = value));
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  clickToBuy() {}

  onKeyUp(event: any) {
    this.formatCurrency(event.target);
  }

  onBlur(event: any) {
    this.formatCurrency(event.target, true);
  }

  formatNumber(value: string): string {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatCurrency(input: HTMLInputElement, blur: boolean = false) {
    let input_val = input.value;
    if (input_val === '') {
      return;
    }
    const original_len = input_val.length;
    let caret_pos = input.selectionStart || 0;

    if (input_val.indexOf('.') >= 0) {
      const decimal_pos = input_val.indexOf('.');
      let left_side = input_val.substring(0, decimal_pos);
      let right_side = input_val.substring(decimal_pos);
      left_side = this.formatNumber(left_side);
      right_side = this.formatNumber(right_side);
      if (blur) {
        right_side += '00';
      }
      right_side = right_side.substring(0, 2);
      input_val = '₾' + left_side + '.' + right_side;
    } else {
      input_val = this.formatNumber(input_val);
      input_val = '₾' + input_val;
      if (blur) {
        input_val += '.00';
      }
    }
    input.value = input_val;
    const updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input.setSelectionRange(caret_pos, caret_pos);
  }
}
