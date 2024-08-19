import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JwtDecodeService } from './jwt-decode.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: any;

  constructor(
    private http: HttpClient,
    private jwt_decode: JwtDecodeService,
    @Inject(PLATFORM_ID) private platformId: Object
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
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('authorize') != null;
    }
    return false;
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
    localStorage.removeItem('authorize');
    this.refreshPage();
  }

  refreshPage() {
    window.location.reload();
  }

  GetUserInfo() {
    const storedData = localStorage.getItem('authorize');
    if (storedData == null) return null;
    const metadata = this.jwt_decode.decodeToken(storedData);
    return metadata;
  }
}
