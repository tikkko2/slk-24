import { Component } from '@angular/core';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-require',
  templateUrl: './auth-require.component.html',
  styleUrl: './auth-require.component.scss'
})
export class AuthRequireComponent {
  constructor(
    private router: Router,
    private dialog: MatDialogRef<AuthRequireComponent>
  ) {}

  goToSignIn() {
    this.dialog.close();
    this.router.navigate(['/sign-in']);
  }

  goToSignUp() {
    this.dialog.close();
    this.router.navigate(['/sign-up']);
  }
}
