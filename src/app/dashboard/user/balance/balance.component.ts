import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
})
export class BalanceComponent {
  amount: string = '';

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
