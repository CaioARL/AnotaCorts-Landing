/**
 * Configuração das lojas de aplicativos.
 * Adicione a URL quando o app estiver disponível na loja correspondente.
 * null = ainda não disponível (o botão ficará desabilitado).
 */
export interface AppStoreUrls {
  googlePlay: string | null;
  appleAppStore: string | null;
}

export const APP_STORE_URLS: AppStoreUrls = {
  googlePlay: 'https://play.google.com/store/apps/details?id=com.business.ia.AnotaCorts&pcampaignid=web_share',
  appleAppStore: 'https://apps.apple.com/us/app/anota-corts/id6761080093',
};
