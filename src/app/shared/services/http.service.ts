import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, of, Subject, tap, throwError } from 'rxjs';
import { FreeServiceService } from './free-service.service';
import { url } from '../data/api';
import { JwtDecodeService } from './jwt-decode.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private host: string;
  private requestCount = 0;
  private maxFreeRequests = 1;

  public fakeToken: any;

  public $refreshToken = new Subject<boolean>();
  public refreshInProgress = false;

  constructor(
    private _http: HttpClient,
    private authService: AuthService,
    private freeService: FreeServiceService,
    private jwt_decode: JwtDecodeService
  ) {
    this.host = environment.apiUrl;
    this.$refreshToken.subscribe((res: any) => {
      this.getRefreshToken();
    });

  }

  getRefreshToken(): Observable<any> {
    let loggedUserData: any;
    if (this.authService.IsLoggedIn()) {
      const auth = localStorage.getItem('authorize');
      if (auth != null) {
        loggedUserData = JSON.parse(auth);
      }
      const obj = {
        accessToken: loggedUserData.accessToken,
        refreshToken: loggedUserData.refreshToken,
      };
      return this._http.post(`${this.host}${url.refresh}`, obj).pipe(
        tap((res: any) => {
          const jwtMetadata = {
            accessToken: res.token,
            refreshToken: res.refreshToken,
          };
          localStorage.setItem('authorize', JSON.stringify(jwtMetadata));
          this.refreshInProgress = false;
        }),
        catchError((error: any) => {
          console.error(error);
          this.refreshInProgress = false;
          return throwError(() => error);
        })
      );
    }
    return of();
  }

  isTokenExpired(): Observable<boolean> {
    const auth = localStorage.getItem('authorize');
    if (auth != null) {
      const loggedUserData = JSON.parse(auth);
      const decodedToken = this.jwt_decode.decodeToken(loggedUserData.accessToken);
      const isExpired = decodedToken.exp < Math.floor(Date.now() / 1000) + 60 * 4;
      return of(isExpired);
    }
    return of(true); // Assume token is expired if not found
  }

  get(apiUrl: string, user_id: string) {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._http.get(`${this.host}${apiUrl}/${user_id}`, {
      headers,
      responseType: 'text',
    });
  }

  updateUserInfo(apiUrl: string, data: any) {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._http.put(`${this.host}${apiUrl}`, data, { headers });
  }

  postFileTranlate(apiUrl: string, data: any) {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data, { headers });
  }

  postFreeFileTranlate(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data, { headers });
  }

  postLog(apiUrl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postReg(apiUrl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  patchChangePassword(apiUrl: string, data: any) {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this._http.patch(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postContent(apiUrl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postTranslate(apiUrl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postCopyright(apiUrl: string, data: any) {
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  postScript(apiUrl: string, data: any) {
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  postEmail(apiUrl: string, data: any) {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postFreeEmail(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    localStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  hasExceededFreeRequests(): boolean {
    const requested = Number(localStorage.getItem('requestCount'));
    return requested >= this.maxFreeRequests;
  }
}
