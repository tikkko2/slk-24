import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarShownSubject = new BehaviorSubject<boolean>(true);
  sidebarShown$ = this.sidebarShownSubject.asObservable();

  toggleSidebar() {
    this.sidebarShownSubject.next(!this.sidebarShownSubject.value);
  }

  setSidebarShown(shown: boolean) {
    this.sidebarShownSubject.next(shown);
  }
}
