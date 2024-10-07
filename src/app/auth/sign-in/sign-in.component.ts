import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { url } from '../../shared/data/api';
import { HttpService } from '../../shared/services/http.service';

declare const FB: any;

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  incorrect: boolean = false;

  constructor(
    private _router: Router,
    private _builder: FormBuilder,
    private authService: AuthService,
    private _http: HttpService,
    private userService: UserService,
    private toastr: ToastrService,
    private location: Location,
    private _ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this._builder.group({
      username: this._builder.control(``, Validators.required),
      password: this._builder.control(``, Validators.required),
    });
  }

  proceedLogin(){
    if (this.loginForm.valid) {
      this.isLoading = !this.isLoading;
      const data = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      };
      this.userService.authorize(data).subscribe(
        (res) => {
          this.authService.JWTtoSession(res);
          this.isLoading = !this.isLoading;
          this._router.navigate(['/services']);
        },
        (err) => {
          console.log(err);
          this.loginForm.setErrors({ ...this.loginForm.errors, 'incorrect': true });
          this.isLoading = !this.isLoading;
          this.incorrect = !this.incorrect;
        }
      );
    } else {
      this.toastr.error('შეავსეთ ყველა ველი');
    }
  }

  async loginWithFB() {
    debugger;
    FB.login(async (result: any) => {
      debugger;
      if (result.authResponse) {
        // Correct way to access accessToken
        const accessToken = result.authResponse.accessToken;

        // Call your API to log in using the Facebook access token
        await this._http.loginWithFacebook(url.loginFB, accessToken).subscribe(
          (res: any) => {
            this._ngZone.run(() => {
              this._router.navigate(['/services']);
            });
          },
          (err: any) => {
            console.log(err);
          }
        );
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'email' });
  }

  navigateToSignUp() {
    this._router.navigate(['/sign-up']);
  }

  navigateToServices() {
    this._router.navigate(['/services']);
  }

  goBack(): void {
    this.location.back();
  }
}
