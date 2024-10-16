import { Component } from '@angular/core';
import { MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../shared/services/auth.service';
import { HttpService } from '../../../shared/services/http.service';
import { url } from '../../../shared/data/api';
import { response } from 'express';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-account-delete',
  templateUrl: './account-delete.component.html',
  styleUrl: './account-delete.component.scss'
})
export class AccountDeleteComponent {
  userDetails = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
  };

  constructor(
    private _dialog: MatDialogRef<AccountDeleteComponent>,
    private _auth: AuthService,
    private _http: HttpService,
    private _router: Router,
    public _transloco: TranslocoService
  ) {}

  ngOnInit() {
    if (this._auth.isAuthenticated()) {
      const user = this._auth.userInfo();
      this.userDetails.id = user.UserId;
    }
  }

  deleteAcc() {
    this._http.deleteAcc(`${url.user}/${this.userDetails.id}`, this.userDetails.id).subscribe(
      (response) => {
        this._router.navigate(['/services']);
        // this._auth.ClearSession();
      },
      (error) => {
        console.error(error);
      }
    )
  }

  close() {
    this._dialog.close();
  }
}
