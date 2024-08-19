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
        path: 'profile',
        component: ProfileComponent
      }
    ]
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  { path: '**', component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
