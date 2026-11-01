/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '2.1.0',
  releaseDate: '01/11/2026 às 15:47',
  environment: 'production',
};
