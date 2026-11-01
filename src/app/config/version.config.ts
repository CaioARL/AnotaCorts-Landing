/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '2.0.0',
  releaseDate: '01/11/2026 às 14:56',
  environment: 'production',
};
