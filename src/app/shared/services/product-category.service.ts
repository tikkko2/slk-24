import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category.interface';
import { FreeServiceService } from './free-service.service';
import { Language } from '../interfaces/language.interface';
import { RequestHistory } from '../interfaces/request-history.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private host: string;
  fakeToken: any;

  constructor(
    private http: HttpClient,
    private freeService: FreeServiceService
  ) {
    this.host = environment.apiUrl;
  }

  getProductCategory(apiUrl: string): Observable<Category[]> {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Category[]>(`${this.host}${apiUrl}`, {headers});
  }

  getFreeProductCategory(apiUrl: string): Observable<Category[]> {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    return this.http.get<Category[]>(`${this.host}${apiUrl}`, {headers});
  }

  getLanguage(apiUrl: string): Observable<Language[]> {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Language[]>(`${this.host}${apiUrl}`, {headers});
  }

  getFreeLanguage(apiUrl: string): Observable<Language[]> {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    return this.http.get<Language[]>(`${this.host}${apiUrl}`, {headers});
  }

  getHistory(apiUrl: string, userId: string): Observable<RequestHistory[]> {
    const auth: any = localStorage.getItem('authorize');
    const newToken = JSON.parse(auth);
    const token: string = newToken.accessToken;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<RequestHistory[]>(`${this.host}${apiUrl}${userId}`, {headers});
  }
}
