import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextComponent } from '../../dashboard/modules/translate-options/text/text.component';

@Injectable({
  providedIn: 'root'
})
export class TranslateActiveService {
  private activeComponentSource = new BehaviorSubject<any>(TextComponent);
  activeComponent$ = this.activeComponentSource.asObservable();

  setActiveComponent(component: any) {
    this.activeComponentSource.next(component);
  }
}
