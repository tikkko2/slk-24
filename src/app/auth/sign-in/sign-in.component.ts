import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
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
    private userService: UserService,
    private toastr: ToastrService
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
          console.log("success");
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

  navigateToSignUp() {
    this._router.navigate(['/sign-up']);
  }

  navigateToServices() {
    this._router.navigate(['/services']);
  }
}
