import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { JwtDecodeService } from './jwt-decode.service';
import { Observable, of, tap, throwError } from 'rxjs';
import { url } from '../data/api';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private host: string;
  public accessToken = signal<string>('');
  public refreshToken = signal<string>('');
  public userInfo = computed(() => this.jwt_decode.decodeToken(this.accessToken()));

  public isAuthenticated = computed(() => this.accessToken()?.length > 0);
  public readonly localStorageAccessTokenName = 'accessToken';
  public readonly localStorageRefreshTokenName = 'refreshToken';

  constructor(
    private http: HttpClient,
    private jwt_decode: JwtDecodeService
  ) {
    this.host = environment.apiUrl;
    const localAccessToken = localStorage.getItem(this.localStorageAccessTokenName);
    if(localAccessToken) {
      this.accessToken.set(localAccessToken);
    }
    const localRefreshToken = localStorage.getItem(this.localStorageRefreshTokenName);
    if(localRefreshToken) {
      this.refreshToken.set(localRefreshToken);
    }
  }

  signIn(email: string, password: string): Observable<any> {
    if(this.isAuthenticated()) return throwError(() => new Error('User Already Authenticated'));

    return this.http.post(`${this.host}${url.login}`, {userName: email, password: password})
        .pipe(
          tap((x: any) => {
            this.setTokens(x.token, x.refreshToken);
          })
        );
  }

  refreshAccessToken(): Observable<any> {
    return this.http.post(`${this.host}${url.refresh}`, {accessToken: this.accessToken(), refreshToken: this.refreshToken()})
        .pipe(
          tap((x: any) => {
            this.setTokens(x.token, x.refreshToken);
          })
        );
  }

  logOut(): Observable<any> {
    localStorage.removeItem(this.localStorageAccessTokenName);
    localStorage.removeItem(this.localStorageRefreshTokenName);
    this.accessToken.set('');
    this.refreshToken.set('');
    return of(true);
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.localStorageAccessTokenName, accessToken);
    localStorage.setItem(this.localStorageRefreshTokenName, refreshToken);
    this.accessToken.set(accessToken);
    this.refreshToken.set(refreshToken);
  }
}
