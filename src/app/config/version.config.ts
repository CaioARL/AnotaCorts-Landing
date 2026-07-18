/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.3.2',
  releaseDate: '17/07/2026 às 21:11',
  environment: 'production',
};
