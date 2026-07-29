/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.4.0',
  releaseDate: '29/07/2026 às 09:47',
  environment: 'production',
};
