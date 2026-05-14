/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.2.0',
  releaseDate: '14/05/2026 às 11:30',
  environment: 'production',
};
