import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.scss'
})
export class GreetingComponent {
  isSmallScreen: boolean = false;

  @Input() title!: string;
  @Input() description1!: string;
  @Input() description2!: string;
}
