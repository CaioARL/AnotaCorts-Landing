/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.3.1',
  releaseDate: '12/07/2026 às 18:05',
  environment: 'production',
};
