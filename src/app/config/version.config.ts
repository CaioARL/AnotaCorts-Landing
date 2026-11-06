/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '2.3.0',
  releaseDate: '06/11/2026 às 09:48',
  environment: 'production',
};
