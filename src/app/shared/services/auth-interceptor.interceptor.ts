import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, concatMap, filter, finalize, from, Observable, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private cachedRequests: HttpRequest<any>[] = [];

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._authService.accessToken();
    let authReq = req;

    if(token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err.status === 401 && err instanceof HttpErrorResponse && !req.url.includes('refresh-token')) {
          return this.handle401Error(authReq, next);
        } else {
          return throwError(() => err);
        }
      })
    )
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({headers: request.headers.set('Authorization', 'Bearer ' + token)})
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      this.cachedRequests.push(req);
      return this._authService.refreshAccessToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.token;
          const newRefreshToken = response.refreshToken;
          if(newToken) {
            this._authService.setTokens(newToken, newRefreshToken);
            this.refreshTokenSubject.next(newToken);
            return from(this.cachedRequests).pipe(
              concatMap((request) => next.handle(this.addTokenHeader(request, newToken))),
              finalize(() => {this.cachedRequests = []})
            )
          } else {
            this._authService.logOut();
            this._router.navigate(['/services']);
            return throwError(() => new Error('No token returned.'))
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          if(err.status === 401 || err.status === 400) {
            this._authService.logOut();
            this._router.navigate(['/services']);
          }
          return throwError(() => err)
        }),
        finalize(() => {this.isRefreshing = false;})
      )
    } else {
      this.cachedRequests.push(req)
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenHeader(req, token as string));
        })
      )
    }
  }
}
