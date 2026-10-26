import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideEchartsCore } from 'ngx-echarts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Ao abrir outra página pelo link, começa no topo (o padrão do Angular mantinha a rolagem
    // da página anterior); no "Voltar" do navegador, volta para onde a pessoa estava.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    // Import dinamico: echarts (~1 MB) vira um chunk separado, carregado apenas
    // quando um grafico e renderizado (pagina /metricas), fora do bundle inicial.
    provideEchartsCore({ echarts: () => import('echarts') }),
  ],
};
