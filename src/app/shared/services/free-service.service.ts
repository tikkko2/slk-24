import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FreeServiceService {
  private fakeToken = new BehaviorSubject<string | undefined>(undefined);

  setToken(name: any) {
    this.fakeToken.next(name);
  }

  getToken(): Observable<string | undefined> {
    return this.fakeToken.asObservable();
  }
}
