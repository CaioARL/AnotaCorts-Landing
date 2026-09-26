import { GENERATED_ENV } from './env.generated';

export const environment = {
  production: false,
  // Em desenvolvimento aponte para o backend local (ajuste a porta se necessário).
  // Mantenha a URL de produção se quiser testar contra a API real.
  apiBaseUrl: 'https://api.anotacorts.com.br/anota-corts',
  // Chave dos mapas raster da CARTO (globo da home), lida do .env por scripts/set-env.js.
  // Fica visível no navegador: restrinja os domínios permitidos no painel da CARTO.
  cartoBasemapsKey: GENERATED_ENV.cartoBasemapsKey,
};
