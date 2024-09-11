import { Component } from '@angular/core';
import { TextComponent } from '../translate-options/text/text.component';
import { ImageComponent } from '../translate-options/image/image.component';
import { DocComponent } from '../translate-options/doc/doc.component';
import { TranslateActiveService } from '../../../shared/services/translate-active.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.scss',
})
export class TranslateComponent {
  activeComponent: any = TextComponent;
  activeButton: 'text' | 'image' | 'doc' | null = 'text';

  constructor(
    private _translateActive: TranslateActiveService
  ) {}

  ngOnInit() {
    this._translateActive.activeComponent$.subscribe((component) => {
      this.activeComponent = component;
    });
  }

  onText() {
    this.activeButton = 'text';
    this.activeComponent = TextComponent;
  }

  onImage() {
    this.activeButton = 'image';
    this.activeComponent = ImageComponent;
  }

  onDoc() {
    this.activeButton = 'doc';
    this.activeComponent = DocComponent;
  }
}
