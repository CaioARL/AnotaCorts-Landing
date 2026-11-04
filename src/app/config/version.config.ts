/**
 * Configuração de versionamento do site.
 */
export interface AppVersion {
  version: string;
  releaseDate: string;
  environment: string;
}

export const APP_VERSION: AppVersion = {
  version: '2.1.1',
  releaseDate: '04/11/2026 às 20:35',
  environment: 'production',
};
