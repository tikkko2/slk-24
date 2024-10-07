import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MailComponent } from './dashboard/modules/mail/mail.component';
import { TranslateComponent } from './dashboard/modules/translate/translate.component';
import { CopyrightComponent } from './dashboard/modules/copyright/copyright.component';
import { ScriptComponent } from './dashboard/modules/script/script.component';
import { DescriptionComponent } from './dashboard/modules/description/description.component';
import { ProfileComponent } from './dashboard/user/profile/profile.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { authGuard } from './guard/auth.guard';
import { userGuard } from './guard/user.guard';
import { BalanceComponent } from './dashboard/user/balance/balance.component';
import { LawyerComponent } from './dashboard/chats/lawyer/lawyer.component';
import { HistoryComponent } from './dashboard/user/history/history.component';
import { MainComponent } from './home/main/main.component';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './home/blog/blog.component';
import { confirmExitGuard } from './guard/confirm-exit.guard';
import { PrivacyPolicyComponent } from './home/privacy-policy/privacy-policy.component';
import { TermsComponent } from './home/terms/terms.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'services/translate',
    pathMatch: 'full'
  },
  {
    path: 'services',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'translate', pathMatch: 'full' },
      {
        path: 'translate',
        component: TranslateComponent,
      },
      {
        path: 'mail',
        component: MailComponent
      },
      {
        path: 'copyright',
        component: CopyrightComponent,
      },
      {
        path: 'script',
        component: ScriptComponent
      },
      {
        path: 'description',
        component: DescriptionComponent
      },
      {
        path: 'lawyer',
        component: LawyerComponent
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [userGuard]
      },
      {
        path: 'balance',
        component: BalanceComponent,
        canActivate: [userGuard]
      },
      {
        path: 'history',
        component: HistoryComponent,
        canActivate: [userGuard]
      }
    ]
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [authGuard]
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [authGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: MainComponent
      },
      {
        path: 'main',
        component: MainComponent,
      },
      {
        path: 'blog',
        component: BlogComponent,
      },
      {
        path: 'privacy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'terms',
        component: TermsComponent
      }
    ]
  },
  { path: '**', component: ErrorComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
