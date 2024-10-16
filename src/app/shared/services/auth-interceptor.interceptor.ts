import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { catchError, from, of, switchMap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(AuthService);
  const apiService = inject(HttpService);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  let loggedUserData: any;
  let isLoggedIn = userService.IsLoggedIn();

  if (isLoggedIn) {
    const storedData = localStorage.getItem('authorize');
    if (storedData != null) {
      loggedUserData = JSON.parse(storedData);
    }
  }

  return from(isLoggedIn ? apiService.isTokenExpired() : of(false)).pipe(
    switchMap((isExpired) => {
      if (isLoggedIn && isExpired && !apiService.refreshInProgress) {
        apiService.refreshInProgress = true;
        return apiService.getRefreshToken().pipe(
          switchMap(() => {
            const refreshedData = localStorage.getItem('authorize');
            if (refreshedData) {
              loggedUserData = JSON.parse(refreshedData);
              if(loggedUserData.accessToken && loggedUserData.refreshToken) {
                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${loggedUserData.accessToken}`,
                  },
                });
              }
            }
            apiService.refreshInProgress = false;
            return next(req);
          }),
          catchError((err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                console.error('Unauthorized request:', err);
                userService.ClearSession();
              } else {
                // console.error('HTTP error:', err);
                router.navigate(['']);
                // userService.ClearSession();
                if (err.error.errorText != undefined) {
                  // toastr.error(`${err.error.errorText}`);
                }
              }
            } else {
              console.error('An error occurred:', err);
            }
            return throwError(() => err);
          })
        );
      } else {
        if (loggedUserData) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${loggedUserData.accessToken}`,
            },
          });
        }
        return next(req);
      }
    }),
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          console.error('Unauthorized request:', err);
          userService.ClearSession();
        } else {
          // console.error('HTTP error:', err);
          router.navigate(['']);
          // userService.ClearSession();
          if (err.error.errorText != undefined) {
            // toastr.error(`${err.error.errorText}`);
          }
        }
      } else {
        console.error('An error occurred:', err);
      }
      return throwError(() => err);
    })
  );
};
