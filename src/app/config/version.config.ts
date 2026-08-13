/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.4.2',
  releaseDate: '13/08/2026 às 11:21',
  environment: 'production',
};
