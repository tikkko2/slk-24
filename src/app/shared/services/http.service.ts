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
    private freeService: FreeServiceService,
  ) {
    this.host = environment.apiUrl;
  }

  loginWithFacebook(apiurl: any, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._http.post(`${this.host}${apiurl}`, data, { headers, withCredentials: true })
  }

  get(apiUrl: string, user_id: string) {
    return this._http.get(`${this.host}${apiUrl}/${user_id}`, {
      responseType: 'text',
    });
  }

  updateUserInfo(apiUrl: string, data: any) {
    return this._http.put(`${this.host}${apiUrl}`, data);
  }

  postAuth(apiUrl: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  deleteAcc(apiurl: string, data: any) {
    return this._http.delete(`${this.host}${apiurl}`, {
      params: data,
    });
  }

  patchChangePassword(apiUrl: string, data: any) {
    return this._http.patch(`${this.host}${apiUrl}`, JSON.stringify(data));
  }

  postTranslate(apiUrl: string, data: any) {
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  postFreeTranslate(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data, { headers });
  }

  postFreeContent(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data, {
      headers,
    });
  }

  postContent(apiUrl: string, data: any) {
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  postFreeWriter(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data, { headers });
  }

  postWriter(apiUrl: string, data: any) {
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  postEmail(apiUrl: string, data: any) {
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data));
  }

  postFreeEmail(apiUrl: string, data: any) {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
      'Content-Type': 'application/json',
    });
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  postLawyer(apiUrl: string, data: any) {
    this.requestCount++;
    sessionStorage.setItem('requestCount', this.requestCount.toString());
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._http.post(`${this.host}${apiUrl}`, JSON.stringify(data), {
      headers,
    });
  }

  enhanceTranslation(apiUrl: string, data: any) {
    return this._http.post(`${this.host}${apiUrl}`, data);
  }

  hasExceededFreeRequests(): boolean {
    const requested = Number(sessionStorage.getItem('requestCount'));
    return requested >= this.maxFreeRequests;
  }
}
