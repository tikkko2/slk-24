import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category.interface';
import { FreeServiceService } from './free-service.service';
import { Language } from '../interfaces/language.interface';
import { RequestHistory } from '../interfaces/request-history.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private host: string;
  fakeToken: any;

  constructor(
    private http: HttpClient,
    private freeService: FreeServiceService,
  ) {
    this.host = environment.apiUrl;
  }

  getProductCategory(apiUrl: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.host}${apiUrl}`);
  }

  getFreeProductCategory(apiUrl: string): Observable<Category[]> {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    return this.http.get<Category[]>(`${this.host}${apiUrl}`, {headers});
  }

  getLanguage(apiUrl: string): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.host}${apiUrl}`);
  }

  getFreeLanguage(apiUrl: string): Observable<Language[]> {
    this.freeService.getToken().subscribe((value) => (this.fakeToken = value));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.fakeToken}`,
    });
    return this.http.get<Language[]>(`${this.host}${apiUrl}`, {headers});
  }

  getHistory(apiUrl: string, userId: string): Observable<RequestHistory[]> {
    return this.http.get<RequestHistory[]>(`${this.host}${apiUrl}${userId}`);
  }
}
