import {
  provideTransloco,
  TranslocoModule
} from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-loader';
import { environment } from '../environments/environment.development';

@NgModule({
  exports: [ TranslocoModule ],
  providers: [
      provideTransloco({
        config: {
          availableLangs: ['en', 'ge'],
          defaultLang: 'ge',
          reRenderOnLangChange: true,
          prodMode: environment.production,
        },
        loader: TranslocoHttpLoader
      }),
  ],
})
export class TranslocoRootModule {}
