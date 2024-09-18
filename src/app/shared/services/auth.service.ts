import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JwtDecodeService } from './jwt-decode.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  accessToken: any;
  private logoutInProgress = false;

  constructor(
    private http: HttpClient,
    private _router: Router,
    private jwt_decode: JwtDecodeService
  ) {}

  Get(apiurl: string) {
    return this.http.get(apiurl);
  }

  Post(apiurl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(apiurl, data, { headers: headers });
  }

  IsLoggedIn() {
    return localStorage.getItem('authorize') != null;
  }

  JWTtoSession(data: any): void {
    this.accessToken = data.token;
    const jwtMetadata = {
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
    localStorage.setItem('authorize', JSON.stringify(jwtMetadata));
  }

  ClearSession(): void {
    if (this.logoutInProgress) return;

    this.logoutInProgress = true;
    localStorage.removeItem('authorize');

    this._router.navigate(['/services']).then(() => {
      this.logoutInProgress = false;
      window.location.reload();
    });
  }

  GetUserInfo() {
    const storedData = localStorage.getItem('authorize');
    if (storedData == null) return null;
    const metadata = this.jwt_decode.decodeToken(storedData);
    return metadata;
  }
}
