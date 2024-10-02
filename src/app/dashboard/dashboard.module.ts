import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
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
import { LawyerComponent } from './chats/lawyer/lawyer.component';
import { FinanceComponent } from './chats/finance/finance.component';
import { GreetingComponent } from '../shared/components/greeting/greeting.component';
import { MailComponent } from './modules/mail/mail.component';
import { TranslateComponent } from './modules/translate/translate.component';
import { HistoryComponent } from './user/history/history.component';
import { AuthRequireComponent } from '../shared/components/auth-require/auth-require.component';
import { AccountDeleteComponent } from './user/account-delete/account-delete.component';

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
    LawyerComponent,
    MailComponent,
    FinanceComponent,
    TranslateComponent,
    GreetingComponent,
    HistoryComponent,
    AuthRequireComponent,
    AccountDeleteComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    TranslocoRootModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule
  ],
})
export class DashboardModule {}
