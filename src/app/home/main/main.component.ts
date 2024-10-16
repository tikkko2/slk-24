import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  isLoggedIn!: boolean;
  card1Active = false;
  card2Active = false;
  card3Active = false;

  servicesCount = 0;
  activeUsersCount = 0;
  partnersCount = 0;

  private servicesTarget = 6;
  private activeUsersTarget = 48;
  private partnersTarget = 9;
  private hasAnimated = false;

  constructor(
    private _router: Router,
    private _auth: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this._auth.isAuthenticated();
  }

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

  animateCounter(
    property: 'servicesCount' | 'activeUsersCount' | 'partnersCount',
    target: number
  ): void {
    const interval = setInterval(() => {
      if (this[property] < target) {
        this[property]++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

  goToServices() {
    this._router.navigate(['/services']);
  }

  goToSignUp() {
    this._router.navigate(['/sign-up']);
  }

  goToTranslate() {
    this._router.navigate(['/services/translate']);
  }

  goToDesc() {
    this._router.navigate(['/services/description']);
  }

  goToAds() {
    this._router.navigate(['/services/copyright']);
  }
}
