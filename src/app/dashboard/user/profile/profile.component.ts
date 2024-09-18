import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FreeServiceService } from '../../../shared/services/free-service.service';
import { BalanceService } from '../../../shared/services/balance.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  isLoggedIn: boolean = false;
  isLoading: boolean = false;

  balance: any;
  userInfo: any;

  userDetails = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
  };

  passwordChange: boolean = false;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _api: HttpService,
    private _balance: BalanceService,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private _free: FreeServiceService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this._auth.IsLoggedIn();
    if (this.isLoggedIn) {
      const user = this._auth.GetUserInfo();
      this.userDetails.id = user.UserId;
      this._api.get(url.user, this.userDetails.id).subscribe(
        (res) => {
          this.userInfo = JSON.parse(res);
          this.userDetails.name = `${
            this.userInfo.firstName + ' ' + this.userInfo.lastName
          }`;
          this.userDetails.role = this.userInfo.roleName;
          this.userDetails.email = this.userInfo.email;
          this.userDetails.phone = this.userInfo.phoneNUmber;
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

  passwordForm = this.builder.group({
    oldPassword: this.builder.control('', Validators.required),
    newPassword: this.builder.control('', Validators.required),
  });

  changePassword() {
    if (this.isLoggedIn) {
      if (this.passwordForm.invalid) {
        this.toastr.error('შეავსეთ ყველა ველი', 'Error');
      }
      this.isLoading = !this.isLoading;
      const data = {
        id: this.userDetails.id,
        currentPassword: this.passwordForm.value.oldPassword,
        newPassword: this.passwordForm.value.newPassword,
      };
      this._api.patchChangePassword(url.user, data).subscribe(
        (response) => {
          this.togglePassword();
          this.passwordForm.reset();
          this.isLoading = !this.isLoading;
          this.toastr.success('პაროლი წარმატებით შეიცვალა!');
        },
        (error) => {
          console.error(error.error);
          if (
            !this.passwordForm.invalid &&
            error.error ==
              'Changing password has failed. Current Password is not correct'
          ) {
            this.toastr.error(`ძველი პაროლი არასწორია!`);
          }
          this.isLoading = !this.isLoading;
        }
      );
    }
  }

  togglePassword() {
    this.passwordChange = !this.passwordChange;
  }

  navigateBalance() {
    this._router.navigate(['/services/balance']);
  }
}
