import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  private balance = new BehaviorSubject<number | undefined>(undefined);

  setBalance(name: any) {
    this.balance.next(name);
  }

  getBalance(): Observable<number | undefined> {
    return this.balance.asObservable();
  }
}
