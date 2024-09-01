import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  isLoading: boolean = false;
  incorrect: boolean = false;

  constructor(
    private _router: Router,
    private _builder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initForm();
    this.initLoginForm();
  }

  initForm() {
    this.registerForm = this._builder.group({
      firstname: this._builder.control(``, Validators.required),
      lastname: this._builder.control(``, Validators.required),
      email: this._builder.control(``, [Validators.required, Validators.email]),
      phone: this._builder.control(``, Validators.required),
      password: this._builder.control(``, Validators.required),
    });
  }

  initLoginForm() {
    this.loginForm = this._builder.group({
      username: this._builder.control(``, Validators.required),
      password: this._builder.control(``, Validators.required),
    });
  }

  proceedRegistration() {
    if (this.registerForm.valid) {
      this.isLoading = !this.isLoading;
      const data = {
        firstName: this.registerForm.value.firstname,
        lastName: this.registerForm.value.lastname,
        email: this.registerForm.value.email,
        phoneNUmber: this.registerForm.value.phone,
        password: this.registerForm.value.password,
      };
      this.userService.register(data).subscribe(
        (res) => {
          this.isLoading = !this.isLoading;
          const loginData = {
            username: data.email,
            password: data.password,
          }
          this.userService.authorize(loginData).subscribe(
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
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this.toastr.error(`${err.error.split('\r\n')[0]}`);
          this.isLoading = !this.isLoading;
        }
      )
    } else {
      this.toastr.error('შეავსეთ ყველა ველი');
    }
  }

  navigateToSignIn() {
    this._router.navigate(['/sign-in']);
  }

  navigateToServices() {
    this._router.navigate(['/services']);
  }
}
