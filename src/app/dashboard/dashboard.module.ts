import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { CopyrightComponent } from './modules/copyright/copyright.component';
import { ScriptComponent } from './modules/script/script.component';
import { DescriptionComponent } from './modules/description/description.component';
import { ProfileComponent } from './user/profile/profile.component';
import { TranslocoRootModule } from '../transloco-root.module';

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    HeaderComponent,
    CopyrightComponent,
    ScriptComponent,
    DescriptionComponent,
    ProfileComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    TranslocoRootModule
  ],
})
export class DashboardModule {}
