import { Component } from '@angular/core';
import { TextComponent } from '../translate-options/text/text.component';
import { ImageComponent } from '../translate-options/image/image.component';
import { DocComponent } from '../translate-options/doc/doc.component';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.scss',
})
export class TranslateComponent {
  activeComponent: any = TextComponent;
  activeButton: 'text' | 'image' | 'doc' | null = 'text';

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
