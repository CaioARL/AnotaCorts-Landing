/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.4.3',
  releaseDate: '26/09/2026 às 22:31',
  environment: 'production',
};
