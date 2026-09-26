import { GENERATED_ENV } from './env.generated';

export const environment = {
  production: true,
  apiBaseUrl: 'https://api.anotacorts.com.br/anota-corts',
  // Chave dos mapas raster da CARTO (globo da home), lida do .env por scripts/set-env.js.
  // Fica visível no navegador: restrinja os domínios permitidos no painel da CARTO.
  cartoBasemapsKey: GENERATED_ENV.cartoBasemapsKey,
};
