import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideEchartsCore } from 'ngx-echarts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    // Import dinamico: echarts (~1 MB) vira um chunk separado, carregado apenas
    // quando um grafico e renderizado (pagina /metricas), fora do bundle inicial.
    provideEchartsCore({ echarts: () => import('echarts') }),
  ],
};
