import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  card1Active = false;
  card2Active = false;
  card3Active = false;

  toggleCard(cardNumber: number) {
    switch (cardNumber) {
      case 1:
        this.card1Active = !this.card1Active;
        break;
      case 2:
        this.card2Active = !this.card2Active;
        break;
      case 3:
        this.card3Active = !this.card3Active;
        break;
      default:
        break;
    }
  }

  servicesCount = 0;
  activeUsersCount = 0;
  partnersCount = 0;

  private servicesTarget = 6;
  private activeUsersTarget = 48;
  private partnersTarget = 9;
  private hasAnimated = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    const element = document.getElementById('counter-section');
    if (element) {
      const rect = element.getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (inView && !this.hasAnimated) {
        this.startCounter();
        this.hasAnimated = true;
      }
    }
  }

  startCounter(): void {
    this.animateCounter('servicesCount', this.servicesTarget);
    this.animateCounter('activeUsersCount', this.activeUsersTarget);
    this.animateCounter('partnersCount', this.partnersTarget);
  }

  animateCounter(property: 'servicesCount' | 'activeUsersCount' | 'partnersCount', target: number): void {
    const interval = setInterval(() => {
      if (this[property] < target) {
        this[property]++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }
}
