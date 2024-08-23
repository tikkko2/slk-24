import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { CopyrightComponent } from './modules/copyright/copyright.component';
import { ScriptComponent } from './modules/script/script.component';
import { DescriptionComponent } from './modules/description/description.component';
import { ProfileComponent } from './user/profile/profile.component';
import { TranslocoRootModule } from '../transloco-root.module';
import { BalanceComponent } from './user/balance/balance.component';
import { TextComponent } from './modules/translate-options/text/text.component';
import { ImageComponent } from './modules/translate-options/image/image.component';
import { DocComponent } from './modules/translate-options/doc/doc.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    HeaderComponent,
    CopyrightComponent,
    ScriptComponent,
    DescriptionComponent,
    ProfileComponent,
    BalanceComponent,
    TextComponent,
    ImageComponent,
    DocComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    TranslocoRootModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule
  ],
})
export class DashboardModule {}
