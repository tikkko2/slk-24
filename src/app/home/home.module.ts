import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoRootModule } from '../transloco-root.module';
import { HomeComponent } from './home.component';
import { MainComponent } from './main/main.component';
import { BlogComponent } from './blog/blog.component';

@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    BlogComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    TranslocoRootModule,
  ],
})
export class HomeModule {}
