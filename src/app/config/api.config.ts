import { environment } from '../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

/** Chave dos mapas raster da CARTO; sem ela os tiles vêm com a marca "API KEY REQUIRED". */
export const CARTO_BASEMAPS_KEY = environment.cartoBasemapsKey;
