/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '1.1.0',
  releaseDate: '08/05/2026 às 17:15',
  environment: 'production',
};
