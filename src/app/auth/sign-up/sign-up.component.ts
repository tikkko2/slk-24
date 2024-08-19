import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  constructor(
    private _router: Router,
  ) {}

  navigateToSignIn() {
    this._router.navigate(['/sign-in']);
  }

  navigateToServices() {
    this._router.navigate(['/services']);
  }
}
