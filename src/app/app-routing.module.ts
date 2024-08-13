import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MailComponent } from './dashboard/modules/mail/mail.component';
import { TranslateComponent } from './dashboard/modules/translate/translate.component';
import { CopyrightComponent } from './dashboard/modules/copyright/copyright.component';
import { ScriptComponent } from './dashboard/modules/script/script.component';
import { DescriptionComponent } from './dashboard/modules/description/description.component';
import { ProfileComponent } from './dashboard/user/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'services/mail',
    pathMatch: 'full'
  },
  {
    path: 'services',
    component: DashboardComponent,
    children: [
      {
        path: 'mail',
        component: MailComponent
      },
      {
        path: 'translate',
        component: TranslateComponent,
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
