import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { url } from '../../shared/data/api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private _apiService: HttpService) {}

  authorize(data: any) {
    return this._apiService.postAuth(url.login, data);
  }

  register(data: any) {
    return this._apiService.postAuth(url.register, data);
  }
}
