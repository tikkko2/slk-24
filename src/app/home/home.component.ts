import { AfterViewInit, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private w = window.innerWidth;
  private h = window.innerHeight;
  private rate = 60;
  private arc = 100;
  private time = 0;
  private count = 0;
  private size = 7;
  private speed = 4;
  private parts: any[] = [];
  private colors = ['#0000FF', '#ADD8E6', '#D3D3D3'];
  private mouse = { x: 0, y: 0 };

  constructor(
    private _router: Router,
  ) {}

  goToServices() {
    this._router.navigate(['/services']);
  }

  goToSignIn() {
    this._router.navigate(['/sign-in']);
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.createParticles();
    this.animateParticles();

    // Add mousemove event listener
    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
  }

  createParticles() {
    this.parts = [];
    for (let i = 0; i < this.arc; i++) {
      this.parts.push({
        x: Math.ceil(Math.random() * this.w),
        y: Math.ceil(Math.random() * this.h),
        toX: Math.random() * 5 - 1,
        toY: Math.random() * 2 - 1,
        c: this.colors[Math.floor(Math.random() * this.colors.length)],
        size: Math.random() * this.size
      });
    }
  }

  animateParticles() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (let i = 0; i < this.arc; i++) {
      const part = this.parts[i];
      const distanceFactor = Math.max(Math.min(15 - (this.distanceBetween(this.mouse, part) / 10), 10), 1);

      this.ctx.beginPath();
      this.ctx.arc(part.x, part.y, part.size * distanceFactor, 0, Math.PI * 2, false);
      this.ctx.fillStyle = part.c;
      this.ctx.strokeStyle = part.c;

      if (i % 2 === 0) {
        this.ctx.stroke();
      } else {
        this.ctx.fill();
      }

      part.x = part.x + part.toX * (this.time * 0.05);
      part.y = part.y + part.toY * (this.time * 0.05);

      if (part.x > this.w) part.x = 0;
      if (part.y > this.h) part.y = 0;
      if (part.x < 0) part.x = this.w;
      if (part.y < 0) part.y = this.h;
    }

    if (this.time < this.speed) {
      this.time++;
    }

    setTimeout(() => this.animateParticles(), 1000 / this.rate);
  }

  mouseMove(event: MouseEvent) {
    this.mouse.x = event.offsetX;
    this.mouse.y = event.offsetY;
  }

  distanceBetween(p1: any, p2: any): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  @HostListener('window:resize')
  onResize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.createParticles(); // Recreate particles on resize
  }
 }
